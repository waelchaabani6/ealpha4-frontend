/* eslint-disable operator-linebreak */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import PrintIcon from '@mui/icons-material/Print';
import { CSVLink } from 'react-csv';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import ReactToPrint from 'react-to-print';
import routes from '@constants/routes';
import Wrapper from '@shared/wrapper/Wrapper';
import Dropdown from '@component/dropdown/Dropdown';
import { useGet, usePatch } from '@shared/api/useApi';
import moment from 'moment';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { CustomInput } from '@component/input';
import Button from '@component/button/button';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { HEADERMENUS } from '@constants/constants';
import RouteLayout from '../../layout/routeLayout';
import { TABLE_LABELS, TOOLBAR_LABELS } from '../../../constants/constants';
import SimpleTableDx from '../../../components/SimpleTableDx/index';

const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;

type dataType = { label: string; value: string };
const stateChange: any = {
  'Mark as Ongoing': 'Ongoing',
  'Mark As Complete': 'Completed',
};

const printButton = () => <PrintIcon />;
const dataArray: dataType[] = [];

const csvSubHeaders = ['Pages', 'Score', 'Unattempted', 'Incorrect', 'Correct'];
interface Column {
  id:
    | 'Pages'
    | 'Score'
    | 'Errors'
    | 'Mistake'
    | 'Unattempted'
    | 'Wrong'
    | 'Correct'
    | 'MyScore';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
  component?: 'Dropdown';
  dataArray?: Array<{ label: string; value: string }>;
  selectedValue?: string;
}
// readonly Column[]
const columns: Column[] = [
  {
    id: 'Pages',
    label: 'Page',
    minWidth: 170,
    align: 'right',
    component: 'Dropdown',
    dataArray,
    selectedValue: '',
  },
  { id: 'Unattempted', label: 'Unattempted', minWidth: 170, align: 'right' },
  { id: 'Wrong', label: 'Incorrect', minWidth: 170, align: 'right' },
  { id: 'Correct', label: 'Correct', minWidth: 170, align: 'right' },
  { id: 'MyScore', label: 'Score', minWidth: 100, align: 'right' },
];

interface Data {
  Pages: string;
  MyScore: string;
  Unattempted: number;
  Wrong: number;
  Correct: number;
  pageNumber: string;
  scormDataView: any;
}

function createData(
  Pages: string,
  Score: number,
  Unattempted: number,
  Wrong: number,
  Correct: number,
  maxScore: number,
  pageNumber: string,
  scormData: any
): Data {
  const MyScore: any =
    Score === 0
      ? `0%`
      : `${parseFloat(((Number(Correct) * 100) / Number(maxScore)).toFixed(2))}%`;
  const scormDataView = scormData ? JSON.parse(scormData) : {};
  return {
    Pages,
    Unattempted,
    Wrong,
    Correct,
    MyScore,
    pageNumber,
    scormDataView,
  };
}
function createExcellData(ele: any) {
  return [ele.Pages, ele.MyScore, ele.Unattempted, ele.Wrong, ele.Correct];
}

function AssignmentDetails(): JSX.Element {
  const navigate = useNavigate();
  const { assignId, assignedStudentsList, isFromComplete, schoolName } =
    useParams();
  const { state: locationState } = useLocation();

  const [csvData, setCsvData] = useState<[]>([]);
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [columnsHeader, setColumns] = useState(columns);
  const [assignmentData, setAssignmentData] = useState<any>({});
  const [assignmentId, setAssignmentId] = useState<any>(-1);
  const [studentList, setStudentList] = useState([]);
  const [selectedStudentName, setSelectedStudentName] = useState<any>();
  const [markStatusChange, setMarkStatusChange] = useState(false);
  const [modState, selectedModState] = useState('');
  const [selectedId, setSelectedId] = useState(-1);
  const { first_name: fName, last_name: lName } = useSelector(selectUser);
  const [jsonData, setJsonData] = useState([]);
  const [jsonCopyData, setJsonCopyData] = useState([]);
  const [AttachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const location = useLocation();
  const score = 80;
  const componentRef = useRef(null);
  const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
  const [fullHeight, setFullHeight] = useState(false);
  const [teacher, setTeacher] = useState('');
  const [val, setValue] = React.useState({
    Nmeet1: '',
    Nmeet2: '',
    exceed1: '',
    exceed2: '',
    meet1: '',
    meet2: '',
    approching1: '',
    approching2: '',
  });

  useEffect(() => {
    setAssignmentId(assignId);
    if (studentList.length !== 0) {
      const obj: any = studentList.filter(
        (ele: { id: any }) => Number(ele.id) === Number(assignId)
      )[0];
      setSelectedStudentName({
        label: obj.label,
        value: obj.value,
        id: obj.id,
      });
      setSelectedId(obj.id);
    }
  }, [studentList]);

  const handelSendEmail = () => {
    const payload = {
      list_type: 'school-list',
    };
    setPlayloadData({
      apicall: 'sendEmail',
      payload,
    });
  };

  const changeColumnsHeader = (val: string, cIndex: number) => {
    const columnsHeader2 = columnsHeader.map((ele, index) => {
      if (ele.component === 'Dropdown' && cIndex === index) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setJsonData(jsonCopyData.filter((page) => page.Pages === val));
        return { ...ele, selectedValue: val };
      }
      return ele;
    });
    setColumns(columnsHeader2);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD_NEW_SCHOOL) {
      navigate(routes?.SCHOOL_MANAGEMENT__ADD);
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    } else if (title === 'Preview') {
      let state = { ...locationState };
      if (assignmentData && assignmentData.end_date) {
        state = {
          ...locationState,
          isDueDatedExceeded:
            new Date() > new Date(assignmentData.end_date) ||
            assignmentData?.state === 'Submitted' ||
            assignmentData?.state === 'Completed',
        };
      }
      navigate(`/${schoolNameInURL}/course-preview`, {
        state,
      });
    }
  };

  const ADMIN_TOOLBAR_MENU = [
    {
      type: HEADERMENUS.BUTTON,
      title: 'Preview',
    },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Assignments Details.csv"
          data={csvData}
          headers={csvSubHeaders}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      ),
    },
    {
      title: TOOLBAR_LABELS.PRINT,
      icon: (
        <ReactToPrint
          trigger={printButton}
          content={() => componentRef.current}
          onAfterPrint={() => setFullHeight(false)}
          onBeforeGetContent={() =>
            new Promise((resolve) => {
              setFullHeight(true);
              setTimeout(() => {
                resolve(0);
              }, 1000);
            })
          }
        />
      ),
    },
  ];

  if (locationState === null) {
    ADMIN_TOOLBAR_MENU.shift();
  }

  // eslint-disable-next-line consistent-return
  function colorCode(score: any, type: string) {
    if (score >= val.exceed1 && score <= val.exceed2) {
      // Exceeds
      return { bg: '#E5F8E2', color: '#6CA463' }[type];
    }
    if (score >= val.meet1 && score < val.meet2) {
      /// Meets
      return { bg: '#BECCFF', color: '#132E90 ' }[type];
    }
    if (score >= val.approching1 && score < val.approching2) {
      // Approaching
      return { bg: '#FFF9BE', color: '#C7B551' }[type];
    }
    if (score >= val.Nmeet1 && score < val.Nmeet2) {
      // Does not Meet
      return { bg: '#FCD4C6', color: '#E36B6B' }[type];
    }
  }

  function getPerformanceText(score: any) {
    if (score >= val.exceed1 && score <= val.exceed2) {
      return 'Exceeds';
    }
    if (score >= val.meet1 && score < val.meet2) {
      return 'Meets';
    }
    if (score >= val.approching1 && score < val.approching2) {
      return 'Approaching';
    }
    if (score >= val.Nmeet1 && score < val.Nmeet2) {
      return 'Does not Meet';
    }
  }

  const {
    isLoading: studentAssignmentPagesLoading,
    refetch: refetchJsonData,
  }: any = useGet({
    baseURL,
    url: `assignments-service/assignment/student/${assignmentId}/report/`,
    onSuccess: (res: any) => {
      const results = res.data.response;
      setAssignmentData(results);
      setTeacher(results?.teacher);
      let jsonRespData: any = [];
      res?.data?.response?.assignment_progress?.forEach((ele: any) => {
        if (ele.json_data && ele.json_data.length) {
          ele.json_data.forEach((element: any) => {
            jsonRespData.push(element);
          });
        }
      });
      const pagesArray =
        jsonRespData && jsonRespData.length !== 0
          ? jsonRespData.map((ele: any) => ({
              label: ele.page_name,
              value: ele.page_name,
            }))
          : [];
      jsonRespData =
        jsonRespData && jsonRespData.length !== 0
          ? jsonRespData.map((ele: any) =>
              createData(
                ele.page_name,
                ele.score,
                ele.unattempted_count,
                ele.mistake_count,
                ele.absolute_score,
                ele.max_score,
                ele?.page_number,
                ele?.scormData
              )
            )
          : [];
      setJsonData(jsonRespData);
      setJsonCopyData(jsonRespData);

      if (jsonRespData && jsonRespData.length !== 0) {
        setCsvData(jsonRespData.map((ele: any) => createExcellData(ele)));
      }

      const columnsHeader2 = columnsHeader.map((ele) => {
        if (ele.component === 'Dropdown') {
          return { ...ele, dataArray: pagesArray };
        }
        return ele;
      });
      setColumns(columnsHeader2);
    },
    onError: ({ response }: any) => {},
    enabled: false,
  });

  // Update:
  const { isLoading: updateLoading, mutate: updateStatus } = usePatch({
    baseURL,
    url: `assignments-service/assignments/teacher/${selectedId}/change-status/`,
    onSuccess: ({ response }: any) => {
      setMarkStatusChange(false);
      refetchJsonData();
    },
    onError: ({ response }: any) => {},
  });

  const statusChange = () => {
    const passObj: any = { state: stateChange[modState] };
    const userFd = new FormData();
    Object.keys(passObj).forEach((key: string) => {
      userFd.append(key, passObj[key]);
    });
    updateStatus(userFd);
  };

  const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;

  const { isLoading: performance, refetch: GetPerformance } = useGet({
    baseURL: ReportURL,
    url: `reports-service/performance_expectation/?user_id=${teacher}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      const body: any = [];
      const fetchedRecords = resp?.slice(0, 4);
      console.log(fetchedRecords);
      const meetObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Meets'
      );
      const AppObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Approaching'
      );
      const DMeetObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Does Not Meet'
      );
      const ExceedsObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Exceeds'
      );
      setValue((prevState: any) => ({
        ...prevState,
        meet1: meetObj?.from_value,
        meet2: meetObj?.to_value,
        exceed1: ExceedsObj?.from_value,
        exceed2: ExceedsObj?.to_value,
        approching1: AppObj?.from_value,
        approching2: AppObj?.to_value,
        Nmeet1: DMeetObj?.from_value,
        Nmeet2: DMeetObj?.to_value,
      }));
    },
    enabled: false,
    retry: false,
  });

  useEffect(() => {
    if (assignmentId !== -1 && assignmentId) {
      refetchJsonData();
    }
  }, [assignmentId]);

  useEffect(() => {
    if (teacher) {
      GetPerformance();
    }
  }, [teacher]);

  return (
    <div>
      <RouteLayout
        state={location?.state ? { page: location?.state?.pagination } : {}}
        path={`/${schoolName}/${isFromComplete === 'true' ? `assignment/completed-assignments` : `assignment`}`}
      >
        <div className="relative">
          <HeaderMenus
            title="Assignments Details"
            menuArray={ADMIN_TOOLBAR_MENU}
            handleToolbarAction={handleToolbarAction}
          />
        </div>

        <div ref={componentRef}>
          <div className={`${isFromComplete === 'false' ? 'mt-5' : 'mt-20'}`}>
            <div className="bg-white text-right flex justify-end pt-5 pb-5">
              <div className="flex">
                <span className="rounded-full border-2 flex justify-center items-center p-2 relative bg-[#FBD4C7] h-[3px] w-[3px]" />
                <span className="mx-2 text-left">{`Does not Meet (Score: ${val.Nmeet1}% - ${val.Nmeet2}%)`}</span>
              </div>

              <div className="flex">
                <span className="rounded-full border-2 flex justify-center items-center p-2 relative bg-[#FFF8C1] h-[3px] w-[3px]" />
                <span className="mx-2 text-left">{`Approaching (Score: ${val.approching1}% - ${val.approching2}%)`}</span>
              </div>

              <div className="flex">
                <span className="rounded-full border-2 flex justify-center items-center p-2 relative bg-[#BFCDFD] h-[3px] w-[3px]" />
                <span className="mx-2 text-left">{`Meets (Score: ${val.meet1}% - ${val.meet2}%)`}</span>
              </div>

              <div className="flex">
                <span className="rounded-full border-2 flex justify-center items-center p-2 relative bg-[#DAFECA] h-[3px] w-[3px]" />
                <span className="mx-2 text-left">{`Exceeds (Score: ${val.exceed1}% - ${val.exceed2}%)`}</span>
              </div>
            </div>
            <div className="flex flex-col bg-white p-4 md:flex-row">
              <div className="flex flex-col grow md:flex-row ">
                <div className="grow flex flex-col">
                  <div className="mb-5">
                    <div className="font-bold"> Assignment Name </div>
                    <div> {`${assignmentData?.assignment_name}`}</div>
                    {/* Math Homework - Grade 1-Aug24th */}
                  </div>

                  {/* <div className="mb-5">
                    <div className="font-bold"> Page </div>
                    <div className="truncate w-[170px]">
                      {' '}
                      {assignmentData?.chapters?.map((ele: any) => `${ele.chapter_name} `) }
                      {' '}
                    </div>
                  </div> */}

                  <div className="flex">
                    <div className="mr-4 mb-4">
                      <div className="font-bold"> Teacher </div>
                      <div>{assignmentData?.teacher_name}</div>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="mr-4">
                      <div className="font-bold"> Student </div>
                      <div>
                        {' '}
                        {fName} {lName}{' '}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {isFromComplete === 'true' ||
              ['Submitted', 'Completed'].includes(assignmentData?.state) ? (
                <div className="grow box-content flex items-center h-full justify-center">
                  <div
                    style={{
                      backgroundColor: colorCode(assignmentData?.score, 'bg'),
                    }}
                    className="h-[180px] flex items-center justify-center md:text-2xl text-sm rounded p-5"
                  >
                    Score
                    <span
                      className="text-blue-100"
                      style={{
                        color: colorCode(assignmentData?.score, 'color'),
                      }}
                    >
                      &nbsp;
                      {assignmentData?.score}% (
                      {`${assignmentData?.score == null ? 0 : assignmentData?.score}`}
                      /100) &nbsp;
                    </span>
                    - {getPerformanceText(assignmentData?.score)}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col grow md:flex-row">
                <div className="grow">
                  <div className="mb-5">
                    <div className="font-bold"> Status: </div>
                    <div> {`${assignmentData?.state}`} </div>
                  </div>
                  <div className="mb-5">
                    <div className="font-bold"> Start Date </div>
                    <div>
                      {' '}
                      {`${moment(assignmentData?.start_date?.replace('Z', ''))?.format('DD-MM-YYYY')}`}{' '}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold"> End Date </div>
                    <div>
                      {' '}
                      {`${moment(assignmentData?.end_date?.replace('Z', ''))?.format('DD-MM-YYYY')}`}{' '}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="wrapperBorder mt-8">
            <Wrapper>
              <SimpleTableDx
                rows={jsonData}
                columns={columnsHeader}
                onChangeHandler={(val: string, cIndex: number) => {
                  changeColumnsHeader(val, cIndex);
                }}
                handleClearClick={() => {
                  setJsonData(jsonCopyData);
                  setColumns(columns);
                }}
                fullHeight={fullHeight}
              />
            </Wrapper>
          </div>
        </div>
      </RouteLayout>
    </div>
  );
}

export default AssignmentDetails;
