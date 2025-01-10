import { Box, Typography } from "@mui/material";
import type { ToastContentProps } from "react-toastify";

/**
 * Example usage (Calling test will make the toast appear):
 * 
  import { Toast } from "@renderer/components/Toast";
  import { toast } from "react-toastify";

  const test = () => {
    toast.error(Toast, {
      data: {
        title: "Wrong file type",
        message: "File type not accepted. Please upload an .xlsx file.",
      },
    });
  };
 */

export const Toast = ({
  data,
}: ToastContentProps<{ title: string; message: string }>) => {
  return (
    <Box>
      <Typography variant="h4">{data.title}</Typography>
      <Typography>{data.message}</Typography>
    </Box>
  );
};
