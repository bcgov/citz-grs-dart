import { parentPort, workerData } from "node:worker_threads";
import path from "node:path";
import { promises as fsPromises, type Stats, createReadStream, createWriteStream } from "node:fs";
import pLimit from "p-limit";

const { stat, readdir, mkdir } = fsPromises;

type WorkerData = {
	source: string;
	destination: string;
	batchSize?: number;
};

// Type guard to check if an error is of type ErrnoException
const isErrnoException = (err: unknown): err is NodeJS.ErrnoException =>
	err instanceof Error && "code" in err;

// Ensure a directory exists or create it
const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
	try {
		await mkdir(dirPath, { recursive: true });
	} catch (err) {
		if (isErrnoException(err) && err.code === "EEXIST") return; // Ignore error if directory already exists
		throw err; // Throw the error if it's not 'EEXIST'
	}
};

// Copy a file using streams
const copyFileStream = (sourcePath: string, destinationPath: string): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		const readStream = createReadStream(sourcePath);
		const writeStream = createWriteStream(destinationPath);

		readStream.on("error", (err) => {
			console.error(`Read error on ${sourcePath}:`, err);
			reject(err);
		});

		writeStream.on("error", (err) => {
			console.error(`Write error on ${destinationPath}:`, err);
			reject(err);
		});

		writeStream.on("finish", resolve);

		readStream.pipe(writeStream);
	});
};

// Implement a delay to throttle I/O operations
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Copy a directory in batches with concurrency limits and throttling
const copyDirectoryInBatches = async (
	source: string,
	destination: string,
	batchSize = 10,
	concurrencyLimit = 5,
): Promise<void> => {
	await ensureDirectoryExists(destination);
	const files = await readdir(source);
	const limit = pLimit(concurrencyLimit); // Set a limit on concurrent file operations

	for (let i = 0; i < files.length; i += batchSize) {
		const batch = files.slice(i, i + batchSize);

		// Process the batch with concurrency control
		await Promise.all(
			batch.map((file) =>
				limit(async () => {
					const sourcePath = path.join(source, file);
					const destinationPath = path.join(destination, file);
					const fileStat: Stats = await stat(sourcePath);

					if (fileStat.isDirectory()) {
						await copyDirectoryInBatches(sourcePath, destinationPath, batchSize, concurrencyLimit);
					} else {
						console.log(`Copying file: ${sourcePath} to ${destinationPath}`);
						await copyFileStream(sourcePath, destinationPath);
					}
				}),
			),
		);

		// Add a delay between batches to throttle I/O
		await delay(100);
	}
};

/**
 * Copy Worker
 *
 * Purpose:
 * The copy worker is designed to perform efficient, concurrent copying of directories and files
 * from a specified source path to a destination path. It handles file I/O operations in batches,
 * supports error handling, and implements concurrency control to avoid overwhelming system resources.
 *
 * Key Features:
 * 1. **Concurrency:**
 *    - The worker uses the `p-limit` library to limit the number of concurrent operations.
 *    - The `concurrencyLimit` parameter controls the maximum number of concurrent file or directory operations.
 *    - This prevents the worker from overwhelming the file system and keeps resource usage in check.
 *
 * 2. **Streams:**
 *    - The worker uses `fs.createReadStream` and `fs.createWriteStream` for file copying.
 *    - Streams allow efficient, memory-safe copying of large files by reading and writing data in chunks.
 *    - Error handling for read and write streams ensures that the worker gracefully handles I/O issues.
 *
 * 3. **Batch Processing (batchSize):**
 *    - The copying process is divided into batches, where each batch processes a fixed number of files.
 *    - The `batchSize` parameter determines how many files are processed in each batch.
 *    - Batching reduces I/O load spikes and allows the worker to manage file processing incrementally.
 *
 * 4. **pLimit:**
 *    - The `p-limit` library is used to manage the concurrency of file operations within each batch.
 *    - It ensures that no more than the specified number of operations run concurrently.
 *
 * 5. **Throttling:**
 *    - A delay is added between batches to throttle I/O operations, preventing system overload during intensive tasks.
 *
 * Definitions:
 * - **concurrencyLimit:** The maximum number of concurrent file operations allowed at any given time.
 * - **streams:** Read and write streams are used for file I/O, enabling efficient copying of files, especially large ones.
 * - **batchSize:** The number of files processed in a single batch. Adjusting this parameter allows tuning of performance.
 * - **pLimit:** Restricts the number of concurrent operations, helping to manage concurrency effectively.
 */

(async () => {
	const { source, destination, batchSize } = workerData as WorkerData;

	try {
		console.log(`Starting to copy from ${source} to ${destination} in batches of ${batchSize}...`);
		await copyDirectoryInBatches(source, destination, batchSize);

		if (parentPort) {
			parentPort.postMessage({ success: true });
		} else {
			process.exit(0); // Graceful exit if no parent port
		}
	} catch (error) {
		console.error(`Error during copying: ${(error as Error).message}`);
		if (parentPort) {
			parentPort.postMessage({ success: false, error: (error as Error).message });
		} else {
			process.exit(1); // Exit with error code if no parent port
		}
	}
})();
