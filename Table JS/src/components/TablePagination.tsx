import React from 'react';
import { Box, FormControl, Select, MenuItem, IconButton, Pagination } from '@mui/material';
import { FirstPage, LastPage } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';
import '../styles/TableComponent.scss'
interface TablePaginationProps {
  rowsPerPage: number;
  allowedPagination?: number[];
  onRowsPerPageChange: (event: SelectChangeEvent<number>, child: React.ReactNode) => void;
  page: number;
  pageCount: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onFirstPageButtonClick: () => void;
  onLastPageButtonClick: () => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  rowsPerPage,
  allowedPagination,
  onRowsPerPageChange,
  page,
  pageCount,
  onPageChange,
  onFirstPageButtonClick,
  onLastPageButtonClick
}) => {
  return (
    <Box sx={{position: 'absolute', bottom: '10px', right: '50px'}} mt={2} display="flex" justifyContent="flex-end" alignItems="center">
      <FormControl variant="outlined" size="small" style={{ marginLeft: '1rem' }}>
        <Select value={rowsPerPage} onChange={onRowsPerPageChange} style={{ width: 75 }}>
        {(allowedPagination.length > 0 ? allowedPagination : [5]).map((rows) => (
          <MenuItem key={rows} value={rows}>
            {rows}
          </MenuItem>
        ))}
        </Select>
      </FormControl>
      <IconButton onClick={onFirstPageButtonClick} disabled={page === 1}>
        <FirstPage />
      </IconButton>
      <Pagination count={pageCount} page={page} onChange={onPageChange} color="primary" />
      <IconButton onClick={onLastPageButtonClick} disabled={page === pageCount}>
        <LastPage />
      </IconButton>
    </Box>
  );
};

export default TablePagination;
