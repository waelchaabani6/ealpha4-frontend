import { FormControl, Typography } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import MuiSelect from '@component/dropdown/select';

type SelectProps = {
  control?: Control<any, any>;
  name: string;
  value?: string;
  label?: string;
  required?: boolean;
  size?: 'small' | 'medium';
  // children?: React.ReactNode;
  dataArray: { label: string; value: number | string | boolean }[];
  disabled?: boolean;
  loading?: boolean | undefined;
  disabledAll?: boolean | undefined;
  disablePlaceholderValue?: boolean | undefined;
  onChange?: any;
  ismultiple?: boolean | undefined;
  displayEmpty?: any;
  sx?: any;
}
Select.defaultProps = {
  required: false,
  size: 'small',
  sx: {}
};

export default function Select(props: SelectProps) {
  let tempArr = [...(props?.dataArray || [])];
  if (props?.disabledAll) {
    tempArr = props?.dataArray?.filter((i: any) => i.value !== 'All');
  }
  return (
    <Controller
      control={props.control}
      name={props.name}
      defaultValue={props?.ismultiple ? [] : props?.value || ''}
      render={({ field: { ref, onChange, ...rest }, fieldState: { error } }) => (
        <FormControl fullWidth={true}>
          <Typography
            className={`capitalize ${(error) ? 'text-red-600' : ''}`}
            variant="caption"
            display="block"
          >
            {props.label}
            {
              props.required && (
                <Typography
                  className="text-red-600"
                  variant="caption"
                  display="inline-block"
                >
                  &nbsp;*
                </Typography>
              )
            }
          </Typography>
          <MuiSelect
            {...rest}
            onChange={props?.onChange || onChange}
            inputRef={ref}
            disabled={props.disabled}
            size={props.size}
            error={!!error}
            displayEmpty={props.displayEmpty}
            dataarray={tempArr}
            loading={props?.loading}
            ismultiple={props?.ismultiple}
            disableplaceholdervalue={props?.disablePlaceholderValue}
            sx={props?.sx}
          />
          {
            !(error == null) && (
              <Typography
                className="text-red-600"
                variant="caption"
                display="block"
              >
                {error?.message}
              </Typography>
            )
          }
        </FormControl>
      )}
    />
  );
}
