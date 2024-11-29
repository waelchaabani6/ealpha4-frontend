/* eslint-disable no-console */
import { ReactComponent as DatePickerIcon } from '@images/calendar.svg';
import { TextField, Typography } from '@mui/material';
import { CalendarPickerView, LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { MomentInput } from 'moment';
import { useState } from 'react';
import { Control, Controller } from 'react-hook-form';

type DatePickerProps = {
  control: Control<any, any>;
  name: string;
  value?: MomentInput | null;
  label: string;
  disableOld?: boolean | undefined;
  disabled?: boolean;
  disablePast?: Date | undefined;
  disableFuture?: Date | undefined;
  range?: boolean | undefined;
  inputFormat?: string;
  views?: CalendarPickerView[] | undefined;
  onChange?: any;
  required?: boolean;
  sxClass?: any;
  padding?:boolean;
  autoComplete?: string; // Optional autoComplete prop
}

export default function DatePicker(props: DatePickerProps) {
  const { autoComplete = 'on' } = props;
  const [open, setOpen] = useState<boolean>(false);
  const togglePicker = () => setOpen(!open);
  return (
    <Controller
      control={props.control}
      name={props.name}
      defaultValue={props?.value || null}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <div className="w-full h-full">
            <Typography
              className={`capitalize ${props?.padding ? 'pb-2' : 'pb-3.5'} ${(error) ? 'text-red-600' : ''}`}
              variant="caption"
              display="block"
            >
              {props.label}
              {props.required && (
                <Typography
                  className="text-red-600"
                  variant="caption"
                  display="inline-block"
                >
                  &nbsp;*
                </Typography>
              )}
            </Typography>
            <MuiDatePicker
              views={props?.views}
              inputFormat={props?.inputFormat || 'DD-MM-YYYY'}
              open={open && !props.disabled}
              onOpen={togglePicker}
              onClose={togglePicker}
              disabled={props.disabled}
              disablePast={props?.disableOld}
              minDate={props.disablePast}
              maxDate={props.disableFuture}
              value={props.value || value}
              onChange={props?.onChange || onChange}
              inputRef={ref}
              components={{
                OpenPickerIcon: DatePickerIcon
              }}
              renderInput={(params) => <TextField
                disabled={props.disabled}
                onClick={() => setOpen(true)}
                onKeyDown={(e) => e.preventDefault()}
                {...params}
                size="small"
                error={!!error}
                className="w-full"
                autoComplete={autoComplete}
                sx={
                  {
                    '.Mui-disabled': {
                      backgroundColor: 'var(--sandgray)',
                      borderRadius: '4px',
                      borderColor: 'var(---linegray)'
                    },
                    ...props?.sxClass
                  }
                }
              />}
            />
            {!(error == null) && (
              <Typography
                className="text-red-600"
                variant="caption"
                display="block"
              >
                {error?.message}
              </Typography>
            )}
          </div>
        </LocalizationProvider>
      )}
    />
  );
}
