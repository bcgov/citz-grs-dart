import { z } from "zod";

// Folder Metadata Zod Schema
export const folderMetadataZodSchema = z.object({
	schedule: z.union([z.string(), z.null()]).optional(),
	classification: z.union([z.string(), z.null()]).optional(),
	file: z.union([z.string(), z.null()]).optional(),
	opr: z.union([z.boolean(), z.null()]).optional(),
	startDate: z.union([z.string(), z.null()]).optional(),
	endDate: z.union([z.string(), z.null()]).optional(),
	soDate: z.union([z.string(), z.null()]).optional(),
	fdDate: z.union([z.string(), z.null()]).optional(),
});

export type FolderMetadataZodType = z.infer<typeof folderMetadataZodSchema>;

// File Metadata Zod Schema
export const fileMetadataZodSchema = z.object({
	filepath: z.string(),
	filename: z.string(),
	size: z.string(),
	checksum: z.string(),
	birthtime: z.string(),
	lastModified: z.string(),
	lastAccessed: z.string(),
	lastSaved: z.union([z.string(), z.null()]).optional(),
	authors: z.union([z.string(), z.null()]).optional(),
	owner: z.union([z.string(), z.null()]).optional(),
	company: z.union([z.string(), z.null()]).optional(),
	computer: z.union([z.string(), z.null()]).optional(),
	contentType: z.union([z.string(), z.null()]).optional(),
	programName: z.union([z.string(), z.null()]).optional(),
});

export type FileMetadataZodType = z.infer<typeof fileMetadataZodSchema>;

export const createFileListBodySchema = z.object({
	outputFileType: z.enum(["excel", "json"]),
	metadata: z.object({
		admin: z
			.object({
				application: z.string().optional(),
				accession: z.string().optional(),
			})
			.optional(),
		folders: z.record(folderMetadataZodSchema),
		files: z.record(z.array(fileMetadataZodSchema)),
	}),
});

// TypeScript Type inferred from Zod Schema
export type CreateFileListBody = z.infer<typeof createFileListBodySchema>;
