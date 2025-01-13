import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type useGridApiRef,
} from "@mui/x-data-grid";
import {
  DeleteOutline as DeleteIcon,
  Circle as ProgressIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

type Row = {
  id: number;
  folder: string;
  invalidPath: boolean;
  progress: number;
};

type Props = {
  rows: Row[];
  onFolderDelete: (folder: string) => Promise<void> | void;
  onFolderEdit: (folder: string) => Promise<void> | void;
  processRowUpdate: (newRow: Row) => Row;
  apiRef: ReturnType<typeof useGridApiRef>;
};

export const FolderUploadGrid = ({
  rows,
  onFolderDelete,
  onFolderEdit,
  processRowUpdate,
  apiRef,
}: Props) => {
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "progress",
      headerName: "Status",
      description: "Progress of the folder upload.",
      width: 95,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Stack direction="row" gap={1}>
            <Tooltip
              title={
                params.row.progress === 100
                  ? "Upload complete."
                  : params.row.invalidPath
                  ? "Folder path could not be found. Use the edit button to change folder path."
                  : "Upload in progress."
              }
            >
              <ProgressIcon
                sx={{
                  color:
                    params.row.progress === 100
                      ? "var(--progress-complete)"
                      : params.row.invalidPath
                      ? "var(--progress-cancelled)"
                      : "var(--progress-incomplete)",
                }}
              />
            </Tooltip>
            <Typography>
              {params.row.invalidPath || params.row.progress === 0
                ? ""
                : `${params.row.progress}%`}
            </Typography>
          </Stack>
        </Box>
      ),
    },
    {
      field: "folder",
      headerName: "Folder path",
      flex: 1,
      description: "Network path to the folder.",
    },
    {
      field: "edit",
      headerName: "Edit",
      description: "Used to modify folder path when the path is invalid.",
      width: 70,
      renderCell: (params) => (
        <>
          {params.row.invalidPath ? (
            <Tooltip
              title="Folder path is invalid and must be edited."
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <IconButton
                color="error"
                onClick={() => onFolderEdit(params.row.folder)}
                aria-label="delete"
              >
                <EditIcon
                  sx={{
                    color: "var(--icon)",
                  }}
                />
              </IconButton>
            </Tooltip>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <IconButton
                color="error"
                disabled={true}
                onClick={() => onFolderEdit(params.row.folder)}
                aria-label="delete"
              >
                <EditIcon
                  sx={{
                    color: "var(--icon-disabled)",
                  }}
                />
              </IconButton>
            </Box>
          )}
        </>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      description: "Used to remove the folder from your transfer.",
      width: 70,
      renderCell: (params) => (
        <Tooltip
          title="Delete folder from transfer."
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <IconButton
            color="error"
            onClick={() => onFolderDelete(params.row.folder)}
            aria-label="delete"
          >
            <DeleteIcon sx={{ color: "var(--icon)" }} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        apiRef={apiRef}
        disableRowSelectionOnClick
        disableColumnFilter
        disableColumnSorting
        disableColumnMenu
        editMode="row"
        hideFooter
        processRowUpdate={processRowUpdate}
      />
    </Box>
  );
};
