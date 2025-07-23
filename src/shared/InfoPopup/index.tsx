import CustomizedDialogs from '@component/dialog/CustomDialog';

const InfoPopup = (props: any) => {
  const {
    title,
    description,
    open,
    setOpen,
    maxwidth,
    onclose,
  } = props;
  return (
    <CustomizedDialogs
      title={title}
      open={open}
      setOpen={setOpen}
      maxwidth={maxwidth || 'sm'}
      onclose={onclose}
    >
      <h3 className="text-lg mt-5 font-semibold text-center">{description}</h3>
    </CustomizedDialogs>
  );
};

export default InfoPopup;