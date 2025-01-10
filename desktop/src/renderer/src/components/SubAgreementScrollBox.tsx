import { Link, Stack, Typography } from "@mui/material";

type Props = {
  accession: string;
  application: string;
  maxHeight: string | number;
};

export const SubAgreementScrollBox = ({
  accession,
  application,
  maxHeight,
}: Props) => {
  return (
    <Stack
      gap={2}
      sx={{
        padding: "16px",
        border: "1px solid var(--sub-agreement-border)",
        maxHeight: `min(${maxHeight}, 100vh)`,
        overflowY: "scroll",
        "&::-webkit-scrollbar": {
          width: "20px", // Width of the scrollbar + offset for margin right
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent", // Track color
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "var(--scroll-bar)", // Thumb color
          borderRadius: "10px",
          backgroundClip: "content-box", // Helps make margin right
          border: "5px solid transparent", // Helps make margin right
        },
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: "700" }}>
        BC Government Digital Archives Submission Agreement
      </Typography>
      <Typography>
        This is an agreement between BC's Digital Archives and the Ministry, for
        the transfer of government records under Accession # {accession} and
        Application # {application}.
      </Typography>
      <Typography>
        The purpose of this agreement is to transfer Full Retention (FR)
        government records, after the date of their Final Disposition (FD), from
        the Ministry to the Digital Archives.
      </Typography>
      <Stack gap={1}>
        <Typography>The Ministry and Digital Archives agree that:</Typography>
        <ol>
          <li>
            The Ministry currently holds legal and physical custody of the
            government records being transferred, and declares that the records
            are authentic evidence of government actions and decisions.
          </li>
          <li>
            The government records are subject to the{" "}
            <Link href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/15027">
              Information Management Act (IMA)
            </Link>
            ,{" "}
            <Link href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96165_00">
              Freedom of Information and Protection of Privacy Act (FIPPA)
            </Link>
            , and other relevant legislation.
          </li>
          <li>
            The government records meet all conditions outlined in the{" "}
            <Link href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/policies-procedures/government-records">
              Managing Government Information Policy (MGIP)
            </Link>{" "}
            and{" "}
            <Link href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/policies-procedures/government-records/rim-manual/rim-manual-3-3">
              RIM Manual Section 3.3 Transfer to Archives
            </Link>
            .
          </li>
          <li>
            None of the government records being transferred will be destroyed
            by the Ministry until the Digital Archives verifies the creation of
            Archival Information Packages (AIPs) in the preservation system,
            which completes of the transfer process. After verification the
            source information will be a redundant copy and will be destroyed
            appropriately by the Ministry, to reduce duplication and ensure a
            single source of truth.
          </li>
          <li>
            Upon completion of the transfer process the Digital Archives will
            assume legal and physical custody and be responsible for the ongoing
            management of the archived government records on behalf of the
            Province.
          </li>
          <li>
            The Digital Archives will protect personal information and provide
            access to the government records in accordance with the Information
            Management Act (IMA), the Freedom of Information and Protection of
            Privacy Act, and other relevant legislation.
          </li>
        </ol>
      </Stack>
    </Stack>
  );
};
