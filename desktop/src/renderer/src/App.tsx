import { useEffect, useState } from "react";
import { SideNav, VPNPopup } from "./components";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  FileListPage,
  HomePage,
  SendRecordsPage,
  LanInstructionsPage,
  LanTransferPage,
} from "./pages";
import { Button, Grid2 as Grid } from "@mui/material";
import { Header } from "@bcgov/design-system-react-components";
import { LeavePageModal } from "./components/LeavePageModal";
import { ToastContainer } from "react-toastify";

function App(): JSX.Element {
  const [api] = useState(window.api); // Preload scripts
  const [showVPNPopup, setShowVPNPopup] = useState<boolean | null>(null);
  const [leavePageModalOpen, setLeavePageModalOpen] = useState(false);

  // Authentication state
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [idToken, setIdToken] = useState<string | undefined>(undefined);

  const onConfirmLeavePage = () => {
    setLeavePageModalOpen(false);
    window.location.href = "/";
  };

  useEffect(() => {
    // Handle "auth-success" message from main process
    // Triggered upon successful login
    window.electron.ipcRenderer.on("auth-success", (_, tokens) => {
      setAccessToken(tokens.accessToken);
      setIdToken(tokens.idToken);
    });

    // Handle "token-refresh-success" message from main process
    // Triggered upon successful refresh of tokens
    window.electron.ipcRenderer.on("token-refresh-success", (_, tokens) =>
      setAccessToken(tokens.accessToken)
    );

    // Handle "auth-logout" message from main process
    // Triggered upon logout
    window.electron.ipcRenderer.on("auth-logout", () =>
      setAccessToken(undefined)
    );

    // Alert when auth token copied.
    window.electron.ipcRenderer.on("auth-token-copied", (_, obj) =>
      alert(obj.message)
    );

    // Cleanup
    return () => {
      window.electron.ipcRenderer.removeAllListeners("auth-success");
      window.electron.ipcRenderer.removeAllListeners("auth-logout");
      window.electron.ipcRenderer.removeAllListeners("token-refresh-success");
      window.electron.ipcRenderer.removeAllListeners("auth-token-copied");
    };
  }, []);

  const handleIPStatusUpdate = async () => {
    const ipStatusOK = await api.checkIpRange();
    setShowVPNPopup(!ipStatusOK);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Check for VPN or gov Network use on load, and every 5 seconds
    handleIPStatusUpdate();
    const interval = setInterval(handleIPStatusUpdate, 5 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <BrowserRouter>
      <Grid container sx={{ height: "100vh" }}>
        {showVPNPopup && <VPNPopup />}
        <Grid size={2}>
          <SideNav accessToken={accessToken} idToken={idToken} />
        </Grid>
        <Grid size={10}>
          <Header
            title="Digital Archives Transfer Service"
            logoLinkElement={
              <Button onClick={() => setLeavePageModalOpen(true)} />
            }
          />
          <Routes>
            <Route
              path="/"
              element={<HomePage authenticated={!!accessToken} />}
            />
            <Route
              path="/file-list"
              element={<FileListPage authenticated={!!accessToken} />}
            />
            <Route path="/send-records" element={<SendRecordsPage />} />
            <Route
              path="/send-records/lan/instructions"
              element={<LanInstructionsPage />}
            />
            <Route
              path="/send-records/lan"
              element={<LanTransferPage authenticated={!!accessToken} />}
            />
          </Routes>
          <ToastContainer
            position="bottom-left"
            autoClose={5000}
            hideProgressBar
            pauseOnHover
          />
        </Grid>
        <LeavePageModal
          open={leavePageModalOpen}
          onClose={() => setLeavePageModalOpen(false)}
          onConfirm={onConfirmLeavePage}
        />
      </Grid>
    </BrowserRouter>
  );
}

export default App;
