/* eslint-disable linebreak-style */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable indent */
/* eslint-disable no-tabs */
import CustomizedDialogs from '@component/dialog/CustomDialog';
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { styled } from '@mui/system';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Dropdown from '@component/dropdown/Dropdown';
import Button from '@component/button/button';

type WeekendPopupProps = {
  setOpen: (arg0: any) => void;
  open: boolean;
};

const DAYS = [
  {
    key: 'sunday',
    label: 'S',
  },
  {
    key: 'monday',
    label: 'M',
  },
  {
    key: 'tuesday',
    label: 'T',
  },
  {
    key: 'wednesday',
    label: 'W',
  },
  {
    key: 'thursday',
    label: 'T',
  },
  {
    key: 'friday',
    label: 'F',
  },
  {
    key: 'saturday',
    label: 'S',
  },
];

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  gap: theme.spacing(2),
  marginTop: theme.spacing(1),
}));

const StyledToggle = styled(ToggleButton)(({ theme }) => ({
  borderRadius: '50% !important',
  border: '1px solid !important',
  borderColor: '#DFE0DF !important',
  background: '#E5F8E2',
  // margin: theme.spacing(2),
  padding: theme.spacing(0, 1),
  '&.Mui-selected': {
    color: 'white',
    background: '#4A9D2D',
  },

  '&:hover': {
    borderColor: '#baeda8',
    background: '#baeda8',
  },
  '&:hover.Mui-selected': {
    borderColor: '#baeda8',
    background: '#baeda8',
  },

  minWidth: 47,
  maxWidth: 47,
  height: 47,
  textTransform: 'unset',
  fontSize: '0.75rem',
  root: {},
  selected: {},
}));

const DURATIONS = [
  { label: 'Duration: 3 Months', value: '0' },
  { label: 'Duration: 6 Months', value: '1' },
  { label: 'Period: Current Year', value: '2' },
  { label: 'Period: Academic Year', value: '3' },
];

const WeekendPopup = ({ setOpen, open }: WeekendPopupProps) => {
  const [day, setDay] = useState(5);
  const [repeat, setRepeate] = useState('never');
  const [duration, setDuration] = useState(undefined);

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    weekday: number
  ) => {
    setDay(weekday);
  };

  const {
    handleSubmit,
    control,
    setError,
    reset,
    clearErrors,
    setValue,
    watch,
  } = useForm<any>({
    // resolver: yupResolver(addSubAdminSchema),
    // defaultValues: {
    // 	flag: false,
    // },
  });

  return (
    <CustomizedDialogs
      open={open}
      setOpen={(parameter: any) => {
        setOpen(false);
      }}
      title="Edit weekend"
      className="mycustomedialog"
      maxWidth="493px"
      fullWidth={false}
    >
      <div>
        <p className="text-xs font-semibold">
          Select a day <span className="text-red-600">*</span>
        </p>

        <StyledToggleButtonGroup
          size="small"
          arial-label="Days of the week"
          onChange={handleChange}
          value={day}
          exclusive={true}
        >
          {DAYS.map((d, index) => (
            <StyledToggle key={d.key} value={index} aria-label={d.key}>
              {d.label}
            </StyledToggle>
          ))}
        </StyledToggleButtonGroup>

        <p className="text-red-600 text-xs mt-3">* Please select one day.</p>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold">
          Ends after <span className="text-red-600">*</span>
        </p>

        <div className="flex items-end gap-x-4">
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue={repeat}
            name="radio-buttons-group"
            onChange={(e) => setRepeate(e.target.value)}
          >
            <FormControlLabel
              value="never"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: 'var(--accent)',
                    '&.Mui-checked': {
                      color: 'var(--accent)',
                    },
                  }}
                />
              }
              label="Never"
            />
            <FormControlLabel
              className="mt-8"
              value="after"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: 'var(--accent)',
                    '&.Mui-checked': {
                      color: 'var(--accent)',
                    },
                  }}
                />
              }
              label="After *"
            />
          </RadioGroup>

          <div className=" w-1/2">
            <Dropdown
              title="Select"
              value={duration}
              dataArray={DURATIONS}
              onChangeHandler={(value) => {
                // const obj: any = courses.filter(
                //   (ele: { value: string; id: number }) => ele?.value === value
                // )[0];
                // setSelectedCourseId(obj.id);
                // setSelectedCourse(obj.label);
              }}
              sxClass={{ border: '1px solid gray', width: '100%' }}
              parentStyle="grow"
              disabled={repeat === 'never'}
            />
          </div>
        </div>
        <p className="text-red-600 text-xs mt-3">* Please select a period</p>
      </div>

      <div className="flex justify-end mt-4 gap-4">
        <Button
          // loading={LoadAddParent || loadingUpdateParent}
          variant="outlined"
          onClick={() => console.log('cancel')}
        >
          Cancel
        </Button>
        <Button
          // loading={LoadAddParent || loadingUpdateParent}
          onClick={() => console.log('save')}
        >
          Save
        </Button>
      </div>
    </CustomizedDialogs>
  );
};

export default WeekendPopup;
