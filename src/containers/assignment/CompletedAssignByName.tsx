/* eslint-disable react/jsx-curly-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Button from '@component/button/button';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Dropdown from '@component/dropdown/Dropdown';
import { CustomInput } from '@component/input';
import DebounceInput from '@component/input/DebounceInput';
import routes from '@constants/routes';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
// import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import { useGet, usePatch } from '@shared/api/useApi';
// import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import { getNoOfPages } from '@utility/utility';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import UseGetProfile from '@utility/Hooks/UseGetProfile';
import DatePicker from '@component/datepicker';
import {
  COMPONENTS,
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  TOOLBAR_LABELS,
} from '../../constants/constants';
import Wrapper from '../../shared/wrapper/Wrapper';
import RouteLayout from '../layout/routeLayout';

const printButton = () => <PrintIcon />;
const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;

const stateChange: any = {
  'Mark as Ongoing': 'Ongoing',
  'Mark As Complete': 'Completed',
};

export default function CompletedAssignByName() {
  const navigate = useNavigate();
  const location = useLocation();
  // const { schoolName } = useParams();
  const {
    user_profile_id: teacherId,
    first_name: teacherFirstName,
    last_name: teacherLastName,
    schoolId,
  } = useSelector(selectUser);
  const assignmentId = location?.state?.assignmentId;
  const assignmentName = location?.state?.assignmentName;
  const endData = location?.state?.endData;
  const startDate = location?.state?.startDate;
  const grade = location?.state?.grade;
  const isFromComplete = location?.state?.isFromComplete;
  const { getUser } = UseGetProfile();
  const [extendedDeuData, setExtendedDeuData] = useState<Date>();
  const [ErrorMsg, setErrorMsg] = useState('');

  const headers = ['Student Name', 'State', 'Start Date', 'Score %'];

  const [csvData, setCsvData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [tableDataCopy, setTableDataCopy] = useState<any>([]);
  // const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [selectedId, setSelectedId] = useState({});

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
    },
    {
      label: 'Select',
      mapper: 'Select',
      component: COMPONENTS?.checkbox,
      selector: 'studentId',
      showInHeader: true,
      sx: {
        display: 'flex',
        alignItems: 'center',
      },
      cellSx: {
        justifyContent: 'flex-start',
        position: 'relative',
        left: '0px',
      },
      elementClass: 'flex items-center',
    },
    {
      label: TABLE_LABELS?.STUDENT_NAME,
      mapper: 'StudentName',
    },
    {
      label: TABLE_LABELS?.STATUS,
      mapper: 'State',
    },
    {
      label: TABLE_LABELS?.START_DATE,
      mapper: 'StartDate',
      format: 'DD-MM-YYYY',
    },
    {
      label: TABLE_LABELS?.DUE_DATE,
      mapper: 'EndDate',
      format: 'DD-MM-YYYY',
    },
    {
      label: TABLE_LABELS?.SCORE,
      align: 'center',
      mapper: 'score',
    },
    {
      label: TABLE_LABELS?.REMARK,
      align: 'center',
      mapper: 'remark',
    },
    {
      label: TABLE_LABELS?.ACTION,
      align: 'center',
      mapper: 'Action',
      // component: COMPONENTS?.edit,
      // showInHeader: false,
    },
  ];

  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);

  // const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  // const [fromDate, setFromDate] = useState<any>();
  // const [toDate, setToDate] = useState<any>();
  const [remarkName, setRemark] = useState<any>('');
  const [markAssignment, setMarkAssignment] = useState<any>(false);
  const [modState, selectedModState] = useState<any>('');
  const [assignmentData, setAssignmentData] = useState<any>({});
  const [searchVal, setSearchVal] = useState('');

  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [isBulk, setIsBulk] = useState(false);

  useEffect(() => {
    const locationData = location.pathname;
    setAssignmentData({
      assignmentId,
      assignmentName,
      fromData: startDate,
      toDate: endData,
      grade,
    });
    if (endData) {
      setExtendedDeuData(new Date(endData));
    }
  }, []);

  const {
    isFetching: studentListFetching,
    refetch: fetchRecords,
    isLoading: studentListLoading,
  } = useGet({
    baseURL,
    url: `assignments-service/assignment/assigned-students/${assignmentData.assignmentId}/list/?&offset=${(page - 1) * Number(rowsPerPage)}&search=${searchVal}&limit=10`,
    onSuccess: (res: any) => {
      let accData = res?.data?.response?.results;
      const csvEleData = accData.map((stud: any) => [
        `${stud.first_name} ${stud.last_name}`,
        stud.state,
        stud.start_date,
        stud.score,
      ]);
      setCsvData(csvEleData);
      if (accData.length) {
        setExtendedDeuData(new Date(accData[0]?.end_date));
        accData = accData.map((ele: any) => {
          const schoolNameInURL = decodeURIComponent(
            location.pathname.split('/')[1]
          );

          const link = `/${schoolNameInURL}/assignment/assignment-details/${ele.id}/${assignmentData.assignmentId}/${isFromComplete}`;

          return {
            ogState: ele.state,
            id: ele.id,
            StudentName: (
              <Link to={link}>
                <span
                  role="alert"
                  className="text-accent underline cursor-pointer font-medium"
                >
                  {ele.first_name}
                  &nbsp;
                  {ele.last_name}
                </span>
              </Link>
            ),
            State: (
              <span
                role="alert"
                className={ele.state === 'Submitted' ? 'text-accent' : ''}
                // onClick={() => {
                //   setSelectedId(ele.id);
                //   setMarkAssignment(true);
                //   setErrorMsg('');
                // }}
              >
                {ele.state}
              </span>
            ),
            StartDate: moment(ele.start_date.replace('Z', '')).format(
              'YYYY-MM-DD'
            ),
            EndDate: moment(ele.end_date.replace('Z', '')).format('YYYY-MM-DD'),
            score: ele.score,
            remark: ele.remark,
            studentId: ele.student_id,
            searchString: `${ele.first_name} ${ele.last_name}`,
            Action: (
              <Button
                onClick={() => {
                  setSelectedId(ele.id);
                  setMarkAssignment(true);
                  setErrorMsg('');
                  setRemark(ele?.remark);
                  setIsBulk(false);
                }}
              >
                Edit
              </Button>
            ),
          };
        });
      }
      setTotalDataCount(res?.data?.response?.count);
      setTableData(accData);
      setTableDataCopy(accData);
    },
    onError: ({ response }: any) => {},
    enabled: false,
  });

  useEffect(() => {
    if (assignmentData.assignmentId !== undefined) {
      fetchRecords();
    }
  }, [assignmentData, page, searchVal]);

  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const componentRef = useRef(null);

  const handelSendEmail = () => {
    sendEmail();
  };

  const { isRefetching: emailSendLoading, refetch: sendEmail } = useGet({
    baseURL,
    url: `assignments-service/pdf-download-1/?school_id=${schoolId}&user_id=${teacherId}`,
    onSuccess: () => {
      toast('success', 'Email sent successfully');
    },
    retry: false,
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Unable to send email');
    },
    enabled: false,
  }) as any;

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: emailSendLoading ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="School Management List.csv"
          data={csvData}
          headers={headers}
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
        />
      ),
    },
  ];

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD_NEW_SCHOOL) {
      navigate(routes?.SCHOOL_MANAGEMENT__ADD);
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      // importData();s
    }
  };

  // Update:
  const { isLoading: updateLoading, mutate: updateStatus } = usePatch({
    baseURL,
    url: `assignments-service/assignments/teacher/${selectedId}/change-status/`,
    onSuccess: ({ response }: any) => {
      setMarkAssignment(false);
      fetchRecords();
    },
    onError: ({ response }: any) => {},
  });

  const { isLoading: updateBulkLoading, mutate: updateBulkStatus } = usePatch({
    baseURL,
    url: `assignments-service/assignments/bulk-update/${assignmentData.assignmentId}/`,
    onSuccess: ({ response }: any) => {
      setMarkAssignment(false);
      fetchRecords();
    },
    onError: ({ response }: any) => {},
  });

  const statusChange = () => {
    const selectedRec = tableData.find(
      (ele: { id: string }) => ele.id === selectedId
    );
    const passObj: any = { state: stateChange[modState] };

    const studentIds = [];
    bulkSelect.forEach((item: any) => {
      studentIds.push(Number(item));
    });

    if (isBulk) {
      // passObj.students = bulkSelect;
      // console.log(studentIds, 'studentIds');
      passObj.students = studentIds;
      passObj.due_date = moment(extendedDeuData).format('YYYY-MM-DD');
    } else {
      passObj.teacher_name = `${teacherFirstName} ${teacherLastName}`;
      passObj.new_end_date = moment(extendedDeuData).format('YYYY-MM-DD');
    }
    passObj.remark = remarkName;
    passObj.teacher_id = teacherId;
    const userFd = new FormData();
    // const userFd = {};

    if (!passObj.state && selectedRec?.ogState) {
      passObj.state = selectedRec.ogState;
    }
    Object.keys(passObj).forEach((key: string) => {
      if (passObj[key] !== undefined) {
        userFd.append(key, passObj[key]);
      }
    });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      modState === 'Mark as Ongoing' &&
      extendedDeuData &&
      yesterday > extendedDeuData
    ) {
      setErrorMsg('Due date should be greater than current date.');
    } else {
      if (isBulk) {
        // updateBulkStatus(userFd);
        updateBulkStatus(passObj);
      } else {
        updateStatus(userFd);
      }
      // updateStatus(userFd);
      getUser();
      setRemark('');
      selectedModState('');
      setErrorMsg('');
    }
  };

  const applySearchFilter = () => {
    const copyData = tableDataCopy.filter((ele: any) =>
      ele.searchString.startsWith(searchVal)
    );
    setTableData(copyData);
  };

  const extendedDeuDataFormat = extendedDeuData
    ? moment(extendedDeuData).format('DD-MM-YYYY')
    : '';

  const handleSelectAllClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: any,
    selector?: string
  ): any => {
    let newSchoolID: string | any[] = [];
    newSchoolID = data.map((n: any) => n[selector || 'id']);

    if (event) {
      const newDat = [...bulkSelect, ...newSchoolID];
      setBulkSelect([...new Set(newDat)]);
    } else {
      const filterArray = bulkSelect.filter(
        (item: any): any => !newSchoolID.includes(item)
      );
      setBulkSelect([...new Set(filterArray)]);
    }
  };

  const handleSelection = (params: any) => {
    setBulkSelect(params);
  };

  // console.log(bulkSelect, '#bulkSelect');
  // console.log(tableData, '#tableData');

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus
        title={assignmentData.assignmentName}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <CustomizedDialogs
        title="Mark Assignment"
        open={markAssignment}
        setOpen={() => {
          selectedModState('');
        }}
        onclose={() => {
          setMarkAssignment(false);
          setIsBulk(false);
        }}
        maxwidth="sm"
      >
        <div className="w-full flex justify-center flex-col">
          <div>
            <DatePicker
              // @ts-ignore
              disablePast={
                assignmentData?.start_date &&
                new Date(assignmentData?.start_date)
              }
              value={extendedDeuData}
              label="Update Due Date"
              handlePickerChange={(date: string) =>
                setExtendedDeuData(new Date(date))
              }
              sxType={4}
              defaultStyle={true}
              fullWidth={true}
              parentLabelClass="relative top-[-4px]"
              noFontSize={true}
            />
          </div>
          <div className="mt-4">
            <Dropdown
              dataArray={[
                {
                  label: 'Select',
                  value: 'Select',
                },
                {
                  label: 'Mark as Complete',
                  value: 'Mark As Complete',
                },
                {
                  label: 'Mark as Ongoing',
                  value: 'Mark as Ongoing',
                },
              ]}
              onChangeHandler={(val) => {
                selectedModState(val);
              }}
              value={modState}
              title="Change Status"
              sxClass={{ width: '100%', border: '1px solid #c4c4c4' }}
              IconParentClass="relative left-[7px]"
              displayEmpty={false}
            />
          </div>

          {ErrorMsg && (
            <div style={{ fontSize: '0.75rem' }} className=" text-red-400">
              {ErrorMsg}
            </div>
          )}
          <div className="relative mt-4 top-[-8px]">
            <CustomInput
              label="Remark"
              value={remarkName}
              onChange={(e: any) => setRemark(e.target.value)}
              icon={true}
              size="small"
              sx={{
                width: '100%',
                '.MuiOutlinedInput-input': {
                  fontSize: '0.75rem',
                  fontFamily: 'Montserrat-500',
                  color: 'black',
                },
              }}
              parentLabelClass="relative top-[6px]"
            />
          </div>
          <div className="flex justify-center mt-5">
            <Button onClick={statusChange}>Update</Button>
          </div>
        </div>
      </CustomizedDialogs>

      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <DebounceInput onChange={(val) => setSearchVal(val)} />
          <div>
            <div className="text-sm"> From Date </div>
            <div className="border rounded border-gray-300 p-1 mt-3 text-sm w-32 h-8">
              {assignmentData.fromData
                ? moment(assignmentData.fromData).format('DD-MM-YYYY')
                : ''}
            </div>
          </div>
          <div>
            <div className="text-sm"> To Date </div>
            <div className="border rounded border-gray-300 p-1 mt-3 text-sm w-32 h-8">
              {extendedDeuDataFormat ||
                (assignmentData.toDate
                  ? moment(assignmentData.toDate).format('DD-MM-YYYY')
                  : '')}
            </div>
          </div>

          <div>
            <div className="text-sm"> Class </div>
            <div className="border rounded border-gray-300 p-1 mt-3 text-sm  h-8 w-32">
              {assignmentData.grade || ``}
            </div>
          </div>

          <div className="flex justify-center mt-5">
            <Button
              onClick={() => {
                setMarkAssignment(true);
                setErrorMsg('');
                setIsBulk(true);
              }}
              disabled={!bulkSelect.length}
            >
              Bulk Update
            </Button>
          </div>
        </div>
      </div>
      {/* Table Section */}
      <div className="wrapperBorder mt-3" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
            tableData={tableData}
            headerRows={TableColumns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            bulkSelect={bulkSelect}
            setBulkSelect={handleSelection}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            isLoading={studentListFetching || studentListLoading}
          />
        </Wrapper>
      </div>
    </RouteLayout>
  );
}
