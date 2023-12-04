import AppTextEditor from '@component/txtEditor/AppTextEditor';
import { FormControl, Typography } from '@mui/material';
import React from 'react';
import { Control, Controller } from 'react-hook-form';

type Props = {
  control: Control<any, any>;
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function TextEditor(props: Props) {
  return (
    <Controller
      render={({ field, fieldState: { error } }) => (
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
          <AppTextEditor {...field} error={!!error} />
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
      name={props.name}
      control={props.control}
      // defaultValue=""
    />
  );
}
