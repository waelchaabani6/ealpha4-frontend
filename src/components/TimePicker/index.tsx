import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TextField from '@mui/material/TextField';
import { ReactElement, JSXElementConstructor, useState } from 'react';
import './TimePicker.css';
import { Box } from '@mui/material';

type Props = {
  customLabel: string;
  onChange: (value: string | null) => void;
  value: string;
  minTime?: any;
  maxTime?: any;
  parentLabelClass?: string;
};

export default function CustomeTimePicker({
  onChange,
  value,
  customLabel,
  minTime,
  maxTime,
  parentLabelClass = '',
}: Props) {
  return (
    <Box
      sx={{
        '& .MuiInputBase-root': {
          height: '40px',
          width: '380px',
          position: 'relative',
          top: '25px',
        },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className={`relative top-[18px] ${parentLabelClass}`}>
          {' '}
          {customLabel}{' '}
        </div>
        <DesktopTimePicker
          renderInput={(TextProps) => <TextField {...TextProps} />}
          label=""
          value={value}
          ampmInClock={false}
          onChange={onChange}
          minTime={minTime}
          maxTime={maxTime}
          disableIgnoringDatePartForTimeValidation={false}
          InputProps={{
            style: {
              fontSize: '0.75rem',
              color: 'black',
              fontFamily: 'Montserrat-500',
              border: '1px solid grey',
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}
