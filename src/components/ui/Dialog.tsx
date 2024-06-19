import { Dialog as _Dialog } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Dialog = styled(_Dialog)(({ theme }) => ({
    '&.MuiPaper-root': {
      backgroundColor: '#0F172A',
      color: theme.palette.secondary.contrastText,
    },
    '&.MuiTypography-root': {
      backgroundColor: '#0F172A',
      color: theme.palette.secondary.contrastText,
    },
    '&.MuiDialogContent-root': {
      backgroundColor: '#0F172A',
      color: theme.palette.secondary.contrastText,
    },
  }));