import { FormControl, FormControlLabel, RadioGroup as MuiRadioGroup, Typography } from '@mui/material';
import Radio from '@component/radio';
import { Control, Controller } from 'react-hook-form';

type RadioGrpProps = {
  label?: string;
  control: Control<any, any>;
  name: string;
  value?: string | boolean;
  required?: boolean;
  disabled?: boolean;
  dataArray: { label: string; value: number | string | boolean }[];
}

export default function RadioGroup(props: RadioGrpProps) {
  const list = props.dataArray?.map((item: { label: string; value: number | string | boolean }) => <FormControlLabel
    value={item.value}
    key={item.label}
    control={<Radio
      disabled={props.disabled}
      size="small"
      sx={{
        color: 'var(--sunlight)',
        '&.Mui-checked': {
          color: 'var(--sunlight)'
        }
      }}
    />}
    label={<p className="text-sm">{item.label}</p>}
  />);
  return <Controller
    control={props.control}
    name={props.name}
    defaultValue=""
    render={({ field, fieldState: { error } }) => (
      <FormControl fullWidth={true}>
        {!!props.label && (
          <Typography
            className={`capitalize ${(error) ? 'text-red-600' : ''}`}
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
        <MuiRadioGroup
          {...field}
          row={true}
        >
          {list}
        </MuiRadioGroup>
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
  />;
}
