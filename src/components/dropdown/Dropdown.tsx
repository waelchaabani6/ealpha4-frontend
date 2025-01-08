/* eslint-disable max-len */
import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { CircularProgress, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import { OBJECT } from '../../constants/types';

type dropdownProps = {
  IconComponent?: React.ReactNode;
  title?: string;
  value?: string | number | null;
  dataArray: (OBJECT | string | number | any)[];
  onChangeHandler: (e: any) => void;
  sxClass?: object;
  selectedData?: string | number;
  displayEmpty?: any;
  loading?: boolean;
  parentStyle?: any;
  handleClearClick?: () => void;
  showCancel?: boolean;
  disabled?: boolean;
  required?: boolean;
  labelParentClass?: string;
  IconParentClass?: string;
  border?: boolean;
  padding?: boolean;
};

export default function dropdown(props: dropdownProps) {
  const {
    onChangeHandler,
    title,
    dataArray,
    value,
    sxClass,
    displayEmpty,
    loading,
    parentStyle,
    showCancel,
    disabled,
    required,
    labelParentClass = '',
    IconParentClass = '',
  } = props;
  const [open, setOpen] = React.useState(false);

  const handleChange = (event: any) => {
    onChangeHandler(event.target.value);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  return (
    <div className={`${parentStyle || ''}`}>
      <Typography
        className={`${props?.padding ? 'pb-2.5' : 'pb-2'} text-sm capitalize ${labelParentClass}`}
        variant="caption"
        display="block"
      >
        {title}
        {required && (
          <Typography
            className="text-red-600"
            variant="caption"
            display="inline-block"
          >
            &nbsp;*
          </Typography>
        )}
      </Typography>
      <MuiSelect
        endAdornment={
          <IconButton
            sx={{
              display: showCancel === true ? 'block' : 'none',
              position: 'relative',
              left: '13px',
            }}
            onClick={props.handleClearClick}
          >
            <ClearIcon />
          </IconButton>
        }
        labelId="demo-controlled-open-select-label"
        id="demo-controlled-open-select"
        open={open}
        disabled={disabled || false}
        onClose={handleClose}
        onOpen={handleOpen}
        displayEmpty={displayEmpty || false}
        value={value}
        onChange={handleChange}
        IconComponent={() => (
          <KeyboardArrowDownIcon
            onClick={handleOpen}
            className={`cursor-pointer ${IconParentClass}`}
          />
        )}
        sx={{
          background: `${disabled ? 'var(--fishgray)' : 'var(--white)'}`,
          '#demo-controlled-open-select': {
            padding: '9px 32px 9px 10px',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '15px',
            fontFamily: 'Montserrat-500',
          },
          '& fieldset': {
            border: props?.border ? '1px solid grey' : '1px solid white',
          },
          width: '130px',
          boxShadow: open
            ? '0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%)'
            : 'none',
          ...sxClass,
        }}
      >
        {!displayEmpty && dataArray?.length < 1 && (
          <MenuItem sx={{ fontSize: 'smaller' }} disabled={true} value="">
            <em>No Data</em>
          </MenuItem>
        )}
        {displayEmpty && (
          <MenuItem sx={{ fontSize: 'smaller' }} disabled={true} value="">
            <em>Select</em>
          </MenuItem>
        )}
        {dataArray?.map(
          (e: any): JSX.Element => (
            <MenuItem
              disabled={e.disable === true}
              key={e?.value || e}
              value={e?.value || e}
              sx={{ fontSize: 'smaller' }}
            >
              {e?.label || e}
            </MenuItem>
          )
        )}
        {loading && (
          <MenuItem disabled={true}>
            <div className="text-center w-full">
              <CircularProgress color="success" size="20px" />
            </div>
          </MenuItem>
        )}
      </MuiSelect>
    </div>
  );
}
