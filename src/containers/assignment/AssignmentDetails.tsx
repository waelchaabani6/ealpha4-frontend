/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-curly-newline */
/* eslint-disable no-console */
/* eslint-disable no-confusing-arrow */
/* eslint-disable comma-dangle */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable indent */
/* eslint-disable consistent-return */
/* eslint-disable operator-linebreak */
/* eslint-disable radix */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable no-restricted-globals */
import Button from '@component/button/button';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Dropdown from '@component/dropdown/Dropdown';
import { CustomInput } from '@component/input';
import routes from '@constants/routes';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import AttachIcon from '@mui/icons-material/AttachFile';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import { useGet, usePatch } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { TOOLBAR_LABELS } from '@constants/constants';
import RouteLayout from '@layout/routeLayout';
import SimpleTableDx from '@component/SimpleTableDx';
import DatePicker from '@component/datepicker';
import UseGetProfile from '@utility/Hooks/UseGetProfile';
import { useOnClickOutside } from '@shared/useOnClickOutside';

const stateChange: any = {
  'Mark as Ongoing': 'Ongoing',
  'Mark As Complete': 'Completed',
};

type accDataType = {
  label: string;
  value: string;
  id: null | number;
};

const SELECT: accDataType = {
  label: 'Select',
  value: 'Select',
  id: null,
};

const printButton = () => <PrintIcon />;
const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;

const dataArray: any = [];

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
interface ScromPage {
  label: string;
  value: string;
  pageName?: string;
  pageNumber?: string;
  chapter_id?: string;
  chapterMainId?: string;
  chapter_name?: string;
  lessonUnitName?: string;
  course_id?: string;
  course_table_id?: number;
  id?: string | null;
  contentUrl?: string;
  moduleName?: string;
  lessonId?: string;
  urlLessonId?: string;
  courseId?: string;
  assignmentId?: string;
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

function AssignmentDetails() {
  const navigate = useNavigate();
  const params = useParams();
  const {
    assignId: assignStudentId,
    assignedStudentsList: assignedMainId,
    isFromComplete,
    schoolName,
  } = params;

  const [csvData, setCsvData] = useState<[]>([]);
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [columnsHeader, setColumns] = useState(columns);
  const [columnsHeaderCopy, setColumnsCopy] = useState(columns);
  const [assignmentData, setAssignmentData] = useState<any>({});
  const [studentList, setStudentList] = useState<accDataType[]>([]);
  const [selectedStudentName, setSelectedStudentName] = useState<any>('');
  const [markStatusChange, setMarkStatusChange] = useState(false);
  const [modState, selectedModState] = useState('');
  const teacherData = useSelector(selectUser);
  const {
    first_name: fName,
    last_name: lName,
    user_profile_id: teacherId,
    schoolId,
  } = teacherData;
  const [jsonData, setJsonData] = useState([]);
  const [jsonCopyData, setJsonCopyData] = useState([]);
  const [AttachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [assignReportId, setAssignReportId] = useState('');

  const [teacherDownloadLink, setTeacherDownloadLink] = useState('');
  const [studentDownloadLink, setStudentDownloadLink] = useState('');
  const [remark, setRemark] = useState('');
  const [scromPages, setScromPages] = useState<ScromPage[]>([]);
  const [selectedScromPage, setSelectedScromPage] = useState<string>('');
  const [scromState, setScromState] = useState<any>();
  const [showSelectPageError, setshowSelectPageError] = useState(false);
  const { getUser } = UseGetProfile();
  const [extendedDeuData, setExtendedDeuData] = useState<Date>();
  const [ErrorMsg, setErrorMsg] = useState('');
  const [fullHeight, setFullHeight] = useState(false);
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
  const [teacher, setTeacher] = useState('');
  const componentRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    if (studentList.length !== 0) {
      const obj: any = studentList.filter(
        (ele: { id: any }) => Number(ele.id) === Number(assignStudentId)
      )[0];
      setSelectedStudentName(obj.label);
      setAssignReportId(`${obj.id}`);
    }
  }, [studentList]);

  const handelSendEmail = () => {
    sendEmail();
  };

  const { isRefetching: emailSendLoading, refetch: sendEmail } = useGet({
    baseURL,
    url: `assignments-service/student/assignment-report/pdf-download/?assign_assignment_id=${assignStudentId}`,
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
    {
      title: TOOLBAR_LABELS.ATTACH,
      icon: <AttachIcon />,
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
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: emailSendLoading ? <Loader /> : <EmailIcon />,
    // },
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

  const changeColumnsHeader = (val: string, cIndex: number) => {
    const columnsHeader2 = columnsHeader.map((ele, index) => {
      if (ele.component === 'Dropdown' && cIndex === index) {
        setJsonData(jsonCopyData.filter((page: any) => page.Pages === val));
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
    } else if (title === TOOLBAR_LABELS.ATTACH) {
      setAttachmentMenuVisible((prevVal: boolean) => !prevVal);
    }
  };

  const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;

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

  useEffect(() => {
    if (teacher) {
      GetPerformance();
    }
  }, [teacher]);

  function colorCode(score: any, type: string) {
    if (score !== null && !isNaN(score)) {
      if (score >= val.exceed1 && score <= val.exceed2) {
        // Exceeds
        return { bg: '#E5F8E2', color: '#6CA463' }[type];
      }
      if (score >= val.meet1 && score <= val.meet2) {
        /// Meets
        return { bg: '#BECCFF', color: '#132E90 ' }[type];
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

  function getPerformanceText(score: any) {
    console.log(val, 'val');
    if (score >= val.exceed1 && score <= val.exceed2) {
      return 'Exceeds';
    }
    if (score >= val.meet1 && score <= val.meet2) {
      return 'Meets';
    }
    if (score >= val.approching1 && score <= val.approching2) {
      return 'Approaching';
    }
    if (
      (score >= val.Nmeet1 && score <= val.Nmeet2) ||
      score == null ||
      isNaN(score)
    ) {
      return 'Does not Meet';
    }
  }

  const {
    isLoading: studentAssignmentPagesLoading,
    refetch: refetchJsonData,
  }: any = useGet({
    baseURL,
    url: `assignments-service/assignment/student/${assignReportId}/report/`,
    queryKey: [assignReportId],
    onSuccess: (res: any) => {
      const results = res?.data?.response;
      setAssignmentData(results);
      setTeacher(results?.teacher);
      if (results?.end_date) {
        setExtendedDeuData(new Date(results?.end_date));
      }
      setTeacherDownloadLink(results?.assignment_files[0]?.files);
      setStudentDownloadLink(results?.student_assignment_files[0]?.files);
      let jsonRespData: any = [];
      res?.data?.response?.assignment_progress?.forEach((ele: any) => {
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
        setColumnsCopy(columnsHeader2);
      }
      const scromPagesTemp: ScromPage[] = [];
      if (res?.data?.response?.chapters) {
        const assignmentMainList = res?.data?.response;
        res?.data?.response?.chapters?.forEach((chapter: any) => {
          chapter?.lessons?.forEach((lesson: any) => {
            const pageNumberArray: string[] = [];
            const pageNameArray: string[] = [];
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
              }
            );
            scromPagesTemp.push({
              label: `${lesson.unit_name}`,
              value: `${lesson.unit_name}`,
              pageName: JSON.stringify(pageNameArray),
              pageNumber: pageNumberArray.join(','),
              chapter_id: chapter.chapter_id,
              chapterMainId: chapter.id,
              chapter_name: chapter?.chapter_name.substring(0, 50),
              lessonId: lesson.id,
              urlLessonId: lesson.unit_id,
              lessonUnitName: lesson.unit_name,
              courseId: assignmentMainList.course_id,
              course_table_id: assignmentMainList.course_table_id,
              assignmentId: assignmentMainList.id,
              contentUrl: lesson.content_url,
              moduleName: 'assignment',
            });
            if (lesson?.pages.length === 0) {
              scromPagesTemp.push({
                label: `${lesson.unit_name}`,
                value: `${lesson.unit_name}`,
                pageName: `${lesson.unit_name}`,
                pageNumber: '-1',
                chapter_id: chapter.chapter_id,
                chapterMainId: chapter.id,
                chapter_name: chapter?.chapter_name.substring(0, 50),
                lessonId: lesson.id,
                urlLessonId: lesson.unit_id,
                lessonUnitName: lesson.unit_name,
                courseId: assignmentMainList.course_id,
                course_table_id: assignmentMainList.course_table_id,
                assignmentId: assignmentMainList.id,
                contentUrl: lesson.content_url,
                moduleName: 'assignment',
              });
            }
          });
        });
        scromPagesTemp.sort((a, b) =>
          a.label > b.label ? 1 : b.label > a.label ? -1 : 0
        );
        setScromPages([
          { label: 'Select', value: 'Select', id: null },
          ...scromPagesTemp,
        ]);
      }
    },
    enabled: !!assignReportId,
    onError: ({ response }: any) => {},
    cacheTime: 0,
  });

  const { isFetching: studentListPending, refetch: fetchRecords } = useGet({
    baseURL,
    url: `assignments-service/assignment/assigned-students/${assignedMainId}/list/?limit=1000`,
    onSuccess: (res: any) => {
      const accData = res?.data?.response?.results;
      const studentData = accData.map((ele: any) => ({
        label: `${ele.first_name} ${ele.last_name}`,
        value: `${ele.first_name} ${ele.last_name}`,
        id: ele.id,
      }));
      setStudentList([SELECT, ...studentData]);
    },
    onError: ({ response }: any) => {},
    enabled: false,
  });

  useEffect(() => {
    fetchRecords();
  }, [assignedMainId]);

  const { isLoading: updateLoading, mutate: updateStatus } = usePatch({
    baseURL,
    url: `assignments-service/assignments/teacher/${assignReportId}/change-status/`,
    onSuccess: ({ response }: any) => {
      setMarkStatusChange(false);
      refetchJsonData();
    },
    onError: ({ response }: any) => {},
  });

  const statusChange = () => {
    const passObj: any = { state: stateChange[modState] };
    passObj.remark = remark;
    passObj.teacher_name = `${fName} ${lName}`;
    passObj.teacher_id = teacherId;
    passObj.new_end_date = moment(extendedDeuData).format('YYYY-MM-DD');
    const userFd = new FormData();
    if (!passObj.state && assignmentData?.state) {
      passObj.state = assignmentData?.state;
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
      updateStatus(userFd);
      getUser();
      setRemark('');
      selectedModState('');
      setErrorMsg('');
    }
  };

  const handleTeacherDownLoadClick = () => {
    downloadLink(teacherDownloadLink);
  };

  const handleStudentDownLoadClick = () => {
    downloadLink(studentDownloadLink);
  };

  const downloadLink = (fileUrl: any) => {
    fetch(fileUrl, {
      method: 'GET',
      headers: {},
    })
      .then((response) => {
        response.blob().then((blob) => {
          const url = window.URL.createObjectURL(blob);
          // const fileName = fileUrl.split('/')[fileUrl.split('/').length - 1];
          const fileName = response.url.split('?')[0];

          const link = document.createElement('a');
          link.href = fileName;
          link.target = '_blank';
          link.setAttribute('download', '');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // window.URL.revokeObjectURL(url);
        });
      })
      .catch((err) => {
        console.error('Error downloading file:', err);
      });
  };

  const onPreviewClick = () => {
    if (selectedScromPage === '' || scromState?.id === null) {
      setshowSelectPageError(true);
    } else {
      navigatToPreview(scromState);
    }
  };

  const navigatToPreview = (state: any) => {
    navigate(`/${schoolName}/course-preview`, {
      state,
    });
  };

  useOnClickOutside(ref, () => {
    setAttachmentMenuVisible(false);
  });

  return (
    <div>
      <RouteLayout>
        <div className="relative">
          <HeaderMenus
            title="Assignment Details"
            menuArray={ADMIN_TOOLBAR_MENU}
            handleToolbarAction={handleToolbarAction}
          />
          {AttachmentMenuVisible === true ? (
            <div
              ref={ref}
              className={`absolute right-[150px] top-[65px] bg-white p-2 z-10 border ${!AttachmentMenuVisible ? 'opacity-0' : ''}`}
            >
              {teacherDownloadLink && (
                <div
                  className="h-10 cursor-pointer flex items-center"
                  onClick={() => handleTeacherDownLoadClick()}
                >
                  View Teacher Attachment
                </div>
              )}
              {studentDownloadLink && (
                <div
                  className="h-10 cursor-pointer flex items-center"
                  onClick={() => handleStudentDownLoadClick()}
                >
                  View Student Attachment
                </div>
              )}
              {!teacherDownloadLink && !studentDownloadLink && (
                <div> Attachment not found </div>
              )}
            </div>
          ) : null}
        </div>

        <CustomizedDialogs
          title="Mark Assignment"
          open={markStatusChange}
          setOpen={() => {}}
          onclose={() => {
            setMarkStatusChange(false);
          }}
          maxwidth="sm"
        >
          <div className="w-full flex justify-center flex-col">
            <div className="my-4">
              <DatePicker
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
            <div>
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
                sxClass={{
                  width: '100%',
                  marginRight: '5px',
                  border: '1px solid #c4c4c4',
                }}
                displayEmpty={false}
                labelParentClass="relative top-[-1px]"
                IconParentClass="relative left-[7px]"
              />
            </div>
            {ErrorMsg && (
              <div style={{ fontSize: '0.75rem' }} className="text-red-400">
                {ErrorMsg}
              </div>
            )}
            <div className="mt-2">
              <CustomInput
                label="Remark"
                value={remark}
                onChange={(e: any) => setRemark(e.target.value)}
                icon={true}
                sx={{
                  width: '100%',
                  '.MuiOutlinedInput-input': {
                    fontSize: '0.75rem',
                    fontFamily: 'Montserrat-500',
                    color: 'black',
                    padding: '8.5px 0px 8.5px 14px',
                  },
                }}
                parentLabelClass="relative top-[4px]"
              />
            </div>
            <div className="flex justify-center mt-5">
              <Button onClick={statusChange}>Update</Button>
            </div>
          </div>
        </CustomizedDialogs>
        <div className="flex mt-2">
          {isFromComplete === 'false' ? (
            <>
              <Dropdown
                title="Select Students"
                value={selectedStudentName || ''}
                dataArray={studentList}
                onChangeHandler={(val: any) => {
                  const obj: any = studentList.filter(
                    (ele: { label: any }) => ele.label === val
                  )[0];
                  if (obj.id !== null) {
                    setSelectedStudentName(obj.value);
                    setAssignReportId(`${obj.id}`);
                  } else {
                    setAssignReportId('');
                    setSelectedStudentName('Select');
                    setAssignmentData(undefined);
                    setJsonData([]);
                    setJsonCopyData([]);
                  }
                }}
                displayEmpty={false}
                parentStyle="mr-5 "
                sxClass={{
                  width: '206px',
                  marginRight: '5px',
                  paddingRight: 'unset',
                }}
              />

              <div>
                <div className="text-[0.75rem]">Status</div>
                <Button
                  sx={{ height: '32px' }}
                  className="relative top-[10px]"
                  onClick={() => {
                    setMarkStatusChange(true);
                    setErrorMsg('');
                  }}
                >
                  Modify Status
                </Button>
              </div>
            </>
          ) : null}

          <div className="flex-1" />
          <div className="flex">
            <div className="relative">
              <Dropdown
                dataArray={scromPages}
                onChangeHandler={(val) => {
                  setSelectedScromPage(val);
                  const tempScromPage = scromPages.filter(
                    (scrom) => scrom.label === val
                  );
                  if (tempScromPage && tempScromPage.length) {
                    setScromState(tempScromPage[0]);
                    setshowSelectPageError(false);
                  }
                }}
                value={selectedScromPage}
                title="Select Page"
                sxClass={{ width: '206px', marginRight: '5px' }}
                displayEmpty={false}
              />
              {showSelectPageError ? (
                <div className="absolute text-red-500 text-xs whitespace-nowrap">
                  Please select pages from dropdown
                </div>
              ) : null}
            </div>
            <div className="flex h-10 self-end ml-4">
              <Button onClick={onPreviewClick}> Preview </Button>
            </div>
          </div>
        </div>
        <div ref={componentRef}>
          <div className="flex flex-col bg-white p-4 mt-5 md:flex-row">
            <div className="flex flex-col grow md:flex-row ">
              <div className="grow flex flex-col md:border-r md:border-r-gray-300">
                <div className="mb-5">
                  <div className="font-bold"> Assignment Name </div>
                  <div> {assignmentData?.assignment_name}</div>
                </div>

                <div className="mb-5">
                  <div className="font-bold"> Teacher </div>
                  <div>
                    {fName} {lName}
                  </div>
                </div>

                <div className="flex mb-5">
                  <div className="mr-4">
                    <div className="font-bold"> Student </div>
                    <div>
                      {selectedStudentName !== 'Select'
                        ? selectedStudentName
                        : ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grow md:border-r md:border-r-gray-300 md:ml-4">
                <div className="mb-5">
                  <div className="font-bold"> Lesson Name </div>
                  {/* <div className="truncate w-[170px]"> */}{' '}
                  {assignmentData?.chapters?.map(
                    (ele: any) => `${ele.chapter_name} `
                  )}{' '}
                  {/* </div> */}
                  {/* <div> - </div> */}
                </div>
                <div className="mb-5">
                  <div className="font-bold">
                    Status: {assignmentData?.state}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col grow md:flex-row">
              <div
                className={`px-8 flex ${isFromComplete === 'true' ? `md:border-r md:border-r-gray-300` : ``}`}
              >
                <div
                  className={`mb-5 ${isFromComplete === 'true' ? `mr-5` : ``}`}
                >
                  <div className="font-bold"> Start Date </div>
                  <div>
                    {' '}
                    {assignmentData &&
                      moment(
                        assignmentData?.start_date?.replace('Z', '')
                      )?.format('DD-MM-YYYY')}{' '}
                  </div>
                </div>

                <div className="ml-6">
                  <div className="font-bold"> End Date </div>
                  <div>
                    {' '}
                    {assignmentData &&
                      moment(
                        assignmentData?.end_date?.replace('Z', '')
                      )?.format('DD-MM-YYYY')}{' '}
                  </div>
                </div>
              </div>

              {isFromComplete === 'true' ||
              ['Submitted', 'Completed'].includes(assignmentData?.state) ? (
                <div className="grow box-content flex items-center h-full justify-center">
                  <div
                    style={{
                      backgroundColor: colorCode(
                        parseInt(assignmentData?.score, 10),
                        'bg'
                      ),
                    }}
                    className="h-[180px] flex items-center justify-center md:text-2xl text-sm rounded p-5"
                  >
                    Score
                    <span
                      className="text-blue-100"
                      style={{
                        color: colorCode(
                          parseInt(assignmentData?.score, 10),
                          'color'
                          // eslint-disable-next-line comma-dangle
                        ),
                      }}
                    >
                      &nbsp;
                      {/* eslint-disable-next-line no-restricted-globals */}
                      {assignmentData?.score == null ||
                      isNaN(assignmentData?.score)
                        ? '0'
                        : `${assignmentData?.score}`}
                      % ({/* eslint-disable-next-line no-restricted-globals */}
                      {assignmentData?.score == null ||
                      isNaN(assignmentData?.score)
                        ? '0'
                        : `${assignmentData?.score}`}
                      /100) &nbsp;
                    </span>
                    - {getPerformanceText(parseInt(assignmentData?.score))}
                  </div>
                </div>
              ) : null}
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
