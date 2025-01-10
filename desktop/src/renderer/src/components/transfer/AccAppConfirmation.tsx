import { Checkbox } from "@bcgov/design-system-react-components";
import { Box, FormControlLabel, Stack, Typography } from "@mui/material";

type Props = {
  message: string;
  accession?: string | null;
  application?: string | null;
  checked: boolean;
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AccAppConfirmation = ({
  message,
  accession,
  application,
  checked,
  setChecked,
}: Props) => {
  const disabled =
    !(!!accession && !!application) || accession === "" || application === "";

  const textStyles = {
    fontSize: "0.8em",
    color: !disabled ? "var(--text)" : "var(--text-disabled)",
  };

  return (
    <Stack
      spacing={2}
      sx={{
        padding: "8px 16px",
        backgroundColor: "var(--acc-app-confirmation-bg)",
      }}
    >
      <Typography sx={textStyles}>
        <b>{message}</b>
      </Typography>
      <Box>
        <Typography sx={textStyles}>
          <b>Accession number:</b> {accession ? accession : "TBD"}
        </Typography>
        <Typography sx={textStyles}>
          <b>Application number:</b> {application ? application : "TBD"}
        </Typography>
      </Box>
      <FormControlLabel
        sx={{
          "& .MuiFormControlLabel-label": textStyles,
          color: !disabled ? "var(--text)" : "var(--text-disabled)",
        }}
        required
        control={
          <Checkbox
            style={{ paddingLeft: 0 }}
            isSelected={checked}
            onChange={(isSelected) => setChecked(isSelected)}
            isDisabled={disabled}
          />
        }
        label="I confirm the accession and application numbers shown above"
      />
    </Stack>
  );
};
