import { ToggleButton as _ToggleButton, ToggleButtonGroup as _ToggleButtonGroup } from "@mui/material";
import { styled } from '@mui/material/styles';

export const ToggleButtonGroup = styled(_ToggleButtonGroup)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  }));
  
export const ToggleButton = styled(_ToggleButton)(({ theme }) => ({
    '&.Mui-selected': {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }));