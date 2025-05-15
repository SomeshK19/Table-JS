import React, { useState, useEffect, ChangeEvent } from 'react'
import {
  TableRow,
  TableCell,
  TableSortLabel,
  TextField,
  MenuItem,
  Checkbox,
  Select,
  ListItemText,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  SelectChangeEvent,
  FormControlLabel,
} from '@mui/material'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import Tooltip from '@mui/material/Tooltip'
import { Column, Row } from '../types/index' // Importing types

interface TableHeaderProps {
  columns: Column[]
  visibleColumns: string[]
  order: 'asc' | 'desc'
  orderBy: string
  onRequestSort: (property: string) => void
  filters: Record<string, string | string[]>
  onFilterChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string[]>,
    columnId: string,
  ) => void
  columnWidths: Record<string, number>
  onMouseDown: (columnId: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  rows?: Row[]
  allSelected: boolean
  onSelectAll?: (checked: boolean) => void
  selectedRows: string[]
  checkbox?: boolean
  isEdit?: boolean
  isDelete?: boolean
  isList?: boolean
  isStyle?: boolean
  isOn?: any
  isError?: boolean
  setError?: any
}

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  visibleColumns,
  order,
  orderBy,
  onRequestSort,
  filters,
  onFilterChange,
  columnWidths,
  onMouseDown,
  rows = [],
  allSelected,
  onSelectAll,
  selectedRows,
  checkbox,
  isList,
  isStyle,
  isOn,
  isError,
  setError
}) => {
  const [dateRange, setDateRange] = useState<[Date | undefined, Date | undefined]>([undefined, undefined])
  const [startDate, endDate] = dateRange

  const currentDate = new Date()
  const minDate = new Date(currentDate)
  minDate.setDate(minDate.getDate() - 90)
  const maxDate = currentDate

  const headerCellStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    fontSize: '14px',
    fontWeight: 500,
    position: 'relative',
    padding: '5px',
  }

  const resizeHandleStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '5px',
    cursor: 'col-resize',
    zIndex: 1,
  }

  useEffect(() => {
    onFilterChange({ target: { value: dateRange } } as any, 'date')
  }, [dateRange])

  const getFilteredRows = (excludeColumnId: string): Row[] => {
    return rows.filter(row => {
      return columns.every(col => {
        if (col.id === excludeColumnId) return true // Skip the current column's filter
        const filterValue = filters[col.id]
        if (!filterValue) return true // No filter applied
        switch (col.filterType) {
          case 'text':
            return row[col.id]?.toString().toLowerCase().includes((filterValue as string).toLowerCase())
          case 'number':
            return row[col.id] == filterValue // Exact match
          case 'checkbox':
            if ((filterValue as string[]).length === 0) return true
            return (filterValue as string[]).includes(row[col.id] as string)
          case 'date':
            const [start, end] = filterValue as [Date | undefined, Date | undefined]
            if (!start && !end) return true
            const date = new Date(row[col.id] as string)
            if (start && date < start) return false
            if (end && date > end) return false
            return true
          default:
            return true
        }
      })
    })
  }

  const handleSelectAllChange = (columnId: string, isSelected: boolean, uniqueValues: string[]) => {
    const newValue = isSelected ? uniqueValues : []
    onFilterChange({ target: { value: newValue } } as any, columnId)
  }

  const handleSelectChange = (event: SelectChangeEvent<string[]>, columnId: string) => {
    onFilterChange(event, columnId)
  }

  const renderFilter = (column: Column) => {
    switch (column.filterType) {
      case 'text':
        return (
          <Tooltip title={column.label} arrow placement="top">
            <TextField
              value={filters[column.id] || ''}
              onChange={event => onFilterChange(event, column.id)}
              placeholder={`${column.label}`}
              variant="outlined"
              size="small"
              margin="dense"
              fullWidth
            />
          </Tooltip>
        )
      case 'number':
        return (
          <TextField
            value={filters[column.id] || ''}
            onChange={event => onFilterChange(event, column.id)}
            placeholder={`Filter ${column.label}`}
            variant="outlined"
            size="small"
            margin="dense"
            fullWidth
          />
        )
      case 'checkbox':
        const filteredRows = getFilteredRows(column.id)
        const uniqueValues = [...new Set(filteredRows.map(row => row[column.id] as string))].filter(Boolean)
        const isSelectAllChecked =
          uniqueValues.length > 0 &&
          uniqueValues.every(value => (filters[column.id] as string[])?.includes(value))
        const selectedCount = (filters[column.id] as string[])?.length || 0
        return (
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel shrink={selectedCount > 0 ? true : undefined}>
              {selectedCount === 0 ? ` ${column.label}` : ''}
            </InputLabel>
            <Select
              multiple
              value={(filters[column.id] as string[]) || []}
              onChange={event => handleSelectChange(event, column.id)}
              renderValue={selected => `${column.label} (${(selected as string[]).length})`}
              label={`${column.label}`}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiMenuItem-root': {
                      paddingTop: '0px',
                      paddingBottom: '0px',
                      paddingLeft: '10px',
                    },
                    '& .MuiMenu-list': {
                      paddingTop: '0px',
                      paddingBottom: '0px',
                    },
                  },
                },
              }}
            >
              <FormControlLabel
                sx={{ marginLeft: '16px' }}
                control={
                  <Checkbox
                    checked={isSelectAllChecked}
                    indeterminate={
                      (filters[column.id] as string[])?.length > 0 &&
                      (filters[column.id] as string[])?.length < uniqueValues.length
                    }
                    onChange={event =>
                      handleSelectAllChange(column.id, event.target.checked, uniqueValues)
                    }
                  />
                }
                label="Select All"
              />
              {uniqueValues.map(value => (
                <MenuItem key={value} value={value}>
                  <Checkbox
                    sx={{ marginLeft: '6px' }}
                    checked={(filters[column.id] as string[])?.includes(value) || false}
                  />
                  <ListItemText primary={value} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      case 'date':
        return (
          <FormControl variant="outlined" size="small" fullWidth>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={update => {
                setDateRange(update as [Date | undefined, Date | undefined])
              }}
              placeholderText={`${column.label}`}
              dateFormat="dd/MM/yyyy"
              isClearable
              minDate={minDate}
              maxDate={maxDate}
              customInput={
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton>
                          <CalendarTodayIcon sx={{ color: 'white', fontSize: '15px' }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              }
            />
          </FormControl>
        )
      default:
        return null
    }
  }

  const orderedColumns = columns.filter(column => column.id !== 'action')
  const hasActionId = columns.some(item => item.id === 'action')
  if (hasActionId) {
    orderedColumns.push(columns.find(column => column.id === 'action')!)
  }

  const filteredColumns = orderedColumns.filter(column => {
    if (!visibleColumns.includes(column.id)) return false
    if (!column.label) return false
    if (isList && column.label.trim() === 'Status Age') return false
    if (isList && column.label.trim() === 'E-Norm') return false
    if (isList && (column.label.trim() === 'Vin Number' || column.label.trim() === 'Vin No')) return false
    if (!isOn && column.label.trim() === 'Geofence') return false
    return true
  })

  return (
    <TableRow style={{ height: '30px' }}>
      {/* {checkbox && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={selectedRows.length === rows.length}
            onChange={e => onSelectAll && onSelectAll(e.target.checked)}
          />
        </TableCell>
      )} */}
      {filteredColumns.map(column => (
        <TableCell
          key={column.id}
          style={{
            ...headerCellStyle,
            width: columnWidths[column.id],
            ...(column.id === 'regn_number' && isList && {
              position: 'sticky',
              left: 0,
              top: 0,
              zIndex: 1200,
              background: '#1a4b95',
            }),
            ...(column.id === 'vehicle_type' && isList && {
              position: 'sticky',
              right: 0,
              top: 0,
              width: '411px !important',
              zIndex: 1200,
              background: '#1a4b95',
              color: 'white',
            }),
            ...(column.id === 'regno' && {
              position: 'sticky',
              left: 0,
              top: 0,
              zIndex: 1200,
              background: '#1a4b95',
            }),
          }}
        >
          {!column.sortable && <>{column.label}</>}
          {column.filterable && renderFilter(column)}
          {column.sortable && (
            <TableSortLabel
              sx={{
                ...(isStyle && {
                  color: 'white',
                  '&.Mui-active': { color: 'white' },
                  '&:hover': { color: 'white' },
                  '& .MuiTableSortLabel-icon': { color: 'white !important' },
                  '&.MuiTableSortLabel-active .MuiTableSortLabel-icon': {
                    color: 'white !important',
                  },
                }),
                width: 'max-content',
              }}
              active={orderBy ? orderBy === column.id : isList && column.id === "event_utc"}
              direction={orderBy === column.id ? order : isList && order ? 'desc' : 'asc'}
              onClick={() => onRequestSort(column.id)}
            >
              {!column.filterable && <>{column.label}</>}
            </TableSortLabel>
          )}
          <div style={resizeHandleStyle} onMouseDown={event => onMouseDown(column.id, event)} />
        </TableCell>
      ))}
    </TableRow>
  )
}

export default TableHeader