import { Grid2 as Grid, Stack, Typography } from "@mui/material";
import { Stepper, Toast } from "@renderer/components";
import { LanUploadFileListView } from "@renderer/components/transfer/lan-views";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  authenticated: boolean;
};

export const LanTransferPage = ({ authenticated }: Props) => {
  const [api] = useState(window.api); // Preload scripts
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [fileList, setFileList] = useState<File | null | undefined>(undefined);

  // Accession & application pulled from fileList
  const [accession, setAccession] = useState<string | undefined | null>(null);
  const [application, setApplication] = useState<string | undefined | null>(
    null
  );
  // User confirms if accession & application are correct
  const [confirmAccAppChecked, setConfirmAccAppChecked] =
    useState<boolean>(false);

  const onNextPress = () => {
    setCurrentViewIndex((prev) => prev + 1);
  };

  // Parse JSON file list
  const parseJsonFile = (): Promise<object> => {
    return new Promise((resolve, reject) => {
      if (fileList) {
        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            if (event.target?.result) {
              const jsonObject = JSON.parse(event.target.result as string);
              resolve(jsonObject);
            } else {
              reject(new Error("File content is empty."));
            }
          } catch (error) {
            reject(new Error("Invalid JSON file."));
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read the file."));
        };

        reader.readAsText(fileList);
      }
    });
  };

  const parseFileList = async () => {
    if (fileList) {
      // Pull accession nad application numbers from xlsx or json file.
      const fileName = fileList.name.toLowerCase();

      if (fileName.endsWith(".xlsx")) {
        // Xlsx file
        const result = await api.transfer.parseXlsxFileList(fileList);
        if (result) {
          const { accession, application } = result;
          setAccession(accession);
          setApplication(application);
        } else {
          toast.error(Toast, {
            data: {
              title: "Missing accession and/or application number",
              message:
                "Your file list (ARS 662) is missing an accession and/or application number. Please add this information to the ‘Cover Page’ tab in the file list and save it, then try uploading the file again.",
            },
          });
        }
      } else if (fileName.endsWith(".json")) {
        // Json file
        type JsonFileList = {
          admin: { accession: string; application: string };
        };
        const json = (await parseJsonFile()) as JsonFileList | null;
        if (json) {
          const accession = json.admin.accession;
          const application = json.admin.application;
          if (
            !accession ||
            !application ||
            accession === "" ||
            application === ""
          )
            toast.error(Toast, {
              data: {
                title: "Missing accession and/or application number",
                message:
                  "Your file list (ARS 662) is missing an accession and/or application number. Please add this information to the ‘admin’ property in the file list and save it, then try uploading the file again.",
              },
            });
          setAccession(accession);
          setApplication(application);
        }
      }
    } else {
      // Reset when file removed
      setAccession(null);
      setApplication(null);
      setConfirmAccAppChecked(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    parseFileList();
  }, [fileList]);
  return (
    <Grid container>
      <Grid size={2} />
      <Grid size={8} sx={{ paddingTop: 3 }}>
        <Stack gap={2}>
          <Typography variant="h2">Send records from LAN Drive</Typography>
          <Stepper
            items={[
              "Upload digital file list (ARS 662)",
              "Upload transfer form (ARS 617)",
              "Submission agreement",
              "Folder upload",
              "Confirmation",
            ]}
            currentIndex={currentViewIndex}
          />
          {currentViewIndex === 0 && (
            <LanUploadFileListView
              file={fileList}
              setFile={setFileList}
              accession={accession}
              application={application}
              confirmChecked={confirmAccAppChecked}
              setConfirmChecked={setConfirmAccAppChecked}
              onNextPress={onNextPress}
            />
          )}
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
