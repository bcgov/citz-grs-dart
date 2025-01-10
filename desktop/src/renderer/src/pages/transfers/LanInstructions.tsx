import { Button } from "@bcgov/design-system-react-components";
import { Box, Grid2 as Grid, Stack, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const LanInstructionsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const goToTransferPage = () => navigate("/send-records/lan");

  const NoteBlock = () => {
    return (
      <Stack
        gap={2}
        sx={{
          padding: 2,
          background: theme.palette.info.main,
          border: "1px solid",
          borderColor: theme.palette.info.dark,
          borderRadius: "5px",
        }}
      >
        <Typography variant="h4">For an optimal experience...</Typography>
        <ul>
          <li>
            Keep the DATS app open for the duration of the LAN drive transfer
            process, including during long file uploading times.
          </li>
          <li>
            <Typography variant="h4">
              Closing the application or navigating elsewhere in DATS during
              your transfer process will terminate the transfer. Progress will
              not be saved.
            </Typography>
          </li>
        </ul>
      </Stack>
    );
  };

  return (
    <Grid container>
      <Grid size={2} />
      <Grid size={8} sx={{ paddingTop: 3 }}>
        <Stack gap={3}>
          <Typography variant="h2">Send records from LAN Drive</Typography>
          <Stack gap={2}>
            <Typography variant="h3">Getting started</Typography>
            <Typography>
              Before you start your LAN drive transfer process, ensure you have
              the following documents:
            </Typography>
            <ul>
              <li>Transfer form (ARS 617)</li>
              <li>Digital file list (ARS 622)</li>
            </ul>
            <Typography>
              You should also be ready to relink any folders whose names have
              changed since your file list was created.
            </Typography>
          </Stack>
          {/* Note */}
          <NoteBlock />
          <Box sx={{ display: "flex", justifyContent: "right" }}>
            <Button onPress={goToTransferPage} style={{ width: "fit-content" }}>
              Start
            </Button>
          </Box>
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
