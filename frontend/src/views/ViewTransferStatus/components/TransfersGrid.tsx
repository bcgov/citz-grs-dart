import React from "react";
import ITransferDTO from "../../../types/DTO/Interfaces/ITransferDTO";
import { Link } from "react-router-dom";
import { Box, Button, CircularProgress, Paper } from "@mui/material";
import PageviewIcon from "@mui/icons-material/Pageview";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface TransferGridProps {
  transfers: ITransferDTO[];
  loading: boolean;
}

const TransferGrid: React.FC<TransferGridProps> = ({ transfers, loading }) => {
  const columns: GridColDef[] = [
    {
      field: "applicationNumber",
      headerName: "Application Number",
      minWidth: 120,
      width: 150,
    },
    {
      field: "accessionNumber",
      headerName: "Accession Number",
      width: 150,
      minWidth: 120,
    },
    {
      field: "producerMinistry",
      headerName: "Ministry",
      width: 100,
      minWidth: 80,
    },
    {
      field: "producerBranch",
      headerName: "Branch",
      width: 180,
      minWidth: 100,
    },
    {
      field: "transferStatus",
      headerName: "Status",
      width: 240,
      minWidth: 120,
    },
    { field: "description", headerName: "Description", minWidth: 220 },
    {
      field: "action",
      headerName: "Action",
      renderCell: (params) => (
        <Link className="btn btn-light" to={`/edit-transfer/${params.row._id}`}>
          <Button variant="outlined" size="small" startIcon={<PageviewIcon />}>
            Details
          </Button>
        </Link>
      ),
      width: 175,
    },
  ];

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <div style={{ height: 800, width: "100%" }}>
          <DataGrid
            rows={transfers}
            columns={columns}
            getRowId={(row) => row._id}
            rowHeight={35}
            autoHeight
          />
        </div>
      )}
    </Paper>
  );
};

export default TransferGrid;
