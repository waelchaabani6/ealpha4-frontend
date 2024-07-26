/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable operator-linebreak */
import { FormControl, InputAdornment, Typography } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import { ReactComponent as PenIcon } from '@images/pen.svg';
import { ReactComponent as Eye } from '@images/eye.svg';
import { ReactComponent as EyeDisabled } from '@images/eye_disable.svg';
import MuiInput from '@component/input';
import React, { useState } from 'react';

export type InputProps = {
  control: Control<any, any>;
  name: string;
  type?: 'text' | 'password' | 'number';
  label?: string;
  required?: boolean;
  variant?: 'outlined' | 'standard' | 'filled';
  icon?: boolean;
  size?: 'small' | 'medium';
  placeholder?: string;
  disabled?: boolean;
  onChange?: any;
  autoComplete?: string;
  value?: string | number;
  padding?: boolean;
  sxClass?: any;
  tolowercase?: boolean;
};

Input.defaultProps = {
  icon: true,
  size: 'small',
  type: 'text',
};

export default function Input(props: InputProps) {
  const [showPass, setPass] = useState<boolean>(false);
  return (
    <Controller
      control={props.control}
      name={props.name}
      defaultValue=""
      render={({
        field: { onChange, value, name, ref },
        fieldState: { error },
      }) => (
        <FormControl fullWidth={true}>
          {!!props.label && (
            <Typography
              className={`capitalize ${props?.padding ? 'pb-2' : 'pb-3.5'} ${error ? 'text-red-600' : ''}`}
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
          <MuiInput
            autoComplete={props?.autoComplete || ''}
            value={
              props?.value ||
              (props?.tolowercase ? value?.toLowerCase() : value)
            }
            onChange={props?.onChange || onChange}
            name={name}
            inputRef={ref}
            disabled={props.disabled}
            placeholder={props?.placeholder || ''}
            size={props.size}
            variant={props.variant}
            error={!!error}
            type={showPass ? 'text' : props.type}
            InputProps={
              !props.disabled && (props.icon || props.type === 'password')
                ? {
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        className={
                          props.type !== 'text' && props.type !== 'number'
                            ? `cursor-pointer`
                            : ''
                        }
                        onClick={() => setPass((prev: boolean) => !prev)}
                      >
                        {props.type === 'password' ? (
                          showPass ? (
                            <Eye />
                          ) : (
                            <EyeDisabled />
                          )
                        ) : (
                          <PenIcon />
                        )}
                      </InputAdornment>
                    ),
                  }
                : {}
            }
            sx={{
              '.Mui-disabled': {
                backgroundColor: `${props?.disabled ? '' : 'var(--sandgray)'}`,
                borderRadius: '4px',
                borderColor: 'var(--linegray)',
              },
              '&> .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                {
                  borderColor: 'var(--accent)',
                },
              background: 'white',
              ...props?.sxClass,
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
      )}
    />
  );
}
