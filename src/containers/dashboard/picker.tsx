import { ReactComponent as DownArrowIcon } from '@images/down arrow.svg';
import { TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useState } from 'react';

type Props = {
  views: string;
  inputFormat: string;
  value: Date;
  onChange: (value: Date) => void;
  fullWidth?: boolean;
}

export default function Picker(props: Props) {
  const [openPicker, setOpenPicker] = useState<boolean>(false);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        views={[props.views as any]}
        inputFormat={props.inputFormat}
        onOpen={() => setOpenPicker(true)}
        onClose={() => setOpenPicker(false)}
        maxDate={new Date()}
        minDate={'2022-01-01' as any}
        open={openPicker}
        renderInput={(params) => <TextField
          onClick={(ev: any) => setOpenPicker(true)}
          {...params}
          sx={{
            borderRadius: '4px',
            '.Mui-disabled': {
              backgroundColor: 'var(--sandgray)',
              borderRadius: '4px',
              borderColor: 'var(---linegray)'
            },
            '.MuiInputBase-root': {
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '15px',
              fontFamily: 'Montserrat-500',
              backgroundColor: 'white',
              height: '100%',
              cursor: 'pointer'
            },
            '.MuiInputBase-input.MuiOutlinedInput-input': {
              fontSize: '13px',
              cursor: 'pointer',
              caretColor: 'transparent'
            },
            '& fieldset': {
              border: 'white'
            },
            '.MuiTextField-root': {
              top: '-2px'
            },
            background: 'var(--white)',
            width: props?.fullWidth ? '100%' : '135px',
            height: '36px'
          }}
          InputProps={{
            endAdornment: (
              <div className={`scale-125 relative -right-2 opacity-60 ${openPicker ? 'rotate-180' : ''}`}>
                <DownArrowIcon />
              </div>
            )
          }}
        />}
        value={props.value}
        onChange={(dt: Date | null) => {
          if (dt) {
            props.onChange(dt);
            setOpenPicker(false);
          }
        }}

      />
    </LocalizationProvider>
  );
}
