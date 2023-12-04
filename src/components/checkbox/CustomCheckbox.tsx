import Checkbox from '@mui/material/Checkbox';

const CustomCheckbox = (props: any) => {
  const { handleselect, data, checked, selector } = props;
  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

  return (
    <Checkbox
      checked={checked}
      onChange={(e: any) => handleselect(e.target.checked, data, selector || 'id')}
      {...label}
      {...props}
      color="success"
    />
  );
};

export default CustomCheckbox;
