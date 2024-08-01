/* eslint-disable react/jsx-curly-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable operator-linebreak */
/* eslint-disable no-shadow */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable no-restricted-globals */
/* eslint-disable react/jsx-one-expression-per-line */
import routes from '@constants/routes';
// import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import { useGet } from '@shared/api/useApi';
// import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import toast from '@shared/toast';
import { CSVLink } from 'react-csv';
import Wrapper from '@shared/wrapper/Wrapper';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import moment from 'moment';
import { ScromPage } from '@constants/types';
import SimpleTableDx from '../../../components/SimpleTableDx/index';
import { TOOLBAR_LABELS } from '../../../constants/constants';
import RouteLayout from '../../layout/routeLayout';

const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;
const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;

const printButton = () => <PrintIcon />;

const dataArray = [
  { label: 'Page', value: 'Page' },
  { label: 'Page 1', value: 'Page 1' },
  { label: 'Page 2', value: 'Page 2' },
  { label: 'Page 3', value: 'Page 3' },
];

interface Column {
  id: 'page_name' | 'Score' | 'Unattempted' | 'Wrong' | 'Correct' | 'MyScore';
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
    id: 'page_name',
    label: 'Page',
    minWidth: 170,
    align: 'right',
    component: 'Dropdown',
    dataArray,
    selectedValue: '',
  },
  { id: 'Correct', label: 'Correct', minWidth: 170, align: 'right' },
  { id: 'Wrong', label: 'Incorrect', minWidth: 170, align: 'right' },
  { id: 'Unattempted', label: 'Unattempted', minWidth: 170, align: 'right' },
  { id: 'MyScore', label: 'Score', minWidth: 100, align: 'right' },
];

interface Data {
  Pages: string;
  page_name: string;
  MyScore: number;
  Unattempted: number;
  Wrong: number;
  Correct: number;
  pageNumber: string;
  scormDataView: any;
  total_pages: number;
}

function createData(
  Pages: string,
  page_name: string,
  Score: number,
  Unattempted: number,
  Wrong: number,
  Correct: number,
  maxScore: number,
  pageNumber: string,
  scormData: any,
  total_pages: number
): Data {
  const MyScore: any =
    Score === 0
      ? `0%`
      : // : `${parseFloat(((Number(Correct) * 100) / Number(maxScore)).toFixed(2))}%`;
        `${parseFloat(((Number(Correct / total_pages) * 100) / Number(maxScore)).toFixed(2))}%`;
  const scormDataView = scormData ? JSON.parse(scormData) : {};
  return {
    Pages,
    page_name,
    Unattempted,
    Wrong,
    Correct,
    MyScore,
    pageNumber,
    scormDataView,
    total_pages,
  };
}

function AssignmentDetails() {
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState<[]>([]);
  const [columnsHeader, setColumns] = useState(columns);
  const [assignmentData, setAssignmentData] = useState<any>({});
  const [passingStatus, setPassignStatus] = useState<any>('');
  const [jsonData, setJsonData] = useState([]);
  const [jsonCopyData, setJsonCopyData] = useState([]);
  const [fullHeight, setFullHeight] = useState(false);
  const [teacher, setTeacher] = useState('');

  const [singlePages, setSinglePages] = useState<ScromPage[]>([]);
  const [copysinglePages, setCopySinglePages] = useState<ScromPage[]>([]);

  const [val, setValue] = useState({
    Nmeet1: '',
    Nmeet2: '',
    exceed1: '',
    exceed2: '',
    meet1: '',
    meet2: '',
    approching1: '',
    approching2: '',
  });

  const { assignmentID, studentID } = useParams();
  const componentRef = useRef(null);

  const csvSubHeaders = ['Pages', 'Correct', 'Wrong', 'Unattempted', 'Score'];

  const changeColumnsHeader = (val: string, cIndex: number) => {
    const columnsHeader2 = columnsHeader.map((ele, index) => {
      if (ele.component === 'Dropdown' && cIndex === index) {
        setJsonData(jsonCopyData.filter((page: any) => page.Pages === val));
        setSinglePages(
          copysinglePages.filter((page: any) => page.page_name === val)
        );
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
      fetchEmailApi();
    }
  };

  // Toolbar Email
  const {
    isLoading: emailLoaded,
    refetch: fetchEmailApi,
    isRefetching: refetchEmail,
  } = useGet({
    baseURL,
    url: `assignments-service/student/assignment-report/pdf-download/?assign_assignment_id=${studentID}`,
    onSuccess: (response: any) => {
      toast(
        'success',
        response?.data?.message ||
          'Email sent successfully to you, please check your inbox'
      );
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
    enabled: false,
  });

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: emailLoaded || refetchEmail ? <Loader size={20} /> : <EmailIcon />,
    // },
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

  // eslint-disable-next-line consistent-return
  // function colorCode(scoreAch: number, type: string) {
  //   if (scoreAch < 60) {
  //     return { bg: '#FCD4C6', color: '#E36B6B' }[type]; // Red
  //   }
  //   if (scoreAch >= 60 && scoreAch <= 70) {
  //     return { bg: '#FFF9BE', color: '#C7B551' }[type]; // Yellow
  //   }
  //   if (scoreAch > 70 && scoreAch <= 80) {
  //     return { bg: '#BECCFF00', color: '#4B0082' }[type]; // Purple
  //   }
  //   if (scoreAch > 80) {
  //     return { bg: '#BECCFF', color: '#6CA463' }[type]; // Green
  //   }
  // }

  // eslint-disable-next-line consistent-return
  function colorCode(score: any, type: string) {
    if (score !== null && !isNaN(score)) {
      if (score >= val.exceed1 && score <= val.exceed2) {
        // Exceeds
        return { bg: '#beccff', color: '#132E90 ' }[type];
      }
      if (score >= val.meet1 && score <= val.meet2) {
        /// Meets
        return { bg: '#d9ffc8', color: '#6CA463' }[type];
      }
      if (score >= val.approching1 && score <= val.approching2) {
        // Approaching
        return { bg: '#FFF9BE', color: '#C7B551' }[type];
      }
      if (score >= val.Nmeet1 && score <= val.Nmeet2) {
        // Does not Meet
        return { bg: '#FCD4C6', color: '#E36B6B' }[type];
      }
    } else {
      return { bg: '#FCD4C6', color: '#E36B6B' }[type];
    }
  }

  const { isLoading: performance, refetch: GetPerformance } = useGet({
    baseURL: ReportURL,
    url: `reports-service/performance_expectation/?user_id=${teacher}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      const body: any = [];
      const fetchedRecords = resp?.slice(0, 4);
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

  function createExcellData(ele: any) {
    return [ele.Pages, ele.Correct, ele.Wrong, ele.Unattempted, ele.MyScore];
  }

  const { isLoading: childrenLoading, refetch: details } = useGet({
    baseURL,
    url: `assignments-service/assignment/student/${assignmentID}/report/`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      let jsonRespData: any = [];
      resp?.assignment_progress?.forEach((ele: any) => {
        if (ele.json_data && ele.json_data.length) {
          ele.json_data.forEach((element: any) => {
            jsonRespData.push(element);
          });
        }
      });

      if (jsonRespData && jsonRespData.length !== 0) {
        const pagesArray = jsonRespData.map((ele: any) => ({
          label: ele.page_name,
          value: ele.page_name,
        }));
        jsonRespData =
          jsonRespData && jsonRespData.length !== 0
            ? jsonRespData.map((ele: any) =>
                // eslint-disable-next-line implicit-arrow-linebreak
                createData(
                  ele.page_name,
                  ele.page_name,
                  ele.score,
                  ele.unattendedCount,
                  ele.mistake_count,
                  ele.absolute_score,
                  ele.max_score,
                  ele?.page_number,
                  ele?.scormData,
                  jsonRespData.length
                )
              )
            : [];
        setJsonData(jsonRespData);
        setJsonCopyData(jsonRespData);
        if (jsonRespData && jsonRespData.length !== 0) {
          setCsvData(jsonRespData.map((ele: any) => createExcellData(ele)));
        }

        // const columnsHeader2 = columnsHeader.map((ele) => {
        //   if (ele.component === 'Dropdown') {
        //     return { ...ele, dataArray: pagesArray };
        //   }
        //   return ele;
        // });
        // setColumns(columnsHeader2);
      }

      const tempArray: any = [];
      const pagesList: any = [];
      if (res?.data?.response?.chapters) {
        res?.data?.response?.chapters?.forEach((chapter: any) => {
          chapter?.lessons?.forEach((lesson: any) => {
            const pageNumberArray: string[] = [];
            const pageNameArray: string[] = [];
            if (lesson?.pages.length > 0) {
              lesson?.pages?.forEach(
                ({
                  name,
                  page_number,
                }: {
                  name: string;
                  page_number: string;
                }) => {
                  pageNumberArray.push(page_number);
                  pageNameArray.push(name);

                  pagesList.push({
                    label: `${lesson.unit_name} - ${name}`,
                    value: `${lesson.unit_name}`,
                  });

                  jsonRespData.forEach((ele: any) => {
                    const tempObj = ele;
                    if (
                      ele?.scormDataView.urlLessonId === lesson?.unit_id &&
                      ele?.Pages === name
                    ) {
                      tempObj.page_name = `${lesson.unit_name} - ${ele.Pages}`;
                      tempArray.push(tempObj);
                    } else if (ele?.scormDataView.urlLessonId === undefined) {
                      tempObj.page_name = `${ele.Pages}`;
                      tempArray.push(tempObj);
                    }
                  });
                }
              );
            }

            const pagesArray = singlePages.map((ele: any) => ({
              label: ele.page_name,
              value: ele.page_name,
            }));

            const columnsHeader2 = columnsHeader.map((ele) => {
              if (ele.component === 'Dropdown') {
                return { ...ele, dataArray: pagesArray };
              }
              return ele;
            });

            setColumns(columnsHeader2);
          });
        });
      }

      setSinglePages(tempArray.length !== 0 ? tempArray : jsonRespData);
      setCopySinglePages(tempArray.length !== 0 ? tempArray : jsonRespData);

      const pagesListprev: any = [];
      tempArray.forEach((ele: any) => {
        pagesListprev.push({
          label: ele.page_name,
          value: ele.page_name,
          ...ele,
        });
      });

      setAssignmentData(resp);
      setTeacher(resp?.teacher);
    },
    onError: () => {},
  });

  const Status = () => {
    if (assignmentData?.score <= 60) {
      setPassignStatus('Does Not Meet');
    } else if (assignmentData?.score > 60 && assignmentData?.score < 70) {
      setPassignStatus('Approching');
    } else if (assignmentData?.score >= 70 && assignmentData?.score <= 80) {
      setPassignStatus('Meets');
    } else if (assignmentData?.score >= 80) {
      setPassignStatus('Exceeds');
    }
  };

  useEffect(() => {
    details();
  }, [assignmentData]);

  useEffect(() => {
    Status();
  }, [assignmentData]);

  useEffect(() => {
    if (teacher) {
      GetPerformance();
    }
  }, [teacher]);

  return (
    <div>
      <RouteLayout navBack={true}>
        <HeaderMenus
          title="Assignments Details"
          menuArray={ADMIN_TOOLBAR_MENU}
          handleToolbarAction={handleToolbarAction}
        />
        <div className="flex flex-col bg-white p-4 mt-5 md:flex-row w-full justify-evenly">
          <div className="flex flex-col md:flex-row w-full">
            <div className="w-full flex flex-col md:border-r md:border-r-gray-300 pr-[5%]">
              <div className="mb-5">
                <div className="font-bold">Assignment Name</div>
                <div>{assignmentData?.assignment_name}</div>
              </div>

              <div className="mb-5">
                <div className="font-bold"> Lesson Name </div>
                <p>
                  {' '}
                  {assignmentData.lesson_name &&
                  assignmentData?.lesson_name.length >= 50
                    ? `${assignmentData?.lesson_name.slice(0, 50)}...`
                    : assignmentData?.lesson_name}{' '}
                </p>
              </div>
              <div className="flex">
                <div className="pr-4 mb-4">
                  <div className="font-bold"> Teacher </div>
                  <div>{assignmentData?.teacher_name}</div>
                </div>
              </div>
              <div className="flex">
                <div className="pr-4">
                  <div className="font-bold"> Student </div>
                  <div>
                    {`${assignmentData?.first_name !== null ? assignmentData?.first_name : ''}  ${assignmentData?.last_name !== null ? assignmentData?.last_name : ''}`}{' '}
                  </div>
                </div>
                {/* <div>
                  <div className="font-bold"> Student </div>
                  <div>
                    {`${assignmentData?.first_name !== null ? assignmentData?.first_name : ''}  ${assignmentData?.last_name !== null ? assignmentData?.last_name : ''}`}
                    {' '}
                  </div>
                </div> */}
              </div>
            </div>

            <div className="w-full flex flex-col md:flex-row md:border-r justify-evenly md:border-r-gray-300">
              <div className="box-content flex items-center h-full justify-center min-w-[400px]">
                <div
                  style={{
                    backgroundColor: colorCode(
                      parseInt(assignmentData?.score, 10),
                      'bg'
                    ),
                  }}
                  className="h-3/5 w-[88%] flex items-center justify-center md:text-2xl text-sm rounded"
                >
                  Score
                  <span
                    className="text-blue-100"
                    style={{
                      color: colorCode(
                        parseInt(assignmentData?.score, 10),
                        'color'
                      ),
                    }}
                  >
                    &nbsp;
                    {assignmentData?.score !== null ? assignmentData?.score : 0}
                    %
                  </span>
                  - {passingStatus || 'Does Not Meet'}
                </div>
              </div>
            </div>

            <div className="w-full md:ml-[5%]">
              <div className="mb-5">
                <div className="font-bold">
                  {' '}
                  State: {assignmentData?.state}{' '}
                </div>
                <div>
                  {' '}
                  {assignmentData?.start_date
                    ? moment(assignmentData?.start_date).format('DD-MM-YYYY')
                    : ''}{' '}
                </div>
              </div>
              <div className="mb-5">
                <div className="font-bold"> Start Date </div>
                <div>
                  {' '}
                  {assignmentData?.start_date
                    ? moment(assignmentData?.start_date).format('DD-MM-YYYY')
                    : ''}{' '}
                </div>
              </div>
              <div>
                <div className="font-bold"> End Date </div>
                <div>
                  {assignmentData?.end_date
                    ? moment(assignmentData?.end_date).format('DD-MM-YYYY')
                    : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="wrapperBorder mt-8" ref={componentRef}>
          <Wrapper>
            <SimpleTableDx
              // rows={jsonData}
              rows={singlePages}
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
      </RouteLayout>
    </div>
  );
}

export default AssignmentDetails;
