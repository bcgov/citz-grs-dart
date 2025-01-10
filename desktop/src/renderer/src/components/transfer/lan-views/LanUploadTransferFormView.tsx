import { Button } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";
import { FileUploadArea } from "@renderer/components";

type Props = {
  file?: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null | undefined>>;
  onNextPress: () => void;
  onBackPress: () => void;
};

export const LanUploadTransferFormView = ({
  file,
  setFile,
  onNextPress,
  onBackPress,
}: Props) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const onDrop = (file: File | null | undefined) => {
    if (file) setFile(file);
  };

  const onDelete = () => setFile(undefined);

  return (
    <Stack gap={3}>
      <Stack gap={2}>
        <Typography variant="h3">
          Upload your transfer form (ARS 617) here:
        </Typography>
        <FileUploadArea
          file={file}
          onChange={onChange}
          onDrop={onDrop}
          onDelete={onDelete}
          accept="application/pdf"
        />
      </Stack>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="secondary"
          onPress={onBackPress}
          style={{ width: "fit-content" }}
        >
          Back
        </Button>
        <Button
          onPress={onNextPress}
          isDisabled={!file}
          style={{ width: "fit-content" }}
        >
          Next
        </Button>
      </Box>
    </Stack>
  );
};
