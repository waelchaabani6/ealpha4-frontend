import {
  TextField,
  TextFieldProps,
  FormControl,
  InputAdornment,
  Typography
} from '@mui/material';
import MuiInput from '@component/input';
import { ReactComponent as PenIcon } from '@images/pen.svg';
import { ReactComponent as Eye } from '@images/eye.svg';

type InputProps = Omit<TextFieldProps, 'label'>;

export default function Index(props: InputProps & { parentLabelClass?: string }) {
  return <TextField {...props} />;
}

export function CustomInput(props: any) {
  const { label, required, error, value, onChange, name, ref, readonly, parentLabelClass = '' } = props;
  return (
    <FormControl fullWidth={true}>
      {!!props.label && (
        <Typography
          className={`capitalize ${parentLabelClass} pb-3.5 ${(error) ? 'text-red-600' : ''}`}
          variant="caption"
          display="block"
        >
          {label}
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
      )}
      <MuiInput
        value={value}
        onChange={onChange}
        name={name}
        inputRef={ref}
        disabled={props.disabled}
        placeholder={props?.placeholder || ''}
        size={props.size}
        variant={props.variant}
        error={!!error}
        InputProps={
          (props.icon || props.type === 'password')
            ? {
              endAdornment: (
                <InputAdornment position="end">
                  {
                    props.type === 'password' ? <Eye /> : <PenIcon />
                  }
                </InputAdornment>
              ),
              readOnly: readonly || false
            }
            : {}
        }
        sx={{
          '.Mui-disabled': {
            backgroundColor: 'var(--sandgray)',
            borderRadius: '4px',
            borderColor: 'var(--linegray)'
          },
          ...props.sx
        }}
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
  );
}
