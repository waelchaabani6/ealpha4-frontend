import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

type Props = {
  view?: string;
  setView?: any;
};
const ButtonToggle = (props: Props) => {
  const { view, setView } = props;

  const getButtonStyle = (color: any) => ({
    width: '50px',
    height: '50px',
    backgroundColor: color === view ? 'white' : 'var(--linegray)', // Customize the selected and unselected colors
    color: color === view ? 'green' : 'black', // Customize the selected and unselected text colors
    border: `1px solid ${color === view ? 'green' : 'transparent'}`
  });

  const handleChange = (event: any, newColor: any) => {
    if (newColor) {
      setView(newColor);
    }
  };
  return (
    <div>
      <ToggleButtonGroup
        orientation="horizontal"
        value={view}
        exclusive={true}
        onChange={handleChange}
      >
        <ToggleButton
          value="default"
          aria-label="list"
          style={getButtonStyle('default')}
        >
          <ViewWeekOutlinedIcon fontSize="medium" />
        </ToggleButton>
        <ToggleButton
          value="secondary"
          aria-label="module"
          style={getButtonStyle('secondary')}
        >
          <AssessmentOutlinedIcon fontSize="medium" />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default ButtonToggle;
