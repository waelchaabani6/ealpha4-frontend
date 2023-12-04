import CustomizedDialogs from '@component/dialog/CustomDialog';
import Button from '@component/button/button';
import { useState, useEffect } from 'react';

type DelteConfirmationPopupType = { ConfirmDelete: boolean, setConfirmDelete: any; onClickYes: () => void}

function DelteConfirmationPopup({ ConfirmDelete, setConfirmDelete, onClickYes } : DelteConfirmationPopupType) {
  const [isDisable, setDisable] = useState(false);

  useEffect(() => {
    if (ConfirmDelete) {
      setDisable(false);
    }
  }, [ConfirmDelete]);

  return (
    <CustomizedDialogs
      open={ConfirmDelete}
      maxwidth="sm"
      setOpen={(parameter: any) => { setConfirmDelete(false); }}
      title="Select Action"
    >
      <div>
        Are you sure you want to delete this?
      </div>
      <div className="flex justify-end items-center mt-12">
        <Button
          onClick={() => { setConfirmDelete(false); }}
          sx={{ marginRight: '10px' }}
        >
          No
        </Button>
        <Button
          disabled={isDisable}
          onClick={() => { onClickYes(); setDisable(true); }}
          sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: '#dd6666' } }}
        >
          Yes
        </Button>
      </div>
    </CustomizedDialogs>
  );
}
export default DelteConfirmationPopup;
