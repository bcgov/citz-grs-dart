// Folder Metadata Zod Schema
export interface folderMetadataSchema {
	schedule?: string | null;
	classification?: string | null;
	file?: string | null;
	opr?: boolean | null;
	startDate?: string | null;
	endDate?: string | null;
	soDate?: string | null;
	fdDate?: string | null;
}

//export type FolderMetadataZodType = z.infer<typeof folderMetadataZodSchema>;

// File Metadata Zod Schema
export interface fileMetadataSchema {
	filepath: string;
	filename: string;
	size: string;
	checksum: string;
	birthtime: string;
	lastModified: string;
	lastAccessed: string;
	lastSaved?: string | null;
	authors?: string | null;
	owner?: string | null;
	company?: string | null;
	computer?: string | null;
	contentType?: string | null;
	programName?: string | null;
}

//export type FileMetadataZodType = z.infer<typeof fileMetadataZodSchema>;

export interface createFileListBodySchema {
	outputFileType: string;
	metadata: {
		admin?: {
			application?: string;
			accession?: string;
		};
		folders: folderMetadataSchema;
		files: [fileMetadataSchema];
	};
}

export interface submitFormData {
	accessionNumber: string | undefined;
	applicationNumber: string | undefined;
	outputFormat: number | string;
}

// TypeScript Type inferred from Zod Schema
//export type CreateFileListBody = z.infer<typeof createFileListBodySchema>;
