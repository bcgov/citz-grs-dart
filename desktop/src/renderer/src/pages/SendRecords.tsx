import { Button } from "@bcgov/design-system-react-components";
import { useNavigate } from "react-router-dom";
import { Stack, Typography, useTheme, Grid2 as Grid } from "@mui/material";
import { Lan as LanIcon, Computer as ComputerIcon } from "@mui/icons-material";

export const SendRecordsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  return (
    <Grid container>
      <Grid size={2} />
      <Grid size={8} sx={{ paddingTop: 3 }}>
        <Stack gap={4}>
          <Typography variant="h2" sx={{ marginBottom: -1 }}>
            Send records
          </Typography>
          <Typography>
            Send Full Retention (FR) digital records to the Digital Archives
            from a LAN drive or EDRMS. This process sends authentic copies of
            records to the archives for processing. Original records will remain
            in tact on your device/drive. When the records are preserved in the
            archives an archivist will contact you so you can destroy the
            originals as redundant copies.
          </Typography>
          <Stack direction="row" gap={3}>
            {/* LAN TRANSFER */}
            <Stack
              gap={2}
              sx={{
                padding: 2,
                background: theme.palette.info.light,
                width: "100%",
              }}
            >
              <Stack direction="row" spacing={1}>
                <LanIcon sx={{ color: theme.palette.info.contrastText }} />
                <Typography variant="h3">
                  Send records from LAN Drive
                </Typography>
              </Stack>
              <Button
                onPress={() => navigate("/send-records/lan/instructions")}
                style={{ width: "fit-content" }}
              >
                Start
              </Button>
            </Stack>
            {/* EDRMS TRANSFER */}
            <Stack
              gap={2}
              sx={{
                padding: 2,
                background: theme.palette.info.light,
                width: "100%",
              }}
            >
              <Stack direction="row" spacing={1}>
                <ComputerIcon sx={{ color: theme.palette.info.contrastText }} />
                <Typography variant="h3">Send records from EDRMS</Typography>
              </Stack>
              <Button style={{ width: "fit-content" }}>Start</Button>
            </Stack>
          </Stack>
          {/* Note */}
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
            <Typography variant="h4">Note</Typography>
            <Typography>
              Please note that this process can take considerable time. If you
              have a large transfer (i.e., &gt;5GB, &gt;5000 files), schedule
              your work to let DATS run for a few hours. We are working on
              making the services faster in future versions of DATS.
            </Typography>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
