import { Controller } from 'react-hook-form';
import {
  CustomAutoComplete,
  MaterialAutoComplete
} from '@component/autoComplete/autoComplete';
import {
  FormControl
} from '@mui/material';
import { forwardRef } from 'react';

export default function AutocompleteHookField(props: any): JSX.Element {
  return (
    <Controller
      control={props.control}
      name={props.name}
      rules={{ required: true }}
      render={({ field }) => <CustomAutoComplete {...props} />}
    />
  );
}

const MaterialAutoCompleteFormControl = forwardRef((props: any, ref: any) => (
  <Controller
    control={props.control}
    name={props.name}
    rules={{ required: props.required || false }}
    render={({ field: { onChange, name }, fieldState: { error } }) => (
      <FormControl>
        <MaterialAutoComplete
          message={props.message}
          error={props.error || error}
          disabled={props.disabled}
          isLoading={props.isLoading}
          list={props.list}
          label={props.label}
          name={name}
          onSelect={(val: any) => { props.onSelect(val); onChange(val[props.targetKey]); }}
          required={props.required}
          setDebounceValue={props.setDebounceValue}
          targetKey={props.targetKey}
          ref={props?.ref || ref}
        />
      </FormControl>
    )}
  />
));
export { MaterialAutoCompleteFormControl };
