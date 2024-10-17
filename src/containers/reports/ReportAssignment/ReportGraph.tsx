/* eslint-disable comma-dangle */
import { GRAPH_LABELS, USER_TYPE } from '@constants/constants';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useSelector } from 'react-redux';

import Wrapper from '@shared/wrapper/Wrapper';
import Dropdown from '@component/dropdown/Dropdown';

import MultipleAssignmentsBarGraph from '../BarChart/MultipleAssignmentsBarGraph';
import MultipleAssignmentLineChart from '../LineChart/MultipleAssignmentLineChart';
import MultipleAssignmentAreaBar from '../BarChart/MultipleAssignmentAreaBar';

const { SCHOOL_ADMIN } = USER_TYPE;

type ReportGraphProps = {
  componentRef: React.MutableRefObject<any>;
  scoreData: any;
  PercengateData: any[];
  lineArray: any[];
  PerformanceData: any[];
  BranchArray: any[];
  selectedBranch: any;
  setselectedBranch: React.Dispatch<any>;
  selectedClass: any;
  classArray: any[];
  setSelectedClass: React.Dispatch<any>;
  setLine: React.Dispatch<React.SetStateAction<number>>;
  setPercentage: React.Dispatch<React.SetStateAction<string>>;
  percentage: string;
};

const ReportGraph = ({
  componentRef,
  scoreData,
  PercengateData,
  lineArray,
  PerformanceData,
  BranchArray,
  selectedBranch,
  setselectedBranch,
  selectedClass,
  classArray,
  setSelectedClass,
  setLine,
  setPercentage,
  percentage,
}: ReportGraphProps) => {
  // const [percentage, setPercentage] = useState('false');
  const userData = useSelector((state: any) => state?.user);

  const USER_ROLE = userData?.role?.name;

  const handleOptionChange = (event: any) => {
    setPercentage(event.target.value);
  };

  return (
    <div ref={componentRef}>
      <div className="py-4 h-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-accent rounded-md ">
          <div className="flex flex-col items-center justify-center">
            <p className="font-semibold text-2xl">
              {GRAPH_LABELS.OVERALL_SCORE}
            </p>
            <div className="flex">
              <p className="m-2"> Select to view values on Y-Axis:</p>
              <FormControl>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue="score"
                  name="radio-buttons-group"
                  row={true}
                  onChange={handleOptionChange}
                  value={percentage}
                >
                  <FormControlLabel
                    value={false}
                    defaultChecked={true}
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
                    label="Score"
                  />
                  <FormControlLabel
                    value={true}
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
                    label="Percentage"
                  />
                </RadioGroup>
              </FormControl>
            </div>
          </div>
          <div className="overflow-x-auto">
            <MultipleAssignmentsBarGraph
              tabledata={scoreData}
              Per={percentage}
              PerData={PercengateData}
            />
          </div>
        </div>
        <div className="p-4 bg-white border border-accent rounded-md">
          <MultipleAssignmentAreaBar performance={PerformanceData} />
        </div>
      </div>

      <Wrapper>
        <div className="wrapperBorder mt-3">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <p className="font-semibold text-2xl mt-5">
                {GRAPH_LABELS.ATTAINMENT_OVER_DATA}
              </p>
            </div>
            <div className="flex ml-auto p-2">
              {userData && USER_ROLE === SCHOOL_ADMIN && (
                <>
                  <p className="m-4 mb-5">Select Branch :</p>

                  <Dropdown
                    value={selectedBranch}
                    dataArray={BranchArray}
                    border={true}
                    onChangeHandler={(val) => {
                      setselectedBranch(val);
                    }}
                    sxClass={{ width: '206px', marginRight: '10px' }}
                    displayEmpty={true}
                  />
                </>
              )}
              <p className="m-4 mb-5">Select Class :</p>
              <Dropdown
                displayEmpty={true}
                border={true}
                value={selectedClass}
                dataArray={classArray}
                onChangeHandler={(val) => {
                  // const obj: any = classArray.filter(
                  //   (ele: { label: any }) => ele.label === val
                  // )[0];
                  // setClassId(obj.id);
                  setSelectedClass(val);
                  setLine(1);
                }}
              />
            </div>
          </div>
          <MultipleAssignmentLineChart LineData={lineArray} />
        </div>
      </Wrapper>
    </div>
  );
};

export default ReportGraph;
