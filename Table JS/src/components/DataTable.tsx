import React, { useState, useEffect, ChangeEvent, useMemo, useRef } from 'react'
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Box,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Typography,
  TablePagination,
  ThemeProvider,
  createTheme,
} from '@mui/material'
import { Column, Row, Settings } from './types' // Importing types
import TableHeader from './TableHeader'
import ColumnConfigDialog from './ColumnConfigDialog'
import TableBodyDetails from './TableBodyDetails'
import '../styles/TableComponent.scss'
import CheckIcon from '@mui/icons-material/Check';

interface DataTableProps {
  rows?: Row[]
  settings?: Settings
  onEdit?: (row: any) => void
  onDelete?: (row: Row) => void
  onShare?: (row: any) => void
  cellClick?: (row: Row) => void
  className?: string
  headerClass?: string
  headerRowClass?: string
  //reg edit props
  onSave?: (row: any) => void
  onUpdate?:(reg: string, vin: string) => Promise<void>
  editedRegNo?: string
  editRowId?: string | null
  setEditedRegNo?: (row: any) => void
  setEditRowId?: (row: any) => void
  setShareRowId?: (row: any) => void
  selectedItem?: (row: string[]) => void
  isList?: boolean
  isStyle?: boolean
  geofenceDataList?: any
  isOn?: boolean
  setIsShared?: (value: boolean) => void;
  selectedRow?:any
  setSelectedRow?:any
  isError?:boolean
  setError?:any
  onAdd?: (row: any) => void
  onRemove?: (row: any) => void
  sortOrder?:any
  filterByStatus?:any
  sortOrderBy?:any
  onDownload?: (row: any) => void
  isDownload?: boolean
  tableStorageKey?: string
  //scrollContainerRef?:any
}

interface Filters {
  [key: string]: any // Adjust 'any' as per your specific filter values
}

const DataTable: React.FC<DataTableProps> = ({
  rows,
  settings,
  onEdit,
  onDelete,
  onShare,
  cellClick,
  className,
  headerClass,
  headerRowClass,
  onSave,
  onUpdate,
  editedRegNo,
  editRowId,
  setEditedRegNo,
  setEditRowId,
  setShareRowId,
  selectedItem,
  isList,
  isStyle,
  geofenceDataList,
  isOn,
  setIsShared,
  selectedRow,
  isError,
  setError,
  setSelectedRow,
  onAdd,
  onRemove,
  sortOrder,
  filterByStatus,
  sortOrderBy,
  //scrollContainerRef
  onDownload,
  tableStorageKey

}) => {
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
            backgroundImage:
              ' linear-gradient(to right,#00a46f 23%,#05798a 68%,#125b93 80%,#1a4b95 100%) !important',
            width: '30px',
            height: '30px',
            marginLeft: '3px',
            '&:hover': {
              backgroundImage:
                ' linear-gradient(to right,#00a46f 23%,#05798a 68%,#125b93 80%,#1a4b95 100%) !important',
            },
          },
        },
      },
    },
  })

  const groupedColumns = useMemo(() => {
    return settings?.columns?.reduce(
      (acc, column) => {
        const group = column?.groupHeader || ''
        if (!acc[group]) {
          acc[group] = []
        }
        acc[group].push(column)
        return acc
      },
      {} as Record<string, Column[]>,
    )
  }, [settings?.columns])

  const orderedColumns = useMemo(() => {
    return Object.keys(groupedColumns ?? {}).reduce((acc, group) => {
      acc.push(...groupedColumns[group])
      return acc
    }, [] as Column[])
  }, [groupedColumns])

  const defaultSortableColumn = orderedColumns?.find(col => col?.sortable)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [orderBy, setOrderBy] = useState(defaultSortableColumn ? defaultSortableColumn.id : '')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings?.rowsPerPage || 5)
  const [open, setOpen] = useState(false)
  const [displayCount, setDisplayCount] = useState(settings?.displayCount || 10);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState(
    orderedColumns.reduce(
      (acc, col) => {
        acc[col?.id] = 250 // Default width for each column
        return acc
      },
      {} as Record<string, number>,
    ),
  )
  const [filters, setFilters] = useState<Record<string, string | string[]>>({})
  const [groupBy, setGroupBy] = useState<string[]>([])
  const [allSelected, setAllSelected] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>(selectedRow)
useEffect(()=>{
  if(isList){
    setOrder(sortOrder)
    setOrderBy(sortOrderBy)
  }
},[sortOrder,filterByStatus,sortOrderBy])

  useEffect(() => {
    selectedItem && selectedItem(selectedRows)
  }, [selectedRows])

  // Helper to get a unique storage key for this table instance
  const getStorageKey = () => {
    if (tableStorageKey) return `visibleColumns_${tableStorageKey}`;
    if (settings?.uniqueKey) return `visibleColumns_${settings.uniqueKey}`;
    const hash = orderedColumns.map(col => col.id).join('_');
    return `visibleColumns_${hash}`;
  };

  useEffect(() => {
    const updatedColumns = Array.from(new Set(orderedColumns.map(col => col.id)));
    const storageKey = getStorageKey();
    const storedVisibleColumns = localStorage.getItem(storageKey);
    if (storedVisibleColumns) {
      // Only keep columns that still exist
      const parsed = JSON.parse(storedVisibleColumns);
      setVisibleColumns(parsed.filter((id: string) => updatedColumns.includes(id)));
    } else {
      setVisibleColumns(updatedColumns);
    }
  }, [orderedColumns])

  useEffect(() => {
    setPage(1)
  }, [groupBy])

  useEffect(() => {
    const container = scrollContainerRef.current;

    const handleScroll = () => {
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 200;

      if (nearBottom) {
        setDisplayCount(prev => Math.min(prev + 10, rows.length)); // Load 20 more
      }
    };

    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [rows]);

  useEffect(() => {
    // Load visible columns from localStorage on component mount
    const storageKey = getStorageKey();
    const storedVisibleColumns = localStorage.getItem(storageKey);
    if (storedVisibleColumns) {
      setVisibleColumns(JSON.parse(storedVisibleColumns));
    }
  }, []);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';

    setOrder(newOrder);
    setOrderBy(property)
  };


  const handleSelectRow = (rowId: string) => {
    setSelectedRows(prevSelectedRows => {
      const updatedRows = prevSelectedRows.includes(rowId)
        ? prevSelectedRows.filter(id => id !== rowId)
        : [...prevSelectedRows, rowId];
      return updatedRows;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    const uniqueKey = settings?.uniqueKey ?? '' // Provide a default value for settings.uniqueKey if settings is undefined
    setAllSelected(checked)
    setSelectedRows(checked ? (rows?.map(row => row[uniqueKey]) ?? []) : [])
  }

  const handleFilterChange = (
    event: any, // Adjust the type as per your actual event type
    columnId: string | number,
  ) => {
    if (columnId === 'date') {
      if (event.target.value[0] && event.target.value[1]) {
        setFilters(prevFilters => ({
          ...prevFilters,
          [columnId]: event.target.value,
        }))
      } else {
        const { date, ...rest } = filters // Destructure and remove 'date'
        setFilters(rest)
      }
    } else {
      setFilters(prevFilters => ({
        ...prevFilters,
        [columnId]: event.target.value,
      }))
    }
    setPage(1)
  }

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage)
  }

  const handleFirstPageButtonClick = () => {
    setPage(1)
  }

  const handleLastPageButtonClick = () => {
    setPage(pageCount)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0) // Reset pagination to the first page
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns(prev => {
      const updatedColumns = prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId];

      // Save updated columns to localStorage with unique key
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(updatedColumns));
      return updatedColumns;
    });
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  const filteredRows = useMemo(() => {
    return (rows ?? []).filter(row => {
      return Object.keys(filters).every(columnId => {
        const filterValue = filters[columnId]

        // If filter value is an empty string or an empty array, skip filtering for this column
        if (filterValue === '' || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true
        }

        const cellValue = String(getNestedValue(row, columnId) || '').toLowerCase()

        if (
          columnId === 'date' &&
          Array.isArray(filterValue) &&
          filterValue.length === 2 &&
          !isNaN(Date.parse(filterValue[0])) &&
          !isNaN(Date.parse(filterValue[1]))
        ) {
          // Date range filtering
          const startDate = new Date(filterValue[0])
          const endDate = new Date(filterValue[1])
          const rowDate = new Date(cellValue)

          startDate.setHours(0, 0, 0, 0)
          endDate.setHours(23, 59, 59, 999) // Include the whole end date
          rowDate.setHours(0, 0, 0, 0)

          return rowDate >= startDate && rowDate <= endDate
        } else if (Array.isArray(filterValue)) {
          // Array filter: Check if the cell value matches any of the array elements
          return filterValue.some(value => {
            const normalizedValue = String(value).toLowerCase()
            return cellValue.includes(normalizedValue)
          })
        } else {
          // Partial text or number filtering
          const normalizedFilterValue = String(filterValue || '').toLowerCase()
          const normalizedCellValue = cellValue

          // For numbers, check if the cell value contains the filter value as a substring
          if (!isNaN(Number(filterValue)) && !isNaN(Number(cellValue))) {
            return cellValue.includes(filterValue)
          }

          // Fallback to partial string comparison
          return normalizedCellValue.includes(normalizedFilterValue)
        }
      })
    })
  }, [rows, filters])


    const descendingComparator = (a: Row, b: Row, orderBy: string, geofenceDataList: any[]) => {
      const getValue = (obj: any, path: string) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

      // Special handling for geofence_name column
      const getGeofenceName = (vin_number: string) => {
        const geofenceData = geofenceDataList?.find((item: any) => item.vin_number === vin_number);
        return geofenceData?.geofence_name?.join(', ') ?? ''; // Return geofence names as a string, or an empty string
      };

      const aValue = orderBy === 'geofence_name' ? getGeofenceName(a.vin_number) : getValue(a, orderBy);
      const bValue = orderBy === 'geofence_name' ? getGeofenceName(b.vin_number) : getValue(b, orderBy);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Check if the column is numeric
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return orderBy === 'desc' ? bNum - aNum : aNum - bNum; // Numeric comparison
      }

      // Check if the column is a date
      const parseDate = (value: string): Date | null => {
        const ddmmyyyyMatch = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (ddmmyyyyMatch) {
          const [, day, month, year] = ddmmyyyyMatch;
          const date = new Date(`${year}-${month}-${day}`);
          return isNaN(date.getTime()) ? null : date;
        }

        const yyyymmddMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (yyyymmddMatch) {
          const [, year, month, day] = yyyymmddMatch;
          const date = new Date(`${year}-${month}-${day}`);
          return isNaN(date.getTime()) ? null : date;
        }

        return null;
      };

    // Try parsing as dates
    const aDate = parseDate(String(aValue));
    const bDate = parseDate(String(bValue));
    if (aDate && bDate) {
      return bDate.getTime() - aDate.getTime(); // Date comparison
    }

    // Fallback to string comparison
    return String(bValue).localeCompare(String(aValue));
  };

  const getComparator = (order: 'asc' | 'desc', orderBy: string, geofenceDataList: any[]) => {
    // Return the comparator function based on the order ('asc' or 'desc')
    return order === 'desc'
      ? (a: Row, b: Row) => descendingComparator(a, b, orderBy, geofenceDataList)
      : (a: Row, b: Row) => -descendingComparator(a, b, orderBy, geofenceDataList);
  }

  const stableSort = (array: Row[], comparator: (a: Row, b: Row) => number) => {
    const stabilizedThis = array.map((el, index) => [el, index] as [Row, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]); // Pass only a and b to the comparator
      if (order !== 0) return order;
      return a[1] - b[1]; // Preserve original index
    });
    return stabilizedThis.map(el => el[0]);
  };

  const handleMouseDown = (
    columnId: string,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const startX = event.clientX
    const startWidth = columnWidths[columnId]
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX)
      setColumnWidths(prevWidths => ({
        ...prevWidths,
        [columnId]: newWidth,
      }))
    }
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const sortedRows = orderBy
    ? stableSort(filteredRows, getComparator(order, orderBy, geofenceDataList))
    : filteredRows

  const groupedRows = groupBy.length
    ? sortedRows.reduce(
        (acc, row) => {
          // Build a composite group key from all selected groupBy fields
          const groupKey = groupBy
            .map(key => {
              const value = key.split('.').reduce((obj, k) => obj?.[k], row)
              return value instanceof Date
                ? value.toLocaleDateString('en-GB')
                : String(value)
            })
            .join(' | ')

          if (!acc[groupKey]) {
            acc[groupKey] = []
          }
          acc[groupKey].push(row)
          return acc
        },
        {} as Record<string, Row[]>,
      )
    : { '': sortedRows }

  const isGroupHeader = (item: any): item is { groupKey: string; isGroupHeader: boolean } => {
    return item && item.isGroupHeader
  }

  let flattenedRows = Object.entries(groupedRows).reduce(
    (acc, [groupKey, rows]) => {
      acc.push({ groupKey, isGroupHeader: true })
      acc.push(...rows)
      return acc
    },
    [] as Array<{ groupKey: string; isGroupHeader: boolean } | Row>,
  )

  if (!groupBy.length) {
    flattenedRows = flattenedRows.slice(1)
  }

  useEffect(() => {
    setPage(0);
  }, [flattenedRows?.length]); // ✅ Ensures page starts from 0 when data updates


  const pageCount = Math.max(1, Math.ceil(flattenedRows.length / rowsPerPage));
const validPage = Math.min(Math.max(0, page), pageCount - 1);

const startIndex = validPage * rowsPerPage;
const endIndex = Math.min(startIndex + rowsPerPage, flattenedRows.length);
const paginatedRows = settings?.pagination ? flattenedRows.slice(startIndex, endIndex) : flattenedRows;

const datarow = paginatedRows.slice(0, displayCount)

  const headerGroups = useMemo(() => {
    return orderedColumns.reduce(
      (acc, column) => {
        const group = column?.groupHeader || '' // Ensure group is always a string
        if (visibleColumns.includes(column?.id)) {
          if (!acc[group]) {
            acc[group] = []
          }
          acc[group].push(column)
        }
        return acc
      },
      {} as Record<string, Column[]>,
    )
  }, [orderedColumns, visibleColumns])

  const groupByOptions = (settings?.columns ?? []).filter(column => column?.groupBy)

  return (
    <div>
      {rows && rows.length > 0 ? (
        <>
          {settings?.groupBy && (
            <Box display="flex" justifyContent="space-between" mb={2} className="groupby">
              <FormControl variant="outlined" size="small">
                <InputLabel id="group-by-label">Group By</InputLabel>
                <Select
                  labelId="group-by-label"
                  multiple
                  value={groupBy}
                  onChange={e => {
                    const value = typeof e.target.value === 'string'
                      ? e.target.value.split(',')
                      : (e.target.value as string[]);
                    // If "None" is clicked, clear all selections
                    if (value.includes('__none__')) {
                      setGroupBy([]);
                    } else if (value.length <= 3) {
                      setGroupBy(value);
                    }
                  }}
                  label="Group By"
                  style={{ width: 175, height: 100 }}
                  renderValue={(selected) =>
                    selected.length === 0
                      ? 'None'
                      : `${selected.length} selected`
                  }
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 300, marginLeft: 40 }
                    }
                  }}
                >
                  <MenuItem
                    value="__none__"
                    // Only show "None" if something is selected
                    style={{ display: groupBy.length === 0 ? 'none' : undefined }}
                  >
                    <em>None</em>
                  </MenuItem>
                  {groupByOptions.map(option => (
                    <MenuItem
                      key={option.id}
                      value={option.id}
                      disabled={
                        groupBy.length >= 3 && !groupBy.includes(option.id)
                      }
                    >
                      {groupBy.includes(option.id) ? (
                        <CheckIcon sx={{ color: '#1A4B95', marginRight: 1 }} />
                      ) : (
                        <span style={{ width: 24, display: 'inline-block' }} />
                      )}
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {settings.columnConfiguration && (
                <Button variant="outlined" onClick={handleClickOpen}>
                  Configure Columns
                </Button>
              )}
              <ColumnConfigDialog
                open={open}
                onClose={handleClose}
                columns={orderedColumns}
                visibleColumns={visibleColumns}
                onToggleColumn={handleToggleColumn}
              />
            </Box>
          )}
          <TableContainer>
            <Box
              ref={scrollContainerRef}
              className={className}
              sx={{ overflowX: 'auto', whiteSpace: 'nowrap', width: '100%' }}
            >
              <Table className="datatable" sx={{ minWidth: '100%' }}>
                <TableHead
                  className={headerClass}
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: isList ? 800 : 10,
                    background: '#1a4b95',
                  }}
                >
                  {settings?.groupHeader && Object.keys(headerGroups).length > 1 && (
                    <TableRow style={{ height: '30px' }}>
                      {Object.keys(headerGroups).map(group => (
                        <TableCell
                          key={group}
                          colSpan={headerGroups[group].length}
                          align="center"
                          className={headerRowClass}
                          style={{
                            fontWeight: 500,
                            border: '1px solid rgb(204, 204, 204)',
                            padding: '5px',
                          }}
                        >
                          {group}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                  <TableHeader
                    columns={orderedColumns}
                    visibleColumns={visibleColumns}
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    columnWidths={columnWidths}
                    onMouseDown={handleMouseDown}
                    rows={rows}
                    allSelected={allSelected}
                    onSelectAll={handleSelectAll}
                    selectedRows={selectedRows}
                    checkbox={settings?.rowCheckbox ?? false}
                    isEdit={settings?.isEdit ?? false}
                    isDelete={settings?.isDelete ?? false}
                    isList={isList}
                    isStyle={isStyle}
                    isOn={isOn}
                    isAdd={settings?.isAdd ?? false}
                    isRemove={settings?.isRemove ?? false}
                    isError={isError}
                    setError={setError}
                  />
                </TableHead>
                {filteredRows.length === 0 ? (
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={visibleColumns.length}
                        align="center"
                        sx={{ padding: '20px', color: 'text.secondary' }}
                      >
                        <Typography variant="h6">No data found</Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <TableBodyDetails
                    rows={rows}
                    paginatedRows={datarow}
                    orderedColumns={orderedColumns}
                    visibleColumns={visibleColumns}
                    columnWidths={columnWidths}
                    columns={orderedColumns}
                    selectedRows={selectedRows}
                    selectedRow={selectedRow}
                    onSelectRow={handleSelectRow}
                    checkbox={settings?.rowCheckbox ?? false}
                    uniqueKey={settings?.uniqueKey ?? ''}
                    isEdit={settings?.isEdit ?? false}
                    isDelete={settings?.isDelete ?? false}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onShare={onShare}
                    cellClick={cellClick}
                    onSave={onSave}
                    onUpdate={onUpdate}
                    editedRegNo={editedRegNo}
                    editRowId={editRowId}
                    setEditedRegNo={setEditedRegNo}
                    setEditRowId={setEditRowId}
                    setShareRowId={setShareRowId}
                    isList={isList}
                    isOn={isOn}
                    geofenceDataList={geofenceDataList}
                    setIsShared={setIsShared}
                    isAdd={settings?.isAdd ?? false}
                    isRemove={settings?.isRemove ?? false}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    isError={isError}
                    setError={setError}
                    isDownload={settings?.isDownload ?? false}
                    onDownload={onDownload}
                  />
                )}
              </Table>
            </Box>
          </TableContainer>
          <ThemeProvider theme={theme}>
            {settings?.pagination && rows && rows.length > 0 && filteredRows.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 25, 50]}
                component="div"
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                labelRowsPerPage="Rows per page"
                labelDisplayedRows={({ page, count }) => {
                  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
                  return `Page ${page + 1} of ${totalPages}`;
                }}
                showFirstButton={true}
                showLastButton={true}
                sx={{
                  backgroundColor: '#fff',
                  paddingBottom: '10px',
                  marginRight: '13px',
                  '& .MuiTablePagination-toolbar': {
                    minHeight: '10px',
                    paddingRight: '',
                  },
                  '& .MuiTablePagination-selectLabel': {
                    marginBottom: 0.5,
                  },
                }}
              />
            )}
          </ThemeProvider>
        </>
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          m={2}
        >
          <Typography variant="h6" color="textSecondary">
            No data found
          </Typography>
        </Box>
      )}
    </div>
  )
}

export default DataTable
