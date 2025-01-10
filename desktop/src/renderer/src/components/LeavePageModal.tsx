import { Button } from "@bcgov/design-system-react-components";
import { Box, Modal, Stack, Typography } from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const innerButtonStyle = {
  justifyContent: "center",
  width: "25%",
  height: "10%",
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid black",
  borderRadius: "5px",
  padding: 4,
};

const buttonBoxStyle = {
  display: "flex",
  justifyContent: "right",
  gap: 1,
  padding: 0,
  flexShrink: 0,
};

export const LeavePageModal = ({ open, onClose, onConfirm }: Props) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Stack gap={3} sx={modalStyle}>
        <Typography variant="subtitle1">
          Are you sure you want to leave this page? All progress will be lost.
        </Typography>

        <Box sx={buttonBoxStyle}>
          <Button
            variant="secondary"
            style={innerButtonStyle}
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            style={innerButtonStyle}
            onPress={onConfirm}
          >
            Confirm
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
};
