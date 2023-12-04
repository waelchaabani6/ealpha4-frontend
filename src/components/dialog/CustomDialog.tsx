import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: '27px 40px !important'
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  },
  '& .MuiPaper-root': {
    borderRadius: '14px'
  },
  '.crossButton': {
    position: 'absolute',
    right: 8,
    top: 8,
    color: 'var(--white)'
  },
  '.MuiDialogTitle-root': {
    background: 'var(--leafgreen)',
    color: 'var(--white)',
    fontSize: '16px'
  }
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;

}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle
      {...other}
    >
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          className="crossButton"
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

export default function CustomizedDialogs(props: any) {
  const { open, children, setOpen, title, maxwidth, onclose, fullWidth } = props;
  const handleClose = () => {
    setOpen(false);
    if (onclose) {
      onclose();
    }
  };

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      className={props.className === undefined ? '' : props.className}
      fullWidth={fullWidth === undefined ? true : fullWidth}
      maxWidth={maxwidth || 'md'}
      sx={{ ...props.sx }}
    >
      <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
        {title}
      </BootstrapDialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
    </BootstrapDialog>
  );
}
