import React, { useState } from 'react';
import { TextField, Typography } from '@mui/material';
import { DesktopDateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment, { MomentInput } from 'moment';
import { Control, Controller } from 'react-hook-form';
import { ReactComponent as DatePickerIcon } from '@images/calendar.svg';

type DateTimePickerProps = {
  control: Control<any, any>;
  name: string;
  value?: MomentInput | null;
  label: string;
  disableOld?: boolean | undefined;
  disabled?: boolean;
  disablePast?: Date | undefined;
  disableFuture?: Date | undefined;
  range?: boolean | undefined;
  onChange?: any;
  required?: boolean;
  sxClass?: any;
}
export default function DateTimePicker(props: DateTimePickerProps) {
  const [open, setOpen] = useState<boolean>(false);
  const togglePicker = () => setOpen(!open);
  return (
    <Controller
      control={props.control}
      name={props.name}
      defaultValue={props?.value || null}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <div className="w-full h-full">
            <Typography
              className={`capitalize pb-3.5 ${(error) ? 'text-red-600' : ''}`}
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
            <DesktopDateTimePicker
              ampm={false}
              inputFormat="DD-MM-YYYY HH:mm:ss"
              open={open && !props.disabled}
              onOpen={togglePicker}
              onClose={togglePicker}
              disabled={props.disabled}
              disablePast={props?.disableOld}
              minDateTime={props?.disablePast ? moment(props?.disablePast, 'DD-MM-YYYY HH:mm:ss') : undefined}
              maxDateTime={props?.disableFuture ? moment(props?.disableFuture, 'DD-MM-YYYY HH:mm:ss') : undefined}
              value={props.value || value}
              onChange={props?.onChange || onChange}
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
                sx={{
                  '.Mui-disabled': {
                    backgroundColor: `${props?.disabled ? '' : 'var(--sandgray)'}`,
                    borderRadius: '4px',
                    borderColor: 'var(---linegray)'
                  },
                  ...props?.sxClass
                }}
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
