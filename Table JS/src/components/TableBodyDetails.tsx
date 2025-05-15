import React, { useState } from 'react';
import { IconButton, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { Column, DDMMYYYY, Row } from '../types';
import { formatDate, convert24HrsTimeTo12Hrs, convertDateFormat } from '../utils';
import Checkbox from '@mui/material/Checkbox';
import EditIcon from '../assets/Assets/EditColor.svg';
import DownloadIcon from '../assets/Assets/downloadTemplate.svg';
import DeleteIcon from '../assets/Assets/DeleteColor.svg';
import ShareIcon from '@mui/icons-material/Share';
import { Box, styled } from '@mui/system';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Geo } from '../assets/Assets/Geofence.svg';
import { ReactComponent as Location } from '../assets/Assets/Location.svg';
import BlockIcon from '@mui/icons-material/Block';

interface TableBodyDetailsProps {
  rows?: Row[];
  paginatedRows: Row[];
  orderedColumns: Column[];
  visibleColumns: string[];
  columnWidths: Record<string, number>;
  columns: Column[];
  selectedRows: string[];
  onSelectRow: (rowId: string) => void;
  checkbox?: boolean;
  uniqueKey?: string;
  isEdit?: boolean;
  isDelete?: boolean;
  onEdit?: (row: Row) => void;
  onDelete?: (row: Row) => void;
  cellClick?: (row: Row) => void;
  onSave?: (row: any) => void;
  onUpdate?: (reg: string, vin: string) => Promise<void>;
  editedRegNo?: string;
  editRowId?: string | null;
  setEditedRegNo?: (row: any) => void;
  setEditRowId?: (row: any) => void;
  setShareRowId?: (row: any) => void;
  isList?: boolean;
  geofenceDataList?: any;
  isOn?: boolean;
  isShare?: boolean;
  onShare?: (row: Row) => void;
  setIsShared?: (value: boolean) => void;
  selectedRow?: any;
  isAdd?: boolean;
  isRemove?: boolean;
  onAdd?: (row: any) => void;
  onRemove?: (row: any) => void;
  isError?: boolean;
  setError?: any;
  isDownload?: boolean;
  onDownload?: (row: any) => void;
  showAlert?: (message: string, onConfirm: () => void, onCancel: () => void) => void;
  showErrorPopup?: (title: string, message: string, onClose: () => void) => void;
  // New props to replace ListViewUtils
  icons?: Array<{ label: string; icon: React.ReactNode; redirectScreen?: string }>;
  dostVariants?: string[];
  getBS6Value?: (params: { isBS6: boolean; vehicleType: string }) => string;
  getStatusStyle?: (status: string) => { backgroundColor: string; label: string };
}

const CustomCellTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} placement="top" arrow />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#ffffff',
    color: '#333333',
    fontSize: '12px',
    borderRadius: 6,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    padding: '10px',
    maxWidth: '300px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#ffffff',
  },
}));

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} placement="bottom-start" arrow />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#fff',
    color: '#333',
    fontSize: theme?.typography,
    borderRadius: 8,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '8px 0',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#fff',
  },
}));

const TableBodyDetails: React.FC<TableBodyDetailsProps> = ({
  rows,
  paginatedRows,
  orderedColumns,
  visibleColumns,
  columnWidths,
  columns,
  selectedRows,
  onSelectRow,
  checkbox,
  uniqueKey,
  isEdit,
  isDelete,
  isShare,
  onEdit,
  onDelete,
  onShare,
  cellClick,
  onUpdate,
  editedRegNo,
  editRowId,
  setEditedRegNo,
  setEditRowId,
  setShareRowId,
  isList,
  geofenceDataList,
  isOn,
  setIsShared,
  selectedRow,
  isAdd,
  isRemove,
  onAdd,
  onRemove,
  isError,
  setError,
  isDownload,
  onDownload,
  showAlert,
  showErrorPopup,
  icons = [
    { label: 'Edit', icon: <img src={EditIcon} alt="edit" style={{ width: '17px' }} /> },
    { label: 'Share', icon: <ShareIcon /> },
  ],
  dostVariants = [],
  getBS6Value = ({ isBS6, vehicleType }) => vehicleType || (isBS6 ? 'BS6' : 'Non-BS6'),
  getStatusStyle = (status: string) => ({
    backgroundColor: '#cccccc',
    label: status ? status[0]?.toUpperCase() : 'U',
  }),
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleRedirectingScreen = (redirect: string, row: any) =>
    navigate(redirect, { state: { regNo: row } });

  const handleQuickIconClick = (action: any, index: number, row: any) => {
    if (action.label === 'Edit') {
      setEditRowId?.(index);
      setEditedRegNo?.({});
    } else if (action.label === 'Share') {
      setShareRowId?.(row);
      setIsShared?.(true);
    } else if (action.redirectScreen) {
      handleRedirectingScreen(action.redirectScreen, row);
    }
  };

  function resolveNestedPath<T>(obj: Record<string, any> | undefined, path: string): T | undefined {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return acc[key];
      }
      return undefined;
    }, obj) as T;
  }

  const orderColumns = columns.filter(column => column.id !== 'action');
  const hasActionId = columns.some(column => column.id === 'action');
  if (hasActionId) {
    orderColumns.push(columns.find(column => column.id === 'action')!);
  }

  const handleRegnNumberChange = (index: number, newValue: string) => {
    const regNumberPattern = /^[a-zA-Z0-9_-]*$/;
    if (regNumberPattern.test(newValue) || newValue === '') {
      setEditedRegNo?.((prev: any) => ({ ...prev, [index]: newValue }));
    }
  };

  const handleUpdate = (index: number, vinNumber: string, reg: string) => {
    const regNo = editedRegNo?.[index] || reg;
    if (regNo?.length > 20) {
      if (showErrorPopup) {
        showErrorPopup(
          'Validation Error',
          'Registration no. should not exceed 20 digits',
          () => {
            setHoveredRow(null);
            setEditRowId?.(null);
            setEditedRegNo?.({});
          }
        );
      } else {
        console.error('Registration no. should not exceed 20 digits');
        setHoveredRow(null);
        setEditRowId?.(null);
        setEditedRegNo?.({});
      }
      return;
    }
    if (showAlert) {
      showAlert(
        'Do you want to update Registration No.?',
        () => {
          onUpdate?.(regNo, vinNumber);
        },
        () => {
          setHoveredRow(null);
          setEditRowId?.(null);
          setEditedRegNo?.({});
        }
      );
    } else {
      onUpdate?.(regNo, vinNumber);
      setHoveredRow(null);
      setEditRowId?.(null);
      setEditedRegNo?.({});
    }
  };

  const lockIcon = (
    <Tooltip title="Not Applicable" arrow>
      <BlockIcon sx={{ fontSize: 12, color: '#c4c4c4' }} />
    </Tooltip>
  );

  const getCellValue = (row: any, columnId: any) => {
    if (!columnId || typeof columnId !== 'object' || !columnId.id) return 'N/A';
    if (columnId.id === 'actions') {
      return;
    }
    const value = resolveNestedPath<string>(row, columnId.id);
    const lockableFields = {
      fuelDef: ['fuel_level', 'fuel_consumption', 'def_consumption', 'def_level', 'exhaust_temp'],
      gas: ['cng_level', 'cng_consumption'],
      ev: [
        'battery_level',
        'battery_coolant_out_temp',
        'motor_speed',
        'distance_to_empty',
        'main_coolant_temp',
        'energy_consumed',
      ],
      engine: ['engine_hours', 'engine_speed', 'eng_coolant_temp'],
    };

    const { vehicle_type, vpart_desc } = row || {};
    if (columnId.id === 'performance_score' || columnId.id === 'safety_score') {
      const rankField = columnId.id === 'performance_score' ? 'score_rank' : 'safety_score_rank';
      const rank = resolveNestedPath<string>(row, rankField) || 'Unknown';
      const color = rank === 'Top' ? '#089c08' : rank === 'Bottom' ? '#FF0000' : '#0000FF';
      return (
        <span style={{ color }}>
          {value === null || value === '' ? '--' : Number(value) < 0 ? '-' : value}
        </span>
      );
    }
    if (
      dostVariants.length > 0 &&
      dostVariants.includes(vpart_desc) &&
      (columnId.id === 'def_consumption' || columnId.id === 'def_level')
    ) {
      return lockIcon;
    }
    if (
      (['EVTRUCK', 'EDC_CNG'].includes(vehicle_type) &&
        lockableFields.fuelDef.includes(columnId.id)) ||
      (lockableFields.gas.includes(columnId.id) && vehicle_type !== 'EDC_CNG') ||
      (lockableFields.ev.includes(columnId.id) && vehicle_type !== 'EVTRUCK') ||
      (lockableFields.engine.includes(columnId.id) && vehicle_type === 'EVTRUCK')
    ) {
      return lockIcon;
    }
    return value === null || value === '' ? '--' : (value ?? lockIcon);
  };

  const truncateText = (text: string, startLength = 15) => {
    if (!text || text.length <= startLength) return text;
    return text.slice(0, startLength) + '...';
  };

  return (
    <TableBody style={{ border: '1px solid rgb(204, 204, 204)', fontSize: '14px' }}>
      {rows !== undefined && rows?.length > 0 ? (
        paginatedRows.map((row, index) =>
          row.isGroupHeader ? (
            <TableRow key={`group-${row.groupKey}`} style={{ height: '30px' }}>
              <TableCell colSpan={columns.length} style={{ fontWeight: 'bold', padding: '5px' }}>
                {row.groupKey}
              </TableCell>
            </TableRow>
          ) : (
            <TableRow key={index} style={{ height: '30px' }}>
              {checkbox && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedRows.includes(row[uniqueKey ?? ''] ?? '') ||
                      selectedRow?.includes(row[unique ^^ ''] ?? '')
                    }
                    onChange={() => {
                      onSelectRow(row[uniqueKey ?? ''] ?? '');
                      setError?.(false);
                    }}
                    sx={{
                      '& .MuiSvgIcon-root': {
                        border: isError && index === 0 ? '2px solid red' : 'none',
                        borderRadius: '4px',
                      },
                    }}
                  />
                </TableCell>
              )}
              {orderColumns.map((column, idx) =>
                visibleColumns.includes(column.id) && column.label ? (
                  column.id === 'geofence_name' && isList && isOn ? (
                    <TableCell
                      key={column.id}
                      style={{
                        width: '150px',
                        padding: '5px',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                      }}
                    >
                      {(() => {
                        const geofenceData = geofenceDataList?.find(
                          (item: any) => item.vin_number === row.vin_number,
                        );
                        const geofenceNames = geofenceData?.geofence_name?.length
                          ? geofenceData.geofence_name.join(', ')
                          : null;
                        return geofenceNames && geofenceNames !== '-' ? (
                          <Box display="flex" gap={1} width={240} alignItems="center">
                            <Box>
                              <Geo />
                            </Box>
                            <Box>
                              <span style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                {geofenceNames}
                              </span>
                            </Box>
                          </Box>
                        ) : (
                          '-'
                        );
                      })()}
                    </TableCell>
                  ) : (column.id !== 'geofence_name' &&
                      column.id !== 'vin_number' &&
                      column?.id !== 'status_age' &&
                      column?.id !== 'is_bs6') ||
                    !isList ? (
                    <TableCell
                      key={column.id}
                      style={{
                        width: columnWidths[column.id],
                        padding: '5px',
                        fontSize: '14px',
                        ...(column.id === 'regn_number' &&
                          isList && {
                            position: 'sticky',
                            left: 0,
                            zIndex: 100,
                            background: index % 2 === 1 ? '#f0f0f0' : '#fff',
                          }),
                        ...(column.id === 'vehicle_type' &&
                          isList && {
                            position: 'sticky',
                            right: 0,
                            zIndex: 100,
                            background: index % 2 === 1 ? '#f0f0f0' : '#fff',
                          }),
                        ...(column.id === 'regno' && {
                          position: 'sticky',
                          left: 0,
                          background: index % 2 === 1 ? '#f0f0f0' : '#fff',
                        }),
                      }}
                    >
                      {column.tooltip && column.tooltipFields ? (
                        <CustomCellTooltip
                          title={
                            <Box sx={{ padding: '8px', width: '150px' }}>
                              {column.tooltipFields.map(field => (
                                <Box
                                  key={field.id}
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 'bold', mr: 2 }}
                                  >
                                    {field.label}:
                                  </Typography>
                                  <Typography variant="body2">
                                    {resolveNestedPath<string>(row, field.id) ?? '-'}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          }
                          placement="top"
                          arrow
                        >
                          <span>
                            {column.id === 'action' ? (
                              <>
                                {isEdit && (
                                  <Tooltip title="Edit" arrow>
                                    <img
                                      src={EditIcon}
                                      alt="edit"
                                      onClick={() => onEdit?.(row)}
                                      style={{
                                        cursor: 'pointer',
                                        marginRight: '10px',
                                        width: '17px',
                                      }}
                                    />
                                  </Tooltip>
                                )}
                                {isDelete && (
                                  <Tooltip title="Delete" arrow>
                                    <img
                                      src={DeleteIcon}
                                      alt="delete"
                                      onClick={() => onDelete?.(row)}
                                      style={{
                                        cursor: 'pointer',
                                        width: '17px',
                                      }}
                                    />
                                  </Tooltip>
                                )}
                                {isShare && (
                                  <ShareIcon
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => onShare?.(row)}
                                  />
                                )}
                              </>
                            ) : column.id === 'attachment_file_name' ? (
                              <>
                                {isDownload && (
                                  <Tooltip title="Download" arrow>
                                    <img
                                      src={DownloadIcon}
                                      alt="Download"
                                      onClick={() => onDownload?.(row)}
                                      style={{
                                        cursor: 'pointer',
                                        marginRight: '10px',
                                        width: '17px',
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </>
                            ) : column.id === 'vin_count' ? (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'start',
                                  position: 'relative',
                                }}
                              >
                                <Typography
                                  variant="body1"
                                  sx={{ fontSize: '14px', marginRight: '40px' }}
                                >
                                  {row[column.id] ?? 0}
                                </Typography>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    gap: 1,
                                    position: 'absolute',
                                    left: '35px',
                                  }}
                                >
                                  {isAdd && (
                                    <Typography
                                      onClick={() => onAdd?.(row, 'add')}
                                      style={{
                                        cursor: 'pointer',
                                        marginRight: '5px',
                                        color: 'blue',
                                        textDecoration: 'underline',
                                        fontSize: '12px',
                                      }}
                                    >
                                      Add
                                    </Typography>
                                  )}
                                  {isRemove && (
                                    <Typography
                                      onClick={() => onRemove?.(row, 'remove')}
                                      style={{
                                        cursor: 'pointer',
                                        marginRight: '5px',
                                        color: 'blue',
                                        textDecoration: 'underline',
                                        fontSize: '12px',
                                      }}
                                    >
                                      Remove
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            ) : column.id === 'regn_number' && isList ? (
                              <Box>
                                {editRowId !== null &&
                                editRowId !== undefined &&
                                Number(editRowId) === index ? (
                                  <Box>
                                    <input
                                      value={
                                        editedRegNo?.[index] ?? row[orderColumns[0]?.id]
                                      }
                                      onChange={e =>
                                        handleRegnNumberChange(index, e.target.value)
                                      }
                                      style={{ width: '150px' }}
                                    />
                                    {editedRegNo?.[index] && (
                                      <Box sx={{ display: 'flex' }}>
                                        <Typography
                                          onClick={() =>
                                            handleUpdate(
                                              index,
                                              row.vin_number,
                                              row.regn_number,
                                            )
                                          }
                                          sx={{
                                            marginLeft: '45px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            color: '#1a4b95',
                                          }}
                                        >
                                          Update
                                        </Typography>
                                        <Typography
                                          onClick={() => {
                                            setEditRowId?.(null);
                                            setEditedRegNo?.({});
                                          }}
                                          sx={{
                                            color: '#1a4b95',
                                            marginLeft: '10px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          Cancel
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                ) : (
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Typography
                                      variant="body1"
                                      sx={{ fontSize: '14px' }}
                                    >
                                      {row[column.id]}
                                      <br />
                                      <span style={{ color: '#7f7f7f', fontSize: '12px' }}>
                                        {row[orderColumns[1]?.id]}
                                      </span>
                                    </Typography>
                                    {icons.length > 0 && (
                                      <Box className="font-m" style={{ position: 'relative' }}>
                                        <HtmlTooltip
                                          PopperProps={{
                                            sx: {
                                              '& .MuiTooltip-tooltip': {
                                                backgroundColor: 'white !important',
                                                paddingRight: '20px',
                                                paddingTop: '10px',
                                                paddingBottom: '10px',
                                                width: '100%',
                                              },
                                            },
                                          }}
                                          title={
                                            hoveredRow === index && (
                                              <Box
                                                sx={{
                                                  backgroundColor: 'white',
                                                  padding: '5px',
                                                  width: '100%',
                                                }}
                                              >
                                                {icons.map((action, idx) => (
                                                  <Box
                                                    key={idx}
                                                    sx={{
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      cursor: 'pointer',
                                                      marginTop: idx > 0 ? '8px' : 0,
                                                      '&:hover': {
                                                        backgroundColor:
                                                          'rgba(0, 0, 0, 0.08) !important',
                                                      },
                                                    }}
                                                    onClick={() =>
                                                      handleQuickIconClick(action, index, row)
                                                    }
                                                  >
                                                    <IconButton size="small">
                                                      {action.icon}
                                                    </IconButton>
                                                    <span
                                                      style={{
                                                        marginLeft: '10px',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                      }}
                                                    >
                                                      {action.label}
                                                    </span>
                                                  </Box>
                                                ))}
                                              </Box>
                                            )
                                          }
                                        >
                                          <IconButton
                                            size="small"
                                            onMouseEnter={() => setHoveredRow(index)}
                                          >
                                            <LinkIcon sx={{ transform: 'rotate(90deg)' }} />
                                          </IconButton>
                                        </HtmlTooltip>
                                      </Box>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            ) : column.id === 'vehicle_status' && isList ? (
                              (() => {
                                const { backgroundColor, label } = getStatusStyle(
                                  row?.vehicle_status || '',
                                );
                                return (
                                  <Box sx={{ display: 'flex' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Box
                                        sx={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: 25,
                                          height: 15,
                                          padding: 1,
                                          backgroundColor,
                                          color: '#fff',
                                          borderRadius: '4px',
                                          marginRight: 2,
                                        }}
                                      >
                                        <span style={{ fontSize: '11px' }}> {label} </span>
                                        <br />
                                      </Box>
                                      <span style={{ color: '#9f9f9f' }}>
                                        {row[orderColumns[orderColumns?.length - 1]?.id] ===
                                        'EDC_CNG'
                                          ? 'CNG'
                                          : row[orderColumns[orderColumns?.length - 1]?.id] ===
                                              'EVTRUCK'
                                            ? 'EV'
                                            : row[orderColumns[orderColumns?.length - 1]?.id] ||
                                              ''}
                                      </span>
                                    </Box>
                                    <Typography
                                      variant="body1"
                                      sx={{ fontSize: '14px' }}
                                    >
                                      {row[column.id]}
                                      <br />
                                      <span style={{ color: '#9f9f9f' }}>
                                        {row[orderColumns[4]?.id] || ''}
                                      </span>
                                    </Typography>
                                  </Box>
                                );
                              })()
                            ) : column.id === 'location' && isList ? (
                              <Tooltip
                                title={row[column.id] || '--'}
                                PopperProps={{
                                  modifiers: [
                                    {
                                      name: 'preventOverflow',
                                      options: {
                                        boundary: 'window',
                                      },
                                    },
                                  ],
                                }}
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '0.8rem',
                                    },
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', gap: 1, width: '150px' }}>
                                  <Box>
                                    <Location />
                                  </Box>
                                  <Box>
                                    <span> {truncateText(row[column.id]) || '--'} </span>
                                  </Box>
                                </Box>
                              </Tooltip>
                            ) : column.id === 'vehicle_type' && isList ? (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '76px',
                                }}
                              >
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontSize: '14px',
                                    position:
                                      row.vehicle_type === 'EVTRUCK' ? 'relative' : 'static',
                                    right: row.vehicle_type === 'EVTRUCK' ? '-7px' : '0',
                                  }}
                                >
                                  {getBS6Value({
                                    isBS6: row[orderColumns[2]?.id] || false,
                                    vehicleType: row.vehicle_type || '',
                                  })}
                                </Typography>
                              </Box>
                            ) : column.id === 'is_bs6' && isList ? (
                              <Box
                                key={column.id}
                                style={{ width: columnWidths[column.id], padding: '5px' }}
                              >
                                {getBS6Value({
                                  isBS6: row[column.id] || false,
                                  vehicleType: row.vehicle_type || '',
                                })}
                              </Box>
                            ) : column.onClick ? (
                              <span
                                style={{
                                  cursor: 'pointer',
                                  color: 'blue',
                                  textDecoration: 'underline',
                                }}
                                onClick={() => cellClick && cellClick(row)}
                              >
                                {column.type === 'date'
                                  ? formatDate(
                                      resolveNestedPath<string>(row, column.id) ?? '',
                                      'DD-MM-YYYY',
                                    )
                                  : (resolveNestedPath<string>(row, column.id) ?? '-')}
                              </span>
                            ) : column.id === 'event_utc' && isList ? (
                              <Box>
                                {row.local_time_stamp !== null
                                  ? convertDateFormat(row.local_time_stamp, DDMMYYYY)
                                  : '--'}
                                <br />
                                {row.local_time_stamp !== null &&
                                  convert24HrsTimeTo12Hrs(row.local_time_stamp)}
                              </Box>
                            ) : column.id === 'performance_score' ||
                              column.id === 'safety_score' ? (
                              getCellValue(row, column)
                            ) : column.type === 'date' && !isList ? (
                              resolveNestedPath<string>(row, column.id) ?? ''
                            ) : column.id === 'count' && !isList ? (
                              resolveNestedPath<string>(row, column.id) ?? ''
                            ) : isList ? (
                              getCellValue(row, column)
                            ) : (
                              resolveNestedPath<string>(row, column.id) ?? '-'
                            )}
                          </span>
                        </CustomCellTooltip>
                      ) : (
                        <>
                          {column.id === 'action' ? (
                            <>
                              {isEdit && (
                                <Tooltip title="Edit" arrow>
                                  <img
                                    src={EditIcon}
                                    alt="edit"
                                    onClick={() => onEdit?.(row)}
                                    style={{
                                      cursor: 'pointer',
                                      marginRight: '10px',
                                      width: '17px',
                                    }}
                                  />
                                </Tooltip>
                              )}
                              {isDelete && (
                                <Tooltip title="Delete" arrow>
                                  <img
                                    src={DeleteIcon}
                                    alt="delete"
                                    onClick={() => onDelete?.(row)}
                                    style={{
                                      cursor: 'pointer',
                                      width: '17px',
                                    }}
                                  />
                                </Tooltip>
                              )}
                              {isShare && (
                                <ShareIcon
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => onShare?.(row)}
                                />
                              )}
                            </>
                          ) : column.id === 'attachment_file_name' ? (
                            <>
                              {isDownload && (
                                <Tooltip title="Download" arrow>
                                  <img
                                    src={DownloadIcon}
                                    alt="Download"
                                    onClick={() => onDownload?.(row)}
                                    style={{
                                      cursor: 'pointer',
                                      marginRight: '10px',
                                      width: '17px',
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </>
                          ) : column.id === 'vin_count' ? (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'start',
                                position: 'relative',
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{ fontSize: '14px', marginRight: '40px' }}
                              >
                                {row[column.id] ?? 0}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: 1,
                                  position: 'absolute',
                                  left: '35px',
                                }}
                              >
                                {isAdd && (
                                  <Typography
                                    onClick={() => onAdd?.(row, 'add')}
                                    style={{
                                      cursor: 'pointer',
                                      marginRight: '5px',
                                      color: 'blue',
                                      textDecoration: 'underline',
                                      fontSize: '12px',
                                    }}
                                  >
                                    Add
                                    </Typography>
                                  )}
                                  {isRemove && (
                                    <Typography
                                      onClick={() => onRemove?.(row, 'remove')}
                                      style={{
                                        cursor: 'pointer',
                                        marginRight: '5px',
                                        color: 'blue',
                                        textDecoration: 'underline',
                                        fontSize: '12px',
                                      }}
                                    >
                                      Remove
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            ) : column.id === 'regn_number' && isList ? (
                              <Box>
                                {editRowId !== null &&
                                editRowId !== undefined &&
                                Number(editRowId) === index ? (
                                  <Box>
                                    <input
                                      value={
                                        editedRegNo?.[index] ?? row[orderColumns[0]?.id]
                                      }
                                      onChange={e =>
                                        handleRegnNumberChange(index, e.target.value)
                                      }
                                      style={{ width: '150px' }}
                                    />
                                    {editedRegNo?.[index] && (
                                      <Box sx={{ display: 'flex' }}>
                                        <Typography
                                          onClick={() =>
                                            handleUpdate(index, row.vin_number, row.regn_number)
                                          }
                                          sx={{
                                            marginLeft: '45px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            color: '#1a4b95',
                                          }}
                                        >
                                          Update
                                        </Typography>
                                        <Typography
                                          onClick={() => {
                                            setEditRowId?.(null);
                                            setEditedRegNo?.({});
                                          }}
                                          sx={{
                                            color: '#1a4b95',
                                            marginLeft: '10px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          Cancel
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                ) : (
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Typography
                                      variant="body1"
                                      sx={{ fontSize: '14px' }}
                                    >
                                      {row[column.id]}
                                      <br />
                                      <span style={{ color: '#7f7f7f', fontSize: '12px' }}>
                                        {row[orderColumns[1]?.id]}
                                      </span>
                                    </Typography>
                                    {icons.length > 0 && (
                                      <Box className="font-m" style={{ position: 'relative' }}>
                                        <HtmlTooltip
                                          PopperProps={{
                                            sx: {
                                              '& .MuiTooltip-tooltip': {
                                                backgroundColor: 'white !important',
                                                paddingRight: '20px',
                                                paddingTop: '10px',
                                                paddingBottom: '10px',
                                                width: '100%',
                                              },
                                            },
                                          }}
                                          title={
                                            hoveredRow === index && (
                                              <Box
                                                sx={{
                                                  backgroundColor: 'white',
                                                  padding: '5px',
                                                  width: '100%',
                                                }}
                                              >
                                                {icons.map((action, idx) => (
                                                  <Box
                                                    key={idx}
                                                    sx={{
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      cursor: 'pointer',
                                                      marginTop: idx > 0 ? '8px' : 0,
                                                      '&:hover': {
                                                        backgroundColor:
                                                          'rgba(0, 0, 0, 0.08) !important',
                                                      },
                                                    }}
                                                    onClick={() =>
                                                      handleQuickIconClick(action, index, row)
                                                    }
                                                  >
                                                    <IconButton size="small">
                                                      {action.icon}
                                                    </IconButton>
                                                    <span
                                                      style={{
                                                        marginLeft: '10px',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                      }}
                                                    >
                                                      {action.label}
                                                    </span>
                                                  </Box>
                                                ))}
                                              </Box>
                                            )
                                          }
                                        >
                                          <IconButton
                                            size="small"
                                            onMouseEnter={() => setHoveredRow(index)}
                                          >
                                            <LinkIcon sx={{ transform: 'rotate(90deg)' }} />
                                          </IconButton>
                                        </HtmlTooltip>
                                      </Box>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            ) : column.id === 'vehicle_status' && isList ? (
                              (() => {
                                const { backgroundColor, label } = getStatusStyle(
                                  row?.vehicle_status || '',
                                );
                                return (
                                  <Box sx={{ display: 'flex' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Box
                                        sx={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: 25,
                                          height: 15,
                                          padding: 1,
                                          backgroundColor,
                                          color: '#fff',
                                          borderRadius: '4px',
                                          marginRight: 2,
                                        }}
                                      >
                                        <span style={{ fontSize: '11px' }}> {label} </span>
                                        <br />
                                      </Box>
                                      <span style={{ color: '#9f9f9f' }}>
                                        {row[orderColumns[orderColumns?.length - 1]?.id] ===
                                        'EDC_CNG'
                                          ? 'CNG'
                                          : row[orderColumns[orderColumns?.length - 1]?.id] ===
                                              'EVTRUCK'
                                            ? 'EV'
                                            : row[orderColumns[orderColumns?.length - 1]?.id] ||
                                              ''}
                                      </span>
                                    </Box>
                                    <Typography
                                      variant="body1"
                                      sx={{ fontSize: '14px' }}
                                    >
                                      {row[column.id]}
                                      <br />
                                      <span style={{ color: '#9f9f9f' }}>
                                        {row[orderColumns[4]?.id] || ''}
                                      </span>
                                    </Typography>
                                  </Box>
                                );
                              })()
                            ) : column.id === 'location' && isList ? (
                              <Tooltip
                                title={row[column.id] || '--'}
                                PopperProps={{
                                  modifiers: [
                                    {
                                      name: 'preventOverflow',
                                      options: {
                                        boundary: 'window',
                                      },
                                    },
                                  ],
                                }}
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '0.8rem',
                                    },
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', gap: 1, width: '150px' }}>
                                  <Box>
                                    <Location />
                                  </Box>
                                  <Box>
                                    <span> {truncateText(row[column.id]) || '--'} </span>
                                  </Box>
                                </Box>
                              </Tooltip>
                            ) : column.id === 'vehicle_type' && isList ? (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '76px',
                                }}
                              >
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontSize: '14px',
                                    position:
                                      row.vehicle_type === 'EVTRUCK' ? 'relative' : 'static',
                                    right: row.vehicle_type === 'EVTRUCK' ? '-7px' : '0',
                                  }}
                                >
                                  {getBS6Value({
                                    isBS6: row[orderColumns[2]?.id] || false,
                                    vehicleType: row.vehicle_type || '',
                                  })}
                                </Typography>
                              </Box>
                            ) : column.id === 'is_bs6' && isList ? (
                              <Box
                                key={column.id}
                                style={{ width: columnWidths[column.id], padding: '5px' }}
                              >
                                {getBS6Value({
                                  isBS6: row[column.id] || false,
                                  vehicleType: row.vehicle_type || '',
                                })}
                              </Box>
                            ) : column.onClick ? (
                              <span
                                style={{
                                  cursor: 'pointer',
                                  color: 'blue',
                                  textDecoration: 'underline',
                                }}
                                onClick={() => cellClick && cellClick(row)}
                              >
                                {column.type === 'date'
                                  ? formatDate(
                                      resolveNestedPath<string>(row, column.id) ?? '',
                                      'DD-MM-YYYY',
                                    )
                                  : (resolveNestedPath<string>(row, column.id) ?? '-')}
                              </span>
                            ) : column.id === 'event_utc' && isList ? (
                              <Box>
                                {row.local_time_stamp !== null
                                  ? convertDateFormat(row.local_time_stamp, DDMMYYYY)
                                  : '--'}
                                <br />
                                {row.local_time_stamp !== null &&
                                  convert24HrsTimeTo12Hrs(row.local_time_stamp)}
                              </Box>
                            ) : column.id === 'performance_score' ||
                              column.id === 'safety_score' ? (
                              getCellValue(row, column)
                            ) : column.type === 'date' && !isList ? (
                              resolveNestedPath<string>(row, column.id) ?? ''
                            ) : column.id === 'count' && !isList ? (
                              resolveNestedPath<string>(row, column.id) ?? ''
                            ) : isList ? (
                              getCellValue(row, column)
                            ) : (
                              resolveNestedPath<string>(row, column.id) ?? '-'
                            )}
                        </>
                      )}
                    </TableCell>
                  ) : null
                ) : null,
              )}
            </TableRow>
          ),
        )
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} style={{ textAlign: 'center', padding: '5px' }}>
            No Data Available
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
};

export default TableBodyDetails;