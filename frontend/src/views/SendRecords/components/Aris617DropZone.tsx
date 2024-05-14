import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { makeStyles } from "@mui/styles";
import {
  Card,
  Divider,
  Typography,
  Box,
  Button,
  Grid,
  Theme,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PDFImg from "../../../assets/images/adobe-pdf-icon-logo-png-transparent.png";
import UploadService from "../../../services/uploadService";

const useStyles = makeStyles((theme: Theme) => ({
    container: {
      display: "flex",
      flexWrap: "nowrap",
      "& > :not(style)": {
        m: 1,
        width: "80%",
        height: "auto",
      },
    },
    dropzone: {
      marginTop: theme.spacing(2),
      border: "3px dashed #513dd4",
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(2),
      textAlign: "center",
      cursor: "pointer",
    },
    uploadButton: {
      marginTop: theme.spacing(4),
      marginLeft: theme.spacing(4),
      variant: "contained",
      color: "primary",
    },
    fileList: {
      marginTop: theme.spacing(2),
      maxHeight: "150px",
      overflowY: "auto",
    },
    infoBox: {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(2),
      height: "80%",
      padding: theme.spacing(2),
    },
    fileDisplay: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(2),
    },
    fileIcon: {
      marginRight: theme.spacing(1),
    },
  })
);

interface Aris617DropZoneProps {
  onFileChange?: (file: File) => void;
  onUpload?: () => void;
}

const Aris617DropZone: React.FC<Aris617DropZoneProps> = ({
  onFileChange,
  onUpload
}) => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadService = new UploadService();

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Only accept the first file if multiple are dropped
      const file = acceptedFiles[0];
      setSelectedFile(file);

      // If an external callback is provided, call it
      if (onFileChange) {
        onFileChange(file);
      }
    },
    [onFileChange]
  );

  const handleFileUpload = useCallback((file: File) => {
    const formData = new FormData();
    formData.append("uploadARIS617file", file);

    // Assuming uploadService.upload66xFile returns a Promise
    uploadService
      .upload617File(formData)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error("Upload error:", error);
        // Handle the error as needed
      });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: false,
  });

  return (
    <Card>
      <Box p={3}>
        <Typography variant="subtitle2">
          Select a file from your computer or drop it here to upload.
        </Typography>
      </Box>
      <Divider />

      <Grid container spacing={2} direction="row" sx={{ marginBottom: 4 }}>
        <Grid item xs={12}>
          <Box className={classes.container}>
            <Paper elevation={1}>
              {selectedFile ? (
                <div className={classes.fileDisplay}>
                  <img
                    src={PDFImg}
                    alt="PDF Icon"
                    style={{ width: 48, height: 48 }}
                    className={classes.fileIcon}
                  />
                  <Typography>{selectedFile.name}</Typography>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`${classes.dropzone} ${
                    isDragActive ? "active" : ""
                  }`}
                >
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop a file here, or click to select a file</p>
                </div>
              )}
            </Paper>
            <Grid item xs={3}>
              <Paper elevation={4} className={classes.infoBox}>
                <Typography variant="body2">
                  Additional information goes here...
                </Typography>
              </Paper>
            </Grid>
          </Box>

          <Button
            className={classes.uploadButton}
            onClick={() => handleFileUpload(selectedFile!)}
          >
            Upload
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default Aris617DropZone;
