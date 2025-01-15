/* eslint-disable linebreak-style */
/* eslint-disable arrow-body-style */
/* eslint-disable react/jsx-no-undef */
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';

const StatusComponent = ({ itm, handleOnchange }) => {
  return (
    <div className="flex justify-center">
      <RadioGroup
        row={true}
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        value={itm?.isPresent}
        onChange={() => handleOnchange(itm?.id)}
      >
        <FormControlLabel
          value={true}
          control={<Radio color="success" size="small" />}
          label="Present"
          sx={{ marginRight: '20px' }}
        />
        <FormControlLabel
          value={false}
          control={<Radio color="success" size="small" />}
          label="Absent"
        />
      </RadioGroup>
    </div>
  );
};

export default StatusComponent;
