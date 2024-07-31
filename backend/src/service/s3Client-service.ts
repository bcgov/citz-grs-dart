import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";;
import extractsFromAra66x from "../utils/extractsFromAra66x";
import fs from "fs";
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import AdmZip from "adm-zip";
import extractTechnicalMetadataToJson from "../utils/exctractTechnicalV1DatafromExcel"
import path from "path";
import validateFileChecksum from "src/utils/validateFileChecksum";


export default class S3ClientService {

    private s3Client: S3Client;
    private documentationPath: string;

    constructor() {
        this.documentationPath = "";
        // Create an S3 client
        this.s3Client = new S3Client({
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIA1DCC49EEEA5B8094',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'hL2ZqW2+0poPdw2FABeKy9ux4iSMTqceEQ+8JNxr',
            },
            endpoint: process.env.AWS_ENDPOINT || 'https://citz-grs-dats.objectstore.gov.bc.ca', // Custom endpoint
            forcePathStyle: true, // Use path-style URLs (required for some custom S3 providers)
        });
    }

    async listFolders() {
        try {

            const listcommand = new ListObjectsV2Command({
                Bucket: 'dats-bucket-dev',
                Delimiter: '/', // Use delimiter to group objects by folder
            });

            const data = await this.s3Client.send(listcommand);
            const folders = data.CommonPrefixes?.map(prefix => prefix.Prefix) || [];
            return folders;

        } catch (error) {
            console.error('Error listing folders', error);
        }

        return [];
    }

    async createFolder(
        folderPath: string
    ) {
        try {
            const allFolders = await this.listFolders();
            if (allFolders.includes(folderPath)) return;

            const createFolderCommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: folderPath, // Folder key ends with '/'
            });

            const data = await this.s3Client.send(createFolderCommand);

        } catch (error) {
            console.error('Error creating folder', error);
        }
    }

    async uploadAra66xFile(
        uploadedFile: any
    ) {
        const uploadedFilePath = uploadedFile.path;
        const fileContent = fs.readFileSync(uploadedFilePath);

        //Create the Transfer Root Folder
        var transferFolderPath = process.env.TRANSFER_FOLDER_NAME || 'Transfers';
        transferFolderPath = transferFolderPath + "/";
        this.createFolder(transferFolderPath);

        //create sub folders in Transfers
        let transferData = await extractsFromAra66x(uploadedFile.path);
        const accession_num = transferData?.accession;
        const application_num = transferData?.application;
        const subApplicationPath = transferFolderPath + accession_num + "-" + application_num + "/";
        this.createFolder(subApplicationPath);


        //Create the Documentation folder
        const subDocPath = subApplicationPath + "Documentation/";
        this.createFolder(subDocPath);

        const targetFilePath = subDocPath + uploadedFile.originalname;

        try {
            const uploadFilecommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: targetFilePath, // File path within the folder
                Body: fileContent, //uploadedFile.buffer, //file.buffer, // File content
            });

            const data = await this.s3Client.send(uploadFilecommand);
            fs.unlinkSync(uploadedFilePath);

        } catch (error) {
            console.error('Error uploading file', error);
        }

        try {
            // Create folder if necessary (assume this.createFolder is defined elsewhere)
            const metaDataPath = subApplicationPath + "Metadata/";
            await this.createFolder(metaDataPath);

            // Extract the technical metadata to JSON
            const jsonData = await extractTechnicalMetadataToJson(fileContent);
            const technicalv1 = JSON.stringify(jsonData, null, 2);
            console.log("technicalv1------" + technicalv1);

            // Upload the JSON data to S3
            const uploadFilecommand2 = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: metaDataPath + 'technicalv1.json', // File path within the folder
                Body: technicalv1, // File content
            });

            const data = await this.s3Client.send(uploadFilecommand2);
            console.log('Upload success', data);

        } catch (error) {
            console.error('Error uploading technical v1 file', error);
        }

        this.documentationPath = subDocPath;
        return subDocPath;
    }

    async uploadARIS617File(
        uploadedFile: Express.Multer.File,
        documentationPath: string
    ) {
        const uploadedFilePath = uploadedFile.path;
        console.log("---------->uploadARIS617FilePath=" + uploadedFilePath);
        const fileContent = fs.readFileSync(uploadedFilePath);

        const targetFilePath = documentationPath + uploadedFile.originalname;

        try {
            const uploadFilecommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: targetFilePath, // File path within the folder
                Body: fileContent, //uploadedFile.buffer, //file.buffer, // File content
            });

            const data = await this.s3Client.send(uploadFilecommand);
            fs.unlinkSync(uploadedFilePath);

        } catch (error) {
            console.error('Error uploading file', error);
        }

        return documentationPath;
    }

    async uploadAgreementPDF(
        pdfBuffer: Buffer,
        targetPdfFilePath: string
    ) {
        console.log("--------->targetPdfFilePath=" + targetPdfFilePath);
        const targetFilePath = targetPdfFilePath;

        try {
            const uploadFilecommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: targetPdfFilePath, // File path within the folder
                Body: pdfBuffer, // File content as buffer
            });

            const data = await this.s3Client.send(uploadFilecommand);
            console.log('File uploaded successfully', data);
        } catch (error) {
            console.error('Error uploading file', error);
            throw error;
        }
    }

    async uploadZipFile(
        uploadedZipFile: Express.Multer.File,
        checksumstring: any,
        psppath: string,
    ) {
        const orginalname = uploadedZipFile.originalname;
        const filename = orginalname.substring(0, orginalname.indexOf(".zip"));
        const transferFolderPath = psppath + "Content/" + filename;
        const zipFilePath = transferFolderPath + "/" + orginalname;
        const jsonFileName = filename + "_checksum.json";
        const checksumPath = transferFolderPath + "/" + jsonFileName;
        const jsonBuffer = JSON.stringify(checksumstring);

        this.createFolder(transferFolderPath);

        try {
            const uploadFilecommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: zipFilePath, // File path within the folder
                Body: uploadedZipFile.buffer,
            });

            const zipFileResponsedata = await this.s3Client.send(uploadFilecommand);

            const uploadJSONcommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: checksumPath,
                Body: jsonBuffer,
                ContentType: 'application/json'
            });
            const jsonFileResponsedata = await this.s3Client.send(uploadJSONcommand);

        } catch (error) {
            console.error('Error uploading file', error);
        }

        return zipFilePath;
    }
    async uploadTechnicalV2File(techMetadatav2: any, psppath: string) {
        const transferFolderPath = psppath + "Metadatas/";
        this.createFolder(transferFolderPath);
        console.log("----------->uploadTechnicalV2File=" + transferFolderPath);
        const jsonBuffer = Buffer.from(JSON.stringify(techMetadatav2));
        console.log("----------->uploadTechnicalV2File=" + jsonBuffer);

        try {
            const uploadJSONcommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: transferFolderPath + 'techMetadatav2.json',
                Body: jsonBuffer,
                ContentType: 'application/json'
            });
            const jsonFileResponsedata = await this.s3Client.send(uploadJSONcommand);
            console.log("----------->jsonFileResponsedata=" + jsonFileResponsedata);
        } catch (error) {
            console.error('Error uploading file', error);
        }

        return transferFolderPath;

    }

    async deleteFolder(folderPath: string) {
        try {
            // List all objects in the folder
            const listObjectsCommand = new ListObjectsV2Command({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Prefix: folderPath,
            });
            const data = await this.s3Client.send(listObjectsCommand);

            // Delete each object in the folder
            if (data.Contents) {
                for (const object of data.Contents) {
                    if (object.Key) {
                        const deleteObjectCommand = new DeleteObjectCommand({
                            Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                            Key: object.Key,
                        });
                        await this.s3Client.send(deleteObjectCommand);
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting folder', error);
        }
    }

    async listObjects(prefix: string): Promise<string[]> {
        const command = new ListObjectsV2Command({
            Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
            Prefix: prefix,
        });

        try {
            const response = await this.s3Client.send(command);
            if (response.Contents) {
                return response.Contents.map(obj => obj.Key || "");
            }
            return [];
        } catch (error) {
            console.error("Error listing objects:", error);
            throw error;
        }
    }
    private async listObjectsForPSP(bucket: string, prefix: string) {
        const params = {
            Bucket: bucket,
            Prefix: prefix,
        };

        const command = new ListObjectsV2Command(params);
        const data = await this.s3Client.send(command);
        return data.Contents;
    }

    async downloadFile(key: string, downloadPath: string): Promise<void> {
        const command = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
            Key: key,
        });

        try {
            const response = await this.s3Client.send(command);
            if (response.Body) {
                const nodeStream = response.Body as Readable;
                const fileStream = fs.createWriteStream(downloadPath);
                await pipeline(nodeStream, fileStream);
            } else {
                throw new Error("Body is undefined in S3 response.");
            }
        } catch (error) {
            console.error("Error downloading file:", error);
            throw error;
        }
    }
    async deleteObject(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
            Key: key,
        });

        try {
            await this.s3Client.send(command);
        } catch (error) {
            console.error("Error deleting object:", error);
            throw error;
        }
    }



    public async copyPSPFolderFromS3ToZip(folderKey: string): Promise<Buffer | null> {
        const bucket = process.env.BUCKET_NAME || 'dats-bucket-dev';
        const objects = await this.listObjectsForPSP(bucket, folderKey);

        if (!objects) {
            console.log("No objects found in the specified folder.");
            return null;
        }

        const tempDir = path.join(os.tmpdir(), uuidv4());

        this.createDirectory(tempDir);

        try {
            for (const obj of objects) {
                const fileKey = obj.Key as string;

                if (fileKey.endsWith("/") || obj.Size === 0) {
                    continue;
                }

                const relativePath = fileKey.substring(folderKey.length);
                const downloadPath = path.join(tempDir, relativePath);

                this.createDirectory(path.dirname(downloadPath));

                console.log(`Downloading ${fileKey} to ${downloadPath}`);
                try {
                    await this.downloadPSP(bucket, fileKey, downloadPath);

                    if (path.extname(downloadPath) === ".zip") {
                        console.log(`Handling zip file: ${downloadPath}`);
                        const baseName = path.basename(downloadPath, ".zip");
                        const checksumFilePath = path.join(
                            path.dirname(downloadPath),
                            `${baseName}_checksum.json`
                        );
                        const checksumFileKey = `${path.dirname(fileKey)}/${baseName}_checksum.json`;

                        console.log(`Path to checksum file: ${checksumFileKey}`);

                        const checksumData = await this.downloadAndParseJSON(bucket, checksumFileKey);
                        console.log(`Checksum data:`, checksumData);

                        if (fs.existsSync(checksumFilePath)) {
                            console.log(`Found checksum file: ${checksumFilePath}`);
                            // validateFileChecksum()
                        }
                    }

                    const basePath = this.extractBasePath(folderKey);
                    console.log("Base path is: " + basePath);
                } catch (error) {
                    console.error(`Error downloading file: ${fileKey}`, error);
                }
            }

            const additionalFolders = ["Documentation/", "Metadata/"];
            for (const additionalFolder of additionalFolders) {
                const additionalFolderKey = `${this.extractBasePath(folderKey)}${additionalFolder}`;
                const additionalObjects = await this.listObjectsForPSP(bucket, additionalFolderKey);

                if (additionalObjects) {
                    for (const obj of additionalObjects) {
                        const fileKey = obj.Key as string;

                        if (fileKey.endsWith("/")) {
                            continue;
                        }

                        const relativePath = fileKey.substring(additionalFolderKey.length);
                        const downloadPath = path.join(tempDir, additionalFolder, relativePath);

                        this.createDirectory(path.dirname(downloadPath));

                        console.log(`Downloading ${fileKey} to ${downloadPath}`);
                        try {
                            await this.downloadPSP(bucket, fileKey, downloadPath);
                        } catch (error) {
                            console.error(`Error downloading file: ${fileKey}`, error);
                        }
                    }
                }
            }

            const zipBuffer = await this.zipDirectory(tempDir);

            return zipBuffer;
        } finally {
            // Clean up temp directory
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }


    private createDirectory(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    private extractBasePath(fullPath: string): string {
        const firstSlashIndex = fullPath.indexOf("/");
        const secondSlashIndex = fullPath.indexOf("/", firstSlashIndex + 1);
        const basePath = fullPath.substring(0, secondSlashIndex + 1);
        return basePath;
    }

    private async downloadAndParseJSON(bucket: string, key: string): Promise<any> {
        const tempPath = path.join(__dirname, "_checksum.json");
        await this.downloadPSP(bucket, key, tempPath);

        const data = fs.readFileSync(tempPath, "utf8");
        fs.unlinkSync(tempPath); // Cleanup the temporary file
        return JSON.parse(data);
    }

    private async zipDirectory(sourceDir: string): Promise<Buffer> {
        const archive = new AdmZip();

        const addFilesToZip = (dirPath: string, zipPath: string) => {
            const items = fs.readdirSync(dirPath);

            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const itemZipPath = path.join(zipPath, item);

                if (fs.statSync(itemPath).isDirectory()) {
                    addFilesToZip(itemPath, itemZipPath);
                } else {
                    archive.addLocalFile(itemPath, path.dirname(itemZipPath));
                }
            }
        };

        addFilesToZip(sourceDir, "");
        return archive.toBuffer();
    }

    private async downloadPSP(bucket: string, key: string, downloadPath: string): Promise<void> {
        const params = {
            Bucket: bucket,
            Key: key,
        };

        const command = new GetObjectCommand(params);
        const response: GetObjectCommandOutput = await this.s3Client.send(command);

        if (!response.Body) {
            throw new Error(`Could not retrieve file from S3: ${key}`);
        }

        const bodyStream = response.Body as NodeJS.ReadableStream;

        await pipeline(bodyStream, fs.createWriteStream(downloadPath));
    }


}
