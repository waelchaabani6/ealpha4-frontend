/* eslint-disable react/jsx-one-expression-per-line */
import routes from '@constants/routes';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import toast from '@shared/toast';
import { CSVLink } from 'react-csv';
import Wrapper from '@shared/wrapper/Wrapper';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import moment from 'moment';
import SimpleTableDx from '../../../components/SimpleTableDx/index';
import { TOOLBAR_LABELS } from '../../../constants/constants';
import RouteLayout from '../../layout/routeLayout';

const printButton = () => <PrintIcon />;
const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;

const dataArray = [
  { label: 'Page', value: 'Page' },
  { label: 'Page 1', value: 'Page 1' },
  { label: 'Page 2', value: 'Page 2' },
  { label: 'Page 3', value: 'Page 3' },
];

interface Column {
  id: 'Pages' | 'Score' | 'Unattempted' | 'Wrong' | 'Correct' | 'MyScore';
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
  { id: 'Correct', label: 'Correct', minWidth: 170, align: 'right' },
  { id: 'Wrong', label: 'Incorrect', minWidth: 170, align: 'right' },
  { id: 'Unattempted', label: 'Unattempted', minWidth: 170, align: 'right' },
  { id: 'MyScore', label: 'Score', minWidth: 100, align: 'right' },
];

interface Data {
  Pages: string;
  MyScore: number;
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

function AssignmentDetails() {
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState<[]>([]);
  const [columnsHeader, setColumns] = useState(columns);
  const [assignmentData, setAssignmentData] = useState<any>({});
  const [passingStatus, setPassignStatus] = useState<any>('');
  const [jsonData, setJsonData] = useState([]);
  const [jsonCopyData, setJsonCopyData] = useState([]);
  const [fullHeight, setFullHeight] = useState(false);

  const { assignmentID, studentID } = useParams();
  const componentRef = useRef(null);

  const csvSubHeaders = ['Pages', 'Correct', 'Wrong', 'Unattempted', 'Score'];

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
  function colorCode(scoreAch: number, type: string) {
    if (scoreAch < 60) {
      return { bg: '#FCD4C6', color: '#E36B6B' }[type]; // Red
    }
    if (scoreAch >= 60 && scoreAch <= 70) {
      return { bg: '#FFF9BE', color: '#C7B551' }[type]; // Yellow
    }
    if (scoreAch > 70 && scoreAch <= 80) {
      return { bg: '#BECCFF', color: '#4B0082' }[type]; // Purple
    }
    if (scoreAch > 80) {
      return { bg: '#E5F8E2', color: '#6CA463' }[type]; // Green
    }
  }

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
                createData(
                  ele.page_name,
                  ele.score,
                  ele.unattendedCount,
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
      }
      setAssignmentData(resp);
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

  return (
    <div>
      <RouteLayout navBack={true}>
        <HeaderMenus
          title="Assignments Details 000"
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
                    backgroundColor: colorCode(assignmentData?.score, 'bg'),
                  }}
                  className="h-3/5 w-[88%] flex items-center justify-center md:text-2xl text-sm rounded"
                >
                  Score
                  <span
                    className="text-blue-100"
                    style={{ color: colorCode(assignmentData?.score, 'color') }}
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
      </RouteLayout>
    </div>
  );
}

export default AssignmentDetails;
