/* eslint-disable no-confusing-arrow */
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  TextField,
  Typography,
} from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import { ReactComponent as Search } from '@images/search.svg';
import React, { useImperativeHandle } from 'react';

type Props = {
  control: Control<any, any>;
  name: string;
  value?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  dataArray: { label: string; value: number | string | boolean }[];
  disabled?: boolean | undefined;
  isLoading?: boolean | undefined;
  onChange?: (value: string | null) => void;
  onSelect?: (value: string | null) => void;
  onClose?: (vallue: string) => void;
};

/**
 *
 to make Autocomplete required in the form
 user => setError(fieldName, { message: 'errorMessage' });
 in the onChange callback
 */

const AutoCompleteInput = React.forwardRef((props: Props, myref: any) => {
  useImperativeHandle(myref, () => ({
    clear() {
      const element: HTMLElement = document.querySelector(
        '[title="Clear"]'
      ) as HTMLElement;
      element?.click();
    },
  }));
  return (
    <Controller
      name={props.name}
      control={props.control}
      defaultValue={props?.value}
      render={({ field: { value, onChange, ref }, fieldState: { error } }) => (
        <FormControl fullWidth={true}>
          {!!props.label && (
            <Typography
              className={`capitalize pb-3.5 ${error ? 'text-red-600' : ''}`}
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
          )}
          <Autocomplete
            onClose={(_, reason: any) => props.onClose?.(reason)}
            id="material_ui_autocomplete2"
            className="hasPopupIcon"
            sx={{
              '& .MuiAutocomplete-popupIndicator': { transform: 'none' },
            }}
            disableClearable={true}
            popupIcon={<Search />}
            forcePopupIcon={true}
            loading={props?.isLoading}
            disabled={props?.disabled}
            options={props?.dataArray || []}
            getOptionLabel={(options: any) => options.label}
            renderInput={(params) => (
              <TextField
                {...params}
                onChange={(event: any) =>
                  props?.onChange
                    ? props.onChange(event.target.value)
                    : onChange(event)
                }
                value={props?.value || value}
                name={props.name}
                fullWidth={true}
                placeholder={props?.placeholder || 'Search'}
                sx={{
                  // '& .MuiAutocomplete-endAdornment': { top: '2px' },
                  '& .MuiAutocomplete-clearIndicator': { marginRight: '4px' },
                  '.Mui-disabled': {
                    backgroundColor: 'var(--sandgray)',
                    borderRadius: '4px',
                    borderColor: 'var(---linegray)',
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {props.isLoading ? (
                        <CircularProgress
                          color="inherit"
                          size={20}
                          style={{ marginRight: 8 }}
                        />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                inputRef={ref}
                size="small"
                error={!!error}
              />
            )}
            value={
              (value
                ? (props?.dataArray?.find(
                    (items: any) => value === items.value
                  ) ?? null)
                : null) as any
            }
            onChange={(event: any, newValue: any) =>
              props?.onSelect
                ? props.onSelect(newValue ? (newValue.value as string) : null)
                : onChange(newValue ? (newValue.value as string) : null)
            }
          />
          {!!error && (
            <Typography
              className="text-red-600"
              variant="caption"
              display="block"
            >
              {error?.message}
            </Typography>
          )}
        </FormControl>
      )}
    />
  );
});
export default AutoCompleteInput;
