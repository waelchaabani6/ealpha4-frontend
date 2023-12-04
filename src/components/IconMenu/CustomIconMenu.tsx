import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function LongMenu(props: any) {
  const { handleChange, dataArray, rowData } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const newClick = (e: any) => {
    handleChange(e.target.dataset.value, rowData);
  };

  return (
    <div className="relative">
      <IconButton
        onClick={handleClick}
        sx={{
          color: open ? 'var(--accent)' : 'inherit'
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        sx={{
          '.MuiMenuItem-gutters': {
            color: 'var(--black)',
            fontSize: '14px'
          },
          img: {
            width: '20px',
            marginRight: '5px'
          },
          svg: {
            width: '20px',
            height: '20px',
            marginRight: '5px'
          },
          '.MuiPaper-elevation': {
            background: 'transparent',
            boxShadow: 'none',
            left: 'unset !important',
            right: '100px !important',
            marginTop: '-55px',
            overflow: 'unset',
            '&::after': {
              content: '""',
              position: 'absolute',
              height: '15px',
              right: '-12px',
              top: '22px',
              borderTop: '13px solid transparent',
              borderBottom: '13px solid transparent',
              borderLeft: `13px solid var(--white)`
            },
            ul: {
              filter: 'drop-shadow(6px 2.25px 11px rgba(0, 0, 0, 0.18))',
              backgroundColor: 'var(--white)',
              borderRadius: '12px'
            }
          }
        }}
        anchorEl={anchorEl}
        onClick={newClick}
        onClose={handleClose}
        open={open}
      >
        {dataArray.map((option: any) => (
          <MenuItem
            key={option?.value}
            data-value={option?.value}
            value={option?.value}
            sx={{ fontSize: 'smaller' }}
            onClick={handleClose}
          >
            {option?.icon}
            {option?.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
