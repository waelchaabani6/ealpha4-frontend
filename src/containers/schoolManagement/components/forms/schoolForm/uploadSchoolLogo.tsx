/* eslint-disable no-console */
import FileSelect from '@component/fileUpload';
import DeleteIcon from '@images/delete.svg';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';

export default function UploadSchoolLogo(props: any) {
  const { logoError, setlogoError } = props;
  const imageRef = useRef<any>();
  const { setValue, watch } = useFormContext();
  const onChange = (file: FileList | []) => {
    setValue('logo', file[0]);
    setlogoError('');
  };

  const deleteHandler = () => {
    setValue('logo', null);
  };

  return (
    <div className="w-full h-max border border-accent rounded-md p-6 overflow-auto">
      <h4 className="text-base text-accent font-bold pb-4">Upload School Logo</h4>
      <p className="text-sm pb-4">Logo will be in JPG format.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 content-center gap-y-3 sm:gap-x-6">
        <div className="h-[180px] flex gap-y-6 flex-col lg:flex-row bg-sandgray rounded-md px-5 py-3.5 relative">
          <div className="h-full w-[188px] overflow-hidden rounded-md" style={{ aspectRatio: '3 / 2' }}>
            {
              !watch('logo')
                ? <InsertPhotoIcon style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  fontSize: '170px',
                  opacity: '0.1'
                }}
                />
                : (
                  <img
                    src={typeof watch('logo') === 'string' ? watch('logo') : URL.createObjectURL(watch('logo'))}
                    alt=""
                    loading="lazy"
                    className="h-full w-full"
                  />
                )
            }

          </div>
          <div
            className="flex-1 grid place-items-center text-xs font-light"
          >
            Horizontal Logo: ratio of 3:2 or 245 x 165px
          </div>
          {
            watch('logo') && (
              <div
                role="presentation"
                className="absolute lg:right-4 lg:relative right-3 bg-skypink h-7 w-7
            grid place-items-center rounded-md cursor-pointer"
                onClick={deleteHandler}
              >
                <img src={DeleteIcon} alt="" className="h-full w-full scale-50" />
              </div>
            )
          }
        </div>
        <div className="h-[180px]">
          <FileSelect
            type="image"
            ref={imageRef}
            onChange={onChange}
          />
        </div>
      </div>
      <p className="text-red-500 mt-3">{logoError}</p>
    </div>
  );
}
