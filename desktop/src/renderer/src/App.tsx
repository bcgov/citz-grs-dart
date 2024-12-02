import { useEffect, useState } from "react";
//@ts-ignore
import { SideNav, VPNPopup } from "./components";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FileListPage, HomePage, SendRecordsPage } from "./pages";

function App(): JSX.Element {
	const [api] = useState(window.api); // Preload scripts
	//@ts-ignore
	const [showVPNPopup, setShowVPNPopup] = useState<boolean | null>(null);

	// Authentication state
	const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
	const [idToken, setIdToken] = useState<string | undefined>(undefined);

	useEffect(() => {
		// Handle "auth-success" message from main process
		// Triggered upon successful login
		window.electron.ipcRenderer.on("auth-success", (_, tokens) => {
			setAccessToken(tokens.accessToken);
			setIdToken(tokens.idToken);
		});

		// Handle "token-refresh-success" message from main process
		// Triggered upon successful refresh of tokens
		window.electron.ipcRenderer.on("token-refresh-success", (_, tokens) =>
			setAccessToken(tokens.accessToken),
		);

		// Handle "auth-logout" message from main process
		// Triggered upon logout
		window.electron.ipcRenderer.on("auth-logout", () => setAccessToken(undefined));

		// Alert when auth token copied.
		window.electron.ipcRenderer.on("auth-token-copied", (_, obj) => alert(obj.message));

		// Cleanup
		return () => {
			window.electron.ipcRenderer.removeAllListeners("auth-success");
			window.electron.ipcRenderer.removeAllListeners("auth-logout");
			window.electron.ipcRenderer.removeAllListeners("token-refresh-success");
			window.electron.ipcRenderer.removeAllListeners("auth-token-copied");
		};
	}, []);

	const handleIPStatusUpdate = async () => {
		const ipStatusOK = await api.checkIpRange();
		setShowVPNPopup(!ipStatusOK);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// Check for VPN or gov Network use on load, and every 5 seconds
		handleIPStatusUpdate();
		const interval = setInterval(handleIPStatusUpdate, 5 * 1000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<BrowserRouter>
			<div>
				<SideNav accessToken={accessToken} idToken={idToken} />
				<main style={{ width: "85%", marginLeft: "15%" }}>
					<Routes>
						<Route path="/" element={<HomePage authenticated={!!accessToken} />} />
						<Route path="/file-list" element={<FileListPage accessToken={accessToken} />} />
						<Route path="/send-records" element={<SendRecordsPage />} />
					</Routes>
				</main>
				{/*{showVPNPopup && <VPNPopup />}*/}
			</div>
		</BrowserRouter>
	);
}

export default App;
