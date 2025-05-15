import React, { useState, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TablePagination,
  TextField,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { ReactComponent as Asc } from '../assets/Assets/asc_new.svg';
import { ReactComponent as Desc } from '../assets/Assets/desc_new.svg';
import './TableComponent.scss';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { convertDateFormat } from '../utils';
import { Dispatch, SetStateAction } from 'react';

interface Column {
  id: string;
  title: string;
  sort?: string;
  sortable?: boolean;
  dataType?: string;
  searchable?: boolean;
  showIcon?: boolean;
  unit?: string;
}

interface ListTableComponentProps<T> {
  columns: Column[];
  data: T[];
  renderRow: (row: T, index: number) => ReactNode;
  onSort: (columnId: string, direction: 'asc' | 'desc') => void;
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  showHeaders?: boolean;
  isCheckbox?: boolean;
  isPagination?: boolean;
  loading?: boolean;
  onChange?: () => void;
  checked?: boolean;
  searchCol?: { [key: string]: string };
  setSearchCol?: Dispatch<SetStateAction<{ [key: string]: string }>>;
}

const ListTableComponent = <T,>({
  columns,
  data,
  renderRow,
  onSort,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  showHeaders,
  isCheckbox = false,
  isPagination,
  loading,
  onChange,
  checked,
  searchCol,
  setSearchCol,
}: ListTableComponentProps<T>) => {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortColumn, setSortColumn] = useState<string>(columns[0]?.id);

  const theme = createTheme({
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            height: '16px !important',
          },
          input: {
            height: '12px !important',
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          select: {
            position: 'relative',
            bottom: '-1px',
          },
          displayedRows: {
            marginBottom: '0px',
          },
          actions: {
            marginBottom: '8px',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: '#fff !important',
            backgroundColor: '#00c288 !important',
            width: '30px',
            height: '30px',
            marginLeft: '3px',
            '&:hover': {
              backgroundColor: '#00c288 !important',
            },
          },
        },
      },
    },
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>, columnId: string) => {
    console.log(event.target.value);
    if (setSearchCol) {
      setSearchCol(prev => ({
        ...prev,
        [columnId]: event.target.value?.trim(),
      }));
    }
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const toggleSortDirection = (e: any, id: string) => {
    if ((e.target as HTMLElement).getAttribute('data-source') === 'checkbox') {
      return;
    }
    if (sortColumn === id) {
      setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortDirection('asc');
      setSortColumn(id);
    }
    onSort(id, sortDirection);
  };

  const filteredData = data?.filter(row => {
    return columns.every(column => {
      if (!column.searchable || !searchCol?.[column.id]) return true;
      const cellValue: any = column.id.split('.').reduce((acc: any, key) => acc?.[key], row);
      console.log(cellValue);
      let cellValueString = '';
      if (cellValue !== undefined && cellValue !== null) {
        if (typeof cellValue === 'string') {
          if (!isNaN(Date.parse(cellValue))) {
            cellValueString = cellValue;
          } else {
            cellValueString = cellValue.toLowerCase();
          }
        } else if (typeof cellValue === 'number') {
          cellValueString = cellValue.toFixed(1).toLowerCase();
        } else {
          cellValueString = String(cellValue).toLowerCase();
        }
      }
      const searchValue = searchCol[column.id].toLowerCase();
      const isDateColumn = column.id === 'date';
      const formattedSearchValue = isDateColumn ? searchValue : searchValue;
      return cellValueString.includes(formattedSearchValue);
    });
  });

  const paginatedData = filteredData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const isPaginationFixed = filteredData?.length < rowsPerPage * 2;
  const vehicleType: string = 'vehicle_type';
  const vNum: string = 'vin_number';

  return (
    <Box
      className="assign_div"
      sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 165px)' }}
    >
      <TableContainer
        className="TableComponent__main"
        style={{ flexGrow: 1, overflow: 'auto', maxHeight: 'calc(100vh - 165px)' }}
        component={Paper}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: '#00c288',
                '& th': { backgroundColor: '#00c288', color: 'white' },
              }}
            >
              {columns.map((column, index) => (
                <TableCell
                  key={column.id}
                  sx={{
                    color: 'white',
                    borderRight: '1px solid white',
                    borderBottom: 'none',
                    padding: '5px',
                    cursor: column.sortable ? 'pointer' : 'default',
                  }}
                >
                  {showHeaders && column.searchable ? (
                    <TextField
                      size="small"
                      placeholder={`Search ${column.title}`}
                      value={searchCol?.[column.id] || ''}
                      onChange={(event: any) => handleSearchChange(event, column.id)}
                      sx={{
                        backgroundColor: 'white',
                        color: 'black',
                        borderRadius: '5px',
                      }}
                      InputProps={{
                        sx: {
                          height: '28px',
                          padding: '0 10px',
                        },
                      }}
                    />
                  ) : (
                    <Box
                      className="Vehicle__List--Header"
                      key={column.id}
                      sx={{ borderBottom: 'none' }}
                      onClick={e => column.sortable && toggleSortDirection(e, column.id)}
                      aria-sort={
                        sortColumn === column.id
                          ? sortDirection === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isCheckbox === false && column.sortable && sortColumn === column.id && (
                          <>
                            {sortDirection === 'asc' ? (
                              <Asc style={{ marginRight: '5px', width: '23px' }} />
                            ) : (
                              <Desc style={{ marginRight: '5px', width: '23px' }} />
                            )}
                          </>
                        )}
                        {isCheckbox && index === 0 ? (
                          <>
                            <Checkbox
                              className="check"
                              checked={checked}
                              onClick={e => e.stopPropagation()}
                              onChange={onChange}
                            />
                            {column.title}
                            {column.sortable && sortColumn === column.id && (
                              <>
                                {sortDirection === 'asc' ? (
                                  <Asc style={{ marginRight: '5px', width: '23px' }} />
                                ) : (
                                  <Desc style={{ marginRight: '5px', width: '23px' }} />
                                )}
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {(column.id === vehicleType || column.id === vNum) &&
                              column.sortable &&
                              sortColumn === column.id && (
                                <>
                                  {sortDirection === 'asc' ? (
                                    <Asc style={{ marginRight: '5px', width: '23px' }} />
                                  ) : (
                                    <Desc style={{ marginRight: '5px', width: '23px' }} />
                                  )}
                                </>
                              )}
                            {column.title}
                          </>
                        )}
                        {column?.unit ? column?.unit : ''}
                      </div>
                    </Box>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell sx={{ borderBottom: 'none' }} colSpan={columns.length} align="center">
                  <CircularProgress sx={{ color: '#00c288' }} />
                </TableCell>
              </TableRow>
            ) : paginatedData?.length ? (
              paginatedData.map((row, index) => renderRow(row, index))
            ) : (
              <TableRow>
                <TableCell sx={{ borderBottom: 'none' }} colSpan={columns.length} align="center">
                  No Data Available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {isPagination ? (
        <ThemeProvider theme={theme}>
          <TablePagination
            rowsPerPageOptions={[50, 100, 200]}
            component="div"
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            count={filteredData?.length || 0}
            rowsPerPage={rowsPerPage}
            labelRowsPerPage="Rows per page"
            labelDisplayedRows={() => {
              const totalItems = filteredData?.length || 0;
              const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
              return `Page ${Math.min(page + 1, totalPages)} of ${totalPages}`;
            }}
            sx={{
              position: isPaginationFixed ? 'fixed' : 'relative',
              bottom: isPaginationFixed ? '0' : 'auto',
              left: '0',
              right: '0',
              backgroundColor: '#fff',
              zIndex: 1,
              paddingBottom: '10px',
              marginRight: '13px',
              '& .MuiTablePagination-toolbar': {
                minHeight: '10px',
                paddingRight: '',
              },
              '& .MuiTablePagination-selectLabel': {
                position: 'relative !important',
                top: '8px',
              },
            }}
          />
        </ThemeProvider>
      ) : null}
    </Box>
  );
};

export default ListTableComponent;