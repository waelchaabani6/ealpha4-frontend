/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable comma-dangle */
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Button from '@component/button/button';

const DeletePopup = (props: any) => {
  const {
    title,
    handleDelete,
    description,
    remark,
    open,
    setOpen,
    maxwidth,
    isLoading,
    onclose,
    removeText,
    cancelText,
  } = props;
  return (
    <CustomizedDialogs
      title={title}
      open={open}
      setOpen={setOpen}
      maxwidth={maxwidth || 'sm'}
      onclose={onclose}
    >
      <h3 className="text-md mt-5 font-semibold text-center">{description}</h3>

      {remark && <div className="text-sm text-center"> {remark} </div>}

      <div className="flex justify-between items-center">
        <div className="mt-10 mb-5 text-center">
          <Button onClick={handleDelete} loading={isLoading || false}>
            {removeText || 'Remove'}
          </Button>
        </div>

        <div className="mt-10 mb-5 text-center">
          <Button onClick={() => setOpen(false)} variant="outlined">
            {cancelText || 'Cancel'}
          </Button>
        </div>
      </div>
    </CustomizedDialogs>
  );
};

export default DeletePopup;
