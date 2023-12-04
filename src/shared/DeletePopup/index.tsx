import CustomizedDialogs from '@component/dialog/CustomDialog';
import Button from '@component/button/button';

const DeletePopup = (props: any) => {
  const {
    title,
    handleDelete,
    description,
    open,
    setOpen,
    maxwidth,
    isLoading,
    onclose,
    removeText
  } = props;
  return (
    <CustomizedDialogs title={title} open={open} setOpen={setOpen} maxwidth={maxwidth || 'sm'} onclose={onclose}>
      <h3
        className="text-md mt-5 font-semibold text-center"
      >
        {description}
      </h3>
      <div className="mt-10 mb-5 text-center">
        <Button
          onClick={handleDelete}
          loading={isLoading || false}
        >
          {removeText || 'Remove'}
        </Button>
      </div>
    </CustomizedDialogs>
  );
};

export default DeletePopup;
