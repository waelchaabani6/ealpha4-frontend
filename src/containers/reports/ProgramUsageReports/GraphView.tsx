/* eslint-disable comma-dangle */
import Wrapper from '@shared/wrapper/Wrapper';
import { useState } from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { GRAPH_LABELS, TABLE_LABELS } from '@constants/constants';
import ProgramUsageOverview from '../BarChart/ProgramUsageOverview';

const Y_AXIS_RADIO_OPTIONS = [
  {
    label: 'Students',
    value: 'option1',
  },
  {
    label: 'Teachers',
    value: 'option2',
  },
  {
    label: 'Total Time - Students',
    value: 'option3',
  },
  {
    label: 'Total Time - Teachers',
    value: 'option4',
  },
  {
    label: 'Total Time - Student + Teachers',
    value: 'option5',
  },
];

const X_AXIS_RADIO_OPTIONS = [
  {
    label: 'Class',
    value: 'class',
  },
  {
    label: 'Teacher',
    value: 'teacher',
  },
];

const GraphView = ({ componentRef, barData, xaxis, setXaxis }) => {
  // const componentRef = useRef(null);

  const [yaxis, setYaxis] = useState('option1');
  // const [xaxis, setXaxis] = useState('class');

  const handleOptionChange = (event: any) => {
    setYaxis(event.target.value);
  };
  const handleOptionXaxisChange = (event: any) => {
    setXaxis(event.target.value);
  };

  const filteredOptions = Y_AXIS_RADIO_OPTIONS.filter(
    (option) => option.label !== 'Teachers'
  );

  return (
    <div ref={componentRef}>
      <div className="wrapperBorder mt-3">
        <Wrapper>
          <div className="flex flex-col">
            <p className="font-semibold text-xl items-center justify-center flex">
              Total Students vs Active Students
            </p>

            <div className="m-2">
              <div className="flex">
                <p className="m-2"> Select to view values on Y-Axis:</p>

                <FormControl>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="Students"
                    name="radio-buttons-group"
                    row={true}
                    value={yaxis}
                    onChange={handleOptionChange}
                  >
                    {(xaxis === 'teacher'
                      ? filteredOptions
                      : Y_AXIS_RADIO_OPTIONS
                    )?.map((i: any) => (
                      <FormControlLabel
                        value={i?.value || ''}
                        control={
                          <Radio
                            sx={{
                              color: 'var(--sunlight)',
                              '&.Mui-checked': {
                                color: 'var(--sunlight)',
                              },
                            }}
                          />
                        }
                        label={i?.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </div>

              <div className="flex justify-start">
                <p className="m-2"> Select to view values on X-Axis:</p>

                <FormControl>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="Students"
                    name="radio-buttons-group"
                    row={true}
                    value={xaxis}
                    onChange={handleOptionXaxisChange}
                  >
                    {X_AXIS_RADIO_OPTIONS?.map((i: any) => (
                      <FormControlLabel
                        value={i?.value || ''}
                        control={
                          <Radio
                            sx={{
                              color: 'var(--sunlight)',
                              '&.Mui-checked': {
                                color: 'var(--sunlight)',
                              },
                            }}
                          />
                        }
                        label={i?.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </div>
            </div>

            <ProgramUsageOverview
              barData={barData}
              xaxis={xaxis}
              yaxis={yaxis}
            />

            <h1 className="font-semibold text-lg flex justify-center mb-19">
              {xaxis === 'class' ? GRAPH_LABELS.CLASSES : TABLE_LABELS.TEACHERS}
            </h1>
          </div>
        </Wrapper>
      </div>
    </div>
  );
};

export default GraphView;
