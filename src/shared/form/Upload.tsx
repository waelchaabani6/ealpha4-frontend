import {
  Control,
  Controller
} from 'react-hook-form';
import { Typography } from '@mui/material';
import InputFileUpload from '@component/fileUpload';
import { forwardRef } from 'react';

interface FileUploadProps {
  onChange: (val: FileList) => void;
  control: Control<any, any>;
  name: string;
  type?: 'file' | 'image';
}

export default forwardRef((props: FileUploadProps, ref: any) => (
  <Controller
    control={props.control}
    name={props.name}
    defaultValue=""
    render={({ field: { name }, fieldState: { error } }) => (
      <div className="w-full h-full hover:cursor-pointer">
        <InputFileUpload
          type={props?.type}
          ref={ref}
          onChange={props.onChange}
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
    )}
  />
));
