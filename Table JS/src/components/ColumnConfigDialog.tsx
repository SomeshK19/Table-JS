import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography
} from '@mui/material';

interface Column {
  id: string;
  label: string;
  groupHeader?: string;
}

interface ColumnConfigDialogProps {
  open: boolean;
  onClose: () => void;
  columns: Column[];
  visibleColumns: string[];
  onToggleColumn: (id: string) => void;
}

const ColumnConfigDialog: React.FC<ColumnConfigDialogProps> = ({
  open,
  onClose,
  columns,
  visibleColumns,
  onToggleColumn
}) => {
  // Group columns by groupHeader
  const grouped = columns.reduce((acc, col) => {
    const group = col.groupHeader || '';
    if (!acc[group]) acc[group] = [];
    acc[group].push(col);
    return acc;
  }, {} as Record<string, Column[]>);

  // Helper to check if all columns in a group are selected
  const isGroupChecked = (group: string) =>
    grouped[group].every(col => visibleColumns.includes(col.id));
  const isGroupIndeterminate = (group: string) =>
    grouped[group].some(col => visibleColumns.includes(col.id)) &&
    !isGroupChecked(group);

  // Toggle all columns in a group
  const handleGroupToggle = (group: string) => {
    const allChecked = isGroupChecked(group);
    grouped[group].forEach(col => {
      if (allChecked && visibleColumns.includes(col.id)) {
        onToggleColumn(col.id);
      } else if (!allChecked && !visibleColumns.includes(col.id)) {
        onToggleColumn(col.id);
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Configure Columns</DialogTitle>
      <DialogContent>
        <Grid container spacing={0}>
          {Object.keys(grouped).map(group => (
            <React.Fragment key={group}>
              {group && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isGroupChecked(group)}
                        indeterminate={isGroupIndeterminate(group)}
                        onChange={() => handleGroupToggle(group)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography fontWeight={600}>
                        {group}
                      </Typography>
                    }
                  />
                </Grid>
              )}
              {grouped[group].map(column => (
                <Grid item xs={12} key={column.id} sx={{ pl: group ? 3 : 0 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={visibleColumns.includes(column.id)}
                        onChange={() => onToggleColumn(column.id)}
                        color="primary"
                      />
                    }
                    label={column.label}
                  />
                </Grid>
              ))}
            </React.Fragment>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnConfigDialog;
