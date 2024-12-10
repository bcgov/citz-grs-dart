import {
	app,
	shell,
	BrowserWindow,
	ipcMain,
	Menu,
	clipboard,
	type MenuItemConstructorOptions,
} from "electron";
import { join } from "node:path";
import { is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import electronUpdater, { type AppUpdater } from "electron-updater";
import { createWorkerPool } from "./fileProcessing";
import {
	copyFolderAndMetadata,
	getFolderMetadata,
	selectDirectory,
	submitFileList,
} from "./fileProcessing/actions";
import type { SSOUser, IdirIdentityProvider } from "@bcgov/citz-imb-sso-js-core";

app.setName("Digital Archives Transfer Service");

const DEBUG = is.dev;

let mainWindow: BrowserWindow;
let authWindow: BrowserWindow | null = null;
let refreshInterval: NodeJS.Timeout | undefined;

const tokens: Record<string, string | undefined> = {
	accessToken: undefined,
	refreshToken: undefined,
	idToken: undefined,
	accessExpiresIn: undefined,
	refreshExpiresIn: undefined,
};

// API URL constants
const LOCAL_API_URL = "http://localhost:3200";
const DEV_API_URL = "https://dev.api.com";
const TEST_API_URL = "https://test.api.com";
const PROD_API_URL = "https://prod.api.com";

// Set initial API URL based on environment
let currentApiUrl = is.dev ? LOCAL_API_URL : PROD_API_URL;

const pool = createWorkerPool();

const debug = (log: string) => {
	if (DEBUG) console.info(log);
};

// Update API URL
const setApiUrl = (apiUrl: string) => {
	currentApiUrl = apiUrl;
	mainWindow.webContents.send("api-url-changed", apiUrl);
};

function createWindow(): void {
	mainWindow = new BrowserWindow({
		minWidth: 1200,
		minHeight: 750,
		show: false,
		autoHideMenuBar: false,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.mjs"),
			sandbox: false,
		},
	});

	mainWindow.on("ready-to-show", () => {
		const menu = Menu.buildFromTemplate(menuTemplate as MenuItemConstructorOptions[]);
		Menu.setApplicationMenu(menu);
		mainWindow.setTitle(app.getName()); // Sets name in top left corner of window.
		mainWindow.maximize();
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	if (is.dev && process.env.ELECTRON_RENDERER_URL) {
		mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}
}

ipcMain.handle("get-current-api-url", () => {
	return currentApiUrl;
});

ipcMain.handle("start-login-process", async () => {
	debug('Beginning "start-login-process" of main process.');

	// Create a new browser window for the authentication process
	authWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	authWindow.loadURL(`${currentApiUrl}/auth/login`);

	// Listen for redirect navigation to the callback URL with the code parameter
	authWindow.webContents.on("did-redirect-navigation", async (_event, url) => {
		const urlObj = new URL(url);
		if (urlObj.pathname === "/auth/login/callback") {
			const code = urlObj.searchParams.get("code");
			if (code) {
				try {
					setTimeout(async () => {
						const cookies = await authWindow?.webContents.session.cookies.get({
							url: currentApiUrl,
						});

						if (!cookies || cookies?.length === 0)
							throw new Error("No cookies found for the session.");

						// Find cookies that contain the token information
						cookies.forEach((cookie) => {
							if (cookie.name === "access_token") tokens.accessToken = cookie.value;
							if (cookie.name === "refresh_token") tokens.refreshToken = cookie.value;
							if (cookie.name === "id_token") tokens.idToken = cookie.value;
							if (cookie.name === "expires_in") tokens.accessExpiresIn = cookie.value;
							if (cookie.name === "refresh_expires_in") tokens.refreshExpiresIn = cookie.value;
						});

						// Notify the renderer process and schedule token refreshing
						if (tokens.accessToken && tokens.refreshToken) {
							debug("Tokens retrieved from cookies.");
							scheduleRefreshTokens();
							mainWindow.webContents.send("auth-success", tokens);
						} else throw new Error("Required tokens not found in cookies.");
					}, 1000);
				} catch (error) {
					console.error("Error during login process:", error);
					authWindow?.close(); // Close the window even in case of error
					authWindow = null;
				} finally {
					// Hide window
					authWindow?.hide();
				}
			}
		}
	});

	// Handle the case where the user closes the auth window manually
	authWindow.on("closed", () => {
		authWindow = null;
	});
});

ipcMain.handle("start-logout-process", async (_, idToken: string) => {
	debug('Beginning "start-logout-process" of main process.');

	// Open a new window for the logout process
	if (!authWindow) {
		authWindow = new BrowserWindow({
			width: 800,
			height: 600,
			webPreferences: {
				nodeIntegration: false,
				contextIsolation: true,
			},
		});
	}

	authWindow.loadURL(`${currentApiUrl}/auth/logout?id_token=${idToken}`);

	authWindow.webContents.on("did-redirect-navigation", async (_event, url) => {
		if (url.includes("/auth/logout/callback")) clearAuthState();
	});

	authWindow.on("closed", () => {
		authWindow = null;
	});
});

ipcMain.handle(
	"copy-folder-and-metadata",
	async (_, { filePath, transfer }: { filePath: string; transfer: string }) => {
		debug('Beginning "copy-folder-and-metadata" of main process.');

		await copyFolderAndMetadata(pool, filePath, transfer, is.dev);
	},
);

ipcMain.on("get-folder-metadata", async (event, { filePath }: { filePath: string }) => {
	debug('Beginning "get-folder-metadata" of main process.');

	const onProgress = (data: {
		progressPercentage: number;
		source: string;
	}) => {
		event.sender.send("folder-metadata-progress", data);
	};

	const onCompletion = (data: {
		success: boolean;
		metadata?: Record<string, unknown>;
		error?: unknown;
	}) => {
		event.sender.send("folder-metadata-completion", data);
	};

	try {
		await getFolderMetadata(pool, filePath, is.dev, false, onProgress, onCompletion);
	} catch (error) {
		console.error(`Error in get-folder-metadata: ${error}`);
		onCompletion({ success: false, error });
	}
});

ipcMain.handle("file-list-submit", (_event, formData: string, metadata: string, user: string) => {
	debug('Begninning "file list submit" of main process.');

	try {
		submitFileList(formData, metadata, user);
		//event.sender.send("file-list-submitted", res);
	} catch (error) {
		console.error(`Error in file-list-submit: ${error}`);
		//event.sender.send("file-list-submitted", { success: false, error });
	}
});

ipcMain.handle("select-directory", () => {
	debug('Beginning "select-directory" of main process.');
	// returns selected folder or undefined if no folder was selected
	return selectDirectory(mainWindow);
});

const clearAuthState = () => {
	debug("Beginning clearAuthState function of main process.");

	// Close auth window
	authWindow?.close();
	authWindow = null;

	mainWindow.webContents.send("auth-logout");

	clearInterval(refreshInterval);
	tokens.accessToken = undefined;
	tokens.refreshToken = undefined;
	tokens.idToken = undefined;
	tokens.accessExpiresIn = undefined;
	tokens.refreshExpiresIn = undefined;
};

const scheduleRefreshTokens = () => {
	debug("Beginning scheduleRefreshTokens function of main process.");

	if (!tokens.refreshExpiresIn || !tokens.accessExpiresIn)
		return console.error("Missing token expiry values after login.");

	const { accessExpiresIn, refreshExpiresIn } = tokens;

	// Clear any existing intervals before setting a new one
	if (refreshInterval) clearInterval(refreshInterval);

	// Refresh tokens
	refreshInterval = setInterval(() => {
		refreshTokens();
	}, Number(accessExpiresIn) * 1000);

	// Clear auth state when refresh token expires.
	setTimeout(() => {
		clearAuthState();
		return;
	}, Number(refreshExpiresIn) * 1000);
};

const refreshTokens = async () => {
	debug("Beginning refreshTokens function of main process.");

	if (authWindow) {
		try {
			authWindow.loadURL(`${currentApiUrl}/auth/token`);

			setTimeout(async () => {
				const cookies = await authWindow?.webContents.session.cookies.get({
					url: currentApiUrl,
				});

				if (!cookies || cookies?.length === 0) throw new Error("No cookies found for the session.");

				// Find cookies that contain the token information
				cookies.forEach((cookie) => {
					if (cookie.name === "access_token") tokens.accessToken = cookie.value;
				});

				// Send the updated tokens to the renderer process
				mainWindow.webContents.send("token-refresh-success", tokens);
			}, 1000);
		} catch (error) {
			console.error("Error executing refreshTokens in authWindow:", error);
		}
	}
};

const menuTemplate = [
	...(process.platform === "darwin" ? [{ label: app.getName(), submenu: [{ role: "quit" }] }] : []),
	{ role: "viewMenu" },
	{
		label: "Edit",
		submenu: [
			{
				label: "Select Environment",
				submenu: [
					{
						label: "Local",
						type: "radio",
						checked: currentApiUrl === LOCAL_API_URL,
						click: () => setApiUrl(LOCAL_API_URL),
					},
					{
						label: "Dev",
						type: "radio",
						checked: currentApiUrl === DEV_API_URL,
						click: () => setApiUrl(DEV_API_URL),
					},
					{
						label: "Test",
						type: "radio",
						checked: currentApiUrl === TEST_API_URL,
						click: () => setApiUrl(TEST_API_URL),
					},
					{
						label: "Prod",
						type: "radio",
						checked: currentApiUrl === PROD_API_URL,
						click: () => setApiUrl(PROD_API_URL),
					},
				],
			},
		],
	},
	...(is.dev
		? [
				{
					label: "Developer",
					submenu: [
						{
							label: "Copy Auth Token",
							click: () => {
								if (tokens.accessToken) {
									clipboard.writeText(tokens.accessToken);
									mainWindow.webContents.send("auth-token-copied", {
										message: "Access token copied to clipboard!",
									});
								} else {
									mainWindow.webContents.send("auth-token-copied", {
										message: "No access token available to copy.",
									});
								}
							},
						},
					],
				},
			]
		: []),
];

export function getAutoUpdater(): AppUpdater {
	// Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
	// It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
	const { autoUpdater } = electronUpdater;
	return autoUpdater;
}

app.whenReady().then(() => {
	createWindow();

	// Start checking for updates after the window is ready
	const autoUpdater = getAutoUpdater();
	autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
