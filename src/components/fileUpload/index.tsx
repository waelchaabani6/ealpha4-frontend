import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Button from '@component/button/button';
import UploadIcon from '@images/upload.svg';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import toast from '@shared/toast';
import { toast as reactToast } from 'react-toastify';
import InfoIcon from '@mui/icons-material/Info';
import { DEFAULT_FILE_SIZE, DEFAULT_IMAGE_SIZE } from '@constants/constants';

type FileUploadProps = {
  onChange: (val: FileList) => void;
  type?: 'file' | 'image';
  placeholder?: string;
  children?: React.ReactNode;
  singleSelect?: boolean;
  parentContainerClass?: string;
}

const FileUpload = forwardRef((props: FileUploadProps, ref: any) => {
  const [dragOver, setDragOver] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [largeFiles, setLargeFiles] = useState<File[] | []>([]);

  useEffect(() => {
    if (largeFiles && largeFiles.length > 0) {
      setOpen(true);
    }
  }, [largeFiles]);

  const validateFiles = (fileList: FileList) => {
    const tmpLargeFiles = [] as File[];
    const validFiles = [] as File[];
    if (props?.type === 'image') {
      const image = fileList[0];
      if (image.type.split('/')[0] !== 'image') {
        reactToast.dismiss();
        toast('error', 'Please select Image');
        return;
      }
      if (image.size > DEFAULT_IMAGE_SIZE) {
        reactToast.dismiss();
        toast('error', 'Image is too large to upload');
        return;
      }
      reactToast.dismiss();
      props.onChange(fileList as FileList);
    } else {
      Array.from(fileList).forEach((fle: File) => {
        if (fle.size >= DEFAULT_FILE_SIZE) {
          tmpLargeFiles.push(fle as File);
        } else {
          validFiles.push(fle as File);
        }
      });
      if (validFiles.length > 0) {
        props.onChange(validFiles as unknown as FileList);
      }
      if (tmpLargeFiles.length > 0) {
        setLargeFiles(tmpLargeFiles);
      }
    }
  };

  const dropHandler = (ev: React.DragEvent<HTMLDivElement>): void => {
    ev.preventDefault();
    ev.stopPropagation();
    setDragOver((prev) => !prev);
    validateFiles(ev.dataTransfer.files);
  };
  const dragOverHandler = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    setDragOver((prev) => !prev);
  };
  const onChangeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.target.files) {
      validateFiles(ev.target.files);
    }
  };

  const uploadHandler = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation();
    // props.onUpload('test');
    inputRef?.current?.click();
  };

  const clickHandler = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    inputRef?.current?.click();
  };

  // useImperativeHandle(ref, () => ({
  //   remove() {
  //     setFile([]);
  //   }
  // }));

  return (
    <>
      <CustomizedDialogs open={open} title="Large files" setOpen={() => setOpen(false)}>
        <p className="p-1 text-xs text-red-500">These files are too large to upload</p>
        <ul className="space-y-2">
          {
            largeFiles?.map((file: File, index: number) => (
              <li
                key={`${file.name}_${index}`}
                className="bg-sandgray rounded-md p-2"
              >
                {
                  file.name
                }
              </li>
            ))
          }
        </ul>
      </CustomizedDialogs>
      <div
        onDrop={dropHandler}
        onDragOver={dragOverHandler}
        onDragLeave={dragOverHandler}
        className={props.children === undefined ? `relative py-4 grid place-items-center rounded bg-light-accent border-accent border-2 border-dashed ${props.parentContainerClass || 'h-full'}` : ''}
      >
        {
          (largeFiles.length > 0 && props?.type !== 'image') && <InfoIcon onClick={() => setOpen(true)} className="absolute top-2 right-3" />
        }
        {props.children
          ? <span onClick={clickHandler}>{props.children}</span>
          : <div className="w-full flex flex-col lg:flex-row
      gap-2 items-center justify-center text-sm text-center overflow-hidden"
          >
            <img
              src={UploadIcon}
              alt=""
            />
            <p className="truncate">{props?.placeholder || 'Drop your document here or'}</p>
            <p
              className="underline cursor-pointer text-accent"
              onClick={clickHandler}
            >
              Browse
            </p>
            <div className="lg:ml-6">
              <Button
                type="button"
                onClick={uploadHandler}
              >
                Upload
              </Button>
            </div>
            {/* eslint-disable-next-line react/jsx-indent */}
            </div>}

        <input
          hidden={true}
          ref={inputRef}
          type="file"
          onClick={(ev: any) => {
            ev.target.value = '';
          }}
          onChange={onChangeHandler}
          {...(props?.type === 'image' ? { accept: 'image/*' } : null)}
          {
          ...(props?.singleSelect ? { multiple: false } : { multiple: props?.type !== 'image' })
          }

        />

      </div>
    </>
  );
});
FileUpload.defaultProps = {
  singleSelect: false
};
export default FileUpload;
