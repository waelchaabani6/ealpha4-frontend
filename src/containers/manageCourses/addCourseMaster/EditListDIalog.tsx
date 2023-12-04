import CustomizedDialogs from '@component/dialog/CustomDialog';
import Button from '@component/button/button';
import { CustomInput } from '@component/input';
import { useEffect, useState } from 'react';

const EditListDialog = (props: any) => {
  const {
    title,
    open,
    setOpen,
    maxwidth,
    isLoading,
    onclose,
    playloadData,
    callUpdateAPI
  } = props;

  const [value, setvalue] = useState('');
  useEffect(() => {
    if (Object.keys(playloadData).length) {
      setvalue(playloadData?.label);
    }
  }, [playloadData]);

  const handleUpdate = () => {
    callUpdateAPI(value);
  };

  return (
    <CustomizedDialogs title={title} open={open} setOpen={setOpen} maxwidth={maxwidth || 'sm'} onclose={onclose}>
      <div className="mt-10 mb-5 text-center">
        <CustomInput
          required={true}
          value={value}
          name="textField"
          onChange={(e: any) => {
            if ((e.target.value).match(/^[ A-Za-z0-9_@./#&+-]*$/)) {
              setvalue(e.target.value);
            }
          }}
        />
        <div className="p-5">
          <Button
            onClick={handleUpdate}
            loading={isLoading || false}
          >
            Update
          </Button>

        </div>
      </div>
    </CustomizedDialogs>
  );
};

export default EditListDialog;
