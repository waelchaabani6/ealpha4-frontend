/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
import { Typography, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
// import moment from 'moment';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { ReactComponent as DatePickerIcon } from '@images/calendar.svg';
import { useEffect, useState } from 'react';

type DatePickerProps = {
  value?: string | null | Date;
  label?: string;
  disabled?: boolean;
  handlePickerChange?: any;
  error?: any;
  shouldDisableDate?: (dateParam: Date) => boolean;
  intialdate?: Date;
  sxType?: any;
  defaultStyle?: boolean;
  disablePast?: boolean;
  format?: any;
  disableOld?: Date | undefined;
  disableFuture?: Date | undefined;
  fullWidth?: boolean;
  views?: string;
  noFontSize?: boolean;
  parentLabelClass?: string;
};

DatePicker.defaultProps = {
  defaultStyle: false,
};

export default function DatePicker(props: DatePickerProps) {
  const {
    error,
    value,
    label,
    disabled,
    handlePickerChange,
    intialdate,
    shouldDisableDate,
    sxType,
    disablePast = true,
    format,
    noFontSize = false,
    parentLabelClass = '',
  } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [date, setDateValue] = useState<any>();

  useEffect(() => {
    setDateValue(intialdate || value);
  }, [intialdate, value]);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div className="w-full">
        <Typography
          className={`capitalize ${parentLabelClass} ${props?.fullWidth ? 'pb-[4.6px]' : 'pb-3'} ${error ? 'text-red-600' : ''}`}
          variant="caption"
          style={
            noFontSize
              ? {}
              : sxType === 3
                ? { fontSize: '13.8px', textAlign: 'left' }
                : { fontSize: '13.8px' }
          }
          display="block"
        >
          {label}
        </Typography>
        <MuiDatePicker
          {...(props?.views
            ? {
                views: [props?.views as any],
              }
            : null)}
          disablePast={disablePast}
          {...(props?.disableOld
            ? {
                minDate: props?.disableOld,
              }
            : null)}
          {...(props?.disableFuture
            ? {
                maxDate: props?.disableFuture,
              }
            : null)}
          shouldDisableDate={shouldDisableDate}
          {...(!props?.defaultStyle
            ? {
                PopperProps: {
                  sx: {
                    '.MuiPickersCalendarHeader-root': {
                      position: 'relative',
                    },
                    '.MuiPickersCalendarHeader-labelContainer': {
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'orange',
                      fontSize: '15px',
                    },
                    '.MuiPickersArrowSwitcher-root': {
                      width: '100%',
                      justifyContent: 'space-between',
                    },
                    '.MuiDayPicker-weekDayLabel': {
                      color: 'lightgreen',
                    },
                    '.MuiPickersDay-root.Mui-selected.MuiPickersDay-dayWithMargin':
                      {
                        backgroundColor: 'white',
                        color: 'black',
                        fontWeight: 'bold',
                      },
                    '.MuiPickersDay-today': {
                      border: 'none',
                    },
                    '.MuiIconButton-sizeSmall.MuiPickersCalendarHeader-switchViewButton':
                      {
                        display: 'none',
                      },
                    '.MuiCalendarPicker-root': {
                      overflow: 'hidden',
                      height: '297px',
                    },
                  },
                },
              }
            : null)}
          open={open}
          value={date || value || null}
          onOpen={() => !props?.disabled && setOpen(true)}
          onClose={() => setOpen(false)}
          onChange={(e) => {
            handlePickerChange(e);
            setDateValue(e);
          }}
          disabled={disabled}
          inputFormat={format || 'DD-MM-YYYY'}
          components={{
            OpenPickerIcon: DatePickerIcon,
          }}
          className="mycustomedaterange"
          renderInput={(params) => (
            <TextField
              onClick={() => !props?.disabled && setOpen(true)}
              {...params}
              size="small"
              onKeyDown={(e) => e.preventDefault()}
              error={!!error}
              className="input-custome-daterange"
              sx={{
                backgroundColor: 'white',
                borderRadius: '4px',
                '.Mui-disabled': {
                  backgroundColor: 'var(--sandgray)',
                  borderRadius: '4px',
                  borderColor: 'var(---linegray)',
                },
                ...(props?.fullWidth && sxType === 4 ? { width: '100%' } : {}),
                '.MuiInputBase-root': {
                  ...(sxType === 1
                    ? {
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '15px',
                        fontFamily: 'Montserrat-500',
                      }
                    : sxType === 2
                      ? {
                          backgroundColor: 'white',
                        }
                      : sxType === 3
                        ? {
                            fontWeight: 400,
                            fontSize: '12px',
                            lineHeight: '15px',
                            fontFamily: 'Montserrat-500',
                            border: '1px solid grey',
                          }
                        : sxType === 4
                          ? {
                              fontSize: '12px',
                              lineHeight: '15px',
                              fontFamily: 'Montserrat-500',
                            }
                          : {}),
                },
                '.MuiInputBase-input.MuiOutlinedInput-input': {
                  ...(sxType === 2 && {
                    fontSize: '13px',
                  }),
                },
                '& fieldset': {
                  ...(sxType === 1 && {
                    border: 'white',
                  }),
                },
                '.MuiTextField-root': {
                  ...(sxType === 1 && {
                    top: '-2px',
                  }),
                  background: 'red',
                },
                ...(sxType === 1 && {
                  overflow: 'hidden',
                  background: 'var(--white)',
                  // border: '1px solid var(--linegray)',
                  width: props?.fullWidth ? '100%' : '150px',
                  height: '36px',
                  boxShadow: open
                    ? '0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%)'
                    : 'none',
                }),
              }}
            />
          )}
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
  );
}
