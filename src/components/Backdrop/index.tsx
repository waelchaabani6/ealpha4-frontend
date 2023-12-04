import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

export default function SimpleBackdrop(props: any) {
  const { open, onClick } = props;

  return (
    <div>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={onClick}
      >
        <CircularProgress color="success" />
      </Backdrop>
    </div>
  );
}
