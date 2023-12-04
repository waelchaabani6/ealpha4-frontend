import { Typography } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import MuiCheckbox from '@component/checkbox';

export type CheckboxProps = {
  control: Control<any, any>;
  name: string;
  label?: string | React.ReactNode;
  disabled?: boolean;
  parentLabelClass?: string;
}

export default function CheckBox(props: CheckboxProps): JSX.Element {
  return (
    <Controller
      control={props.control}
      name={props.name}
      defaultValue={false}
      render={({ field: { onChange, value, name, ref }, fieldState: { error } }) => (
        <div>
          <Typography
            display="flex items-center"
          >
            <MuiCheckbox
              disabled={props.disabled || false}
              size="small"
              inputRef={ref}
              checked={!!value}
              onChange={onChange}
              name={name}
            />
            {props?.label && (
              <button
                type="button"
                className={`align-text-top text-md ${props.parentLabelClass || ''}`}
                onClick={() => onChange(!value)}
              >
                {props.label}
              </button>
            )}
          </Typography>

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
      )}
    />
  );
}
