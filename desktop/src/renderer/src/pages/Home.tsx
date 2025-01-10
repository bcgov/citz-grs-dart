import {
  Box,
  Link,
  Stack,
  Typography,
  useTheme,
  Grid2 as Grid,
} from "@mui/material";

type Props = {
  authenticated: boolean;
};

export const HomePage = ({ authenticated }: Props) => {
  const theme = useTheme();

  return (
    <Grid container>
      <Grid size={2} />
      <Grid size={8} sx={{ paddingTop: 3 }}>
        <Stack
          sx={{
            padding: 4,
            flexShrink: 0,
            background: `${theme.palette.primary}`,
          }}
          gap={3}
        >
          <Box>
            <Typography variant="h1">Welcome to DATS</Typography>
            <Typography variant="h4">
              Digital Archives Transfer Service
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3">How It Works</Typography>
            <Stack gap={3} sx={{ margin: 2 }}>
              <Stack gap={1}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  1. Start the Process
                </Typography>
                <Typography variant="h4" sx={{ marginLeft: 2 }}>
                  Begin by creating a Transfer Form (ARS 617) to document your
                  intent to transfer records.
                </Typography>
              </Stack>

              <Stack gap={1}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  2. Create File List
                </Typography>
                <Typography variant="h4" sx={{ marginLeft: 2 }}>
                  For LAN Transfers, use DATS to generate a Digital File List
                  (ARS 662), a detailed inventory of your records.
                </Typography>
              </Stack>

              <Stack gap={1}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  3. Submit for Review
                </Typography>
                <Typography variant="h4" sx={{ marginLeft: 2 }}>
                  Submit your Transfer Form and File List to GIM staff for a
                  Quality Assurance Review.
                </Typography>
              </Stack>

              <Stack gap={1}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  4. Transfer Records
                </Typography>
                <Typography variant="h4" sx={{ marginLeft: 2 }}>
                  Once approved, utilize DATS to securely transfer your digital
                  FR records to the Digital Archives.
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Stack gap={1}>
            <Typography variant="h3" sx={{ marginBottom: 1 }}>
              Getting Started with DATS
            </Typography>
            {authenticated ? (
              <Stack gap={1} sx={{ marginLeft: 2 }}>
                <Typography variant="h4">Select a tab to start:</Typography>
                <Typography variant="h4" sx={{ marginLeft: 2 }}>
                  • <b>Create File List</b>: Generate your Digital File List
                  (ARS 662).
                </Typography>
                <Typography variant="h4" sx={{ marginLeft: 2 }}>
                  • <b>Send Records</b>: Transfer your approved FR records to
                  the Digital Archives.
                </Typography>
              </Stack>
            ) : (
              <Typography variant="h4" sx={{ marginLeft: 2 }}>
                Please sign in to begin using DATS. Use the <b>Login</b> button
                at the bottom left to get started.
              </Typography>
            )}
          </Stack>

          <Stack sx={{ marginTop: 1 }}>
            <Typography variant="h3" sx={{ marginBottom: "10px" }}>
              Need Assistance?
            </Typography>

            <Stack
              direction="row"
              gap={"5px"}
              sx={{ alignItems: "center", marginLeft: 2 }}
            >
              <Typography variant="h4">For assistance, contact your</Typography>
              <Link
                href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/records-contacts/ministries"
                target="_blank"
              >
                Government Information Management (GIM) Specialists.
              </Link>
            </Stack>

            <Stack
              direction="row"
              gap={"5px"}
              sx={{ alignItems: "center", marginLeft: 2 }}
            >
              <Typography variant="h4">
                For all inquiries, please contact
              </Typography>
              <Link href="mailto:GIM@gov.bc.ca?subject=Records%20Transfer%20Question">
                GIM@gov.bc.ca
              </Link>
              <Typography variant="h4">
                We monitor this inbox from 8am-4pm Mon-Fri.
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
