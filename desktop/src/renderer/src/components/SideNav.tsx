import {
  Drawer,
  List,
  ListItem,
  Divider,
  Typography,
  useTheme,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  HomeOutlined as HomeOutlinedIcon,
  DescriptionOutlined as FileListIcon,
  DriveFileMoveOutlined as SendRecordsIcon,
} from "@mui/icons-material";
import { type ReactNode, useState } from "react";
import { AuthButton } from "./AuthButton";
import { LeavePageModal } from "./LeavePageModal";

type NavItemProps = {
  path: string;
  label: string;
  icon: ReactNode;
};

type Props = {
  accessToken: string | undefined;
  idToken: string | undefined;
};

export const SideNav = ({ accessToken, idToken }: Props) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState("/");
  const [leavePageModalOpen, setLeavePageModalOpen] = useState(false);
  const [newPagePath, setNewPagePath] = useState("/");

  const onConfirmLeavePage = () => {
    setLeavePageModalOpen(false);
    setCurrentPage(newPagePath);
    navigate(newPagePath);
  };

  const handleSelection = (path: string) => {
    if (currentPage === path) return;
    if (currentPage === "/") {
      setCurrentPage(path);
      navigate(path);
    } else {
      setNewPagePath(path);
      setLeavePageModalOpen(true);
    }
  };

  const NavItem = ({ path, label, icon }: NavItemProps) => {
    const theme = useTheme();
    return (
      <ListItem
        sx={{
          gap: 1,
          border:
            currentPage === path
              ? "2px solid var(--sidenav-item-border-current-page)"
              : "2px solid transparent",
          borderRadius: "5px",
          background:
            currentPage === path ? theme.palette.secondary.light : "none",
          "&:hover": {
            background: theme.palette.secondary.dark,
          },
        }}
        component="button"
        onClick={() => handleSelection(path)}
      >
        {icon}
        <Typography>{label}</Typography>
      </ListItem>
    );
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          height: "100vh",
          background: theme.palette.secondary.light,
          "& .MuiDrawer-paper": {
            position: "fixed",
            width: "17%",
            boxSizing: "border-box",
            padding: 1,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <NavItem
              path="/"
              label="Home"
              icon={<HomeOutlinedIcon sx={{ color: "var(--sidenav-icon)" }} />}
            />
            <Divider sx={{ margin: "5px 0" }} />
            {/* REQUIRE AUTH */}
            {accessToken && (
              <>
                <NavItem
                  path="/file-list"
                  label="Create file list"
                  icon={<FileListIcon sx={{ color: "var(--sidenav-icon)" }} />}
                />
                <NavItem
                  path="/send-records"
                  label="Send records"
                  icon={
                    <SendRecordsIcon sx={{ color: "var(--sidenav-icon)" }} />
                  }
                />
              </>
            )}
          </List>
          <AuthButton accessToken={accessToken} idToken={idToken} />
        </Box>
      </Drawer>
      <LeavePageModal
        open={leavePageModalOpen}
        onClose={() => setLeavePageModalOpen(false)}
        onConfirm={onConfirmLeavePage}
      />
    </>
  );
};
