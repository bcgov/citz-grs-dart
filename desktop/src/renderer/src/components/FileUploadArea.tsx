import {
  UploadFile as UploadFileIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useRef, useState } from "react";

type Props = {
  file?: File | null;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (file: File | null | undefined) => void;
  onDelete: () => void;
};

/**
 * Usage example:
 * 
  const [file, setFile] = useState<File>();
  
  <FileUploadArea
    file={file}
    accept="application/pdf"
    onChange={(e) => {
      if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    }}
    onDrop={(file: File | null) => {
      if (file) setFile(file);
    }}
    onDelete={() => setFile(undefined)}
  /> 
 */

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return `${(size / 1024 ** i).toFixed(2)} ${sizes[i]}`;
};

const fileTypeExtensionMap = {
  "application/pdf": ".pdf",
  "application/json": ".json",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "text/plain": ".txt",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

export const FileUploadArea = ({
  file,
  accept,
  onChange,
  onDrop,
  onDelete,
}: Props) => {
  const [isInvalidFile, setIsInvalidFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const draggedFile = e.dataTransfer.items[0];
      const acceptedTypes = accept.split(",");

      const isAccepted = acceptedTypes.some((type) => {
        return (
          draggedFile.type === type ||
          (type.startsWith(".") && draggedFile.getAsFile()?.name.endsWith(type))
        );
      });

      setIsInvalidFile(!isAccepted);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    setIsInvalidFile(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setIsInvalidFile(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const acceptedTypes = accept.split(",");

      const isAccepted = acceptedTypes.some((type) => {
        return (
          droppedFile.type === type ||
          (type.startsWith(".") && droppedFile.name.endsWith(type))
        );
      });

      if (isAccepted) {
        onDrop(droppedFile);
      } else {
        onDrop(null); // Notify parent that an invalid file was dropped
      }
    }
  };

  const fileExtensions = accept
    .split(",") // Split the input into an array of file types
    .map((type) => fileTypeExtensionMap[type.trim()]) // Map each file type to its corresponding extension
    .filter((ext) => !!ext) // Remove undefined values for unrecognized file types
    .join(","); // Join the extensions back into a comma-separated string

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the input element

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the input value to allow re-uploading the same file
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: isDragging
          ? isInvalidFile
            ? "var(--file_upload_area-bg-invalid)" // Light red for invalid file
            : "var(--file_upload_area-bg-valid)" // Light blue for valid file
          : "var(--file_upload_area-bg-default)", // Default background
        borderColor: isDragging
          ? isInvalidFile
            ? "var(--file_upload_area-border-invalid)" // Red for invalid file
            : "var(--file_upload_area-border-valid)" // Blue for valid file
          : "var(--file_upload_area-border-default)", // Grey for no dragging
        transition: "all 0.25s",
      }}
      height={"15rem"}
      border={"solid 1px"}
      onClick={() =>
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        !isInvalidFile && document.getElementById("file-input")!.click()
      }
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Box
        sx={{
          height: "calc(100% - 8px)",
          display: "flex",
          alignItems: file ? "start" : "center",
          justifyContent: file ? "left" : "center",
        }}
      >
        {file ? (
          <Stack
            direction="row"
            gap={2}
            sx={{
              margin: 2,
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--file_upload_area-bg-uploaded-file)",
              padding: "16px",
              minWidth: "400px",
            }}
          >
            <UploadFileIcon />
            <Stack gap={"4px"}>
              <Typography>{file.name}</Typography>
              <Typography sx={{ fontSize: "0.8em" }}>
                {formatFileSize(file.size)}
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Stack>
        ) : (
          <Stack
            gap={2}
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <UploadFileIcon />
            <Typography>Choose a file or drag and drop here</Typography>
            <Typography
              sx={{
                padding: "8px 16px",
                border:
                  "1px solid var(--file_upload_area-border-browse-button)",
                borderRadius: "5px",
                "&:hover": {
                  cursor: "pointer",
                },
              }}
            >
              Browse file ({fileExtensions})
            </Typography>
          </Stack>
        )}
      </Box>
      <input
        id="file-input"
        type="file"
        ref={fileInputRef}
        accept={accept}
        style={{ width: 0 }}
        onChange={handleFileChange}
      />
    </Box>
  );
};
