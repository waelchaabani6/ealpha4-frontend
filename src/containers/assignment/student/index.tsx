/* eslint-disable jsx-a11y/anchor-is-valid */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Button from '@component/button/button';
import DatePicker from '@component/datepicker';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import FileSelect from '@component/fileUpload';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import { ReactComponent as Search } from '@images/search.svg';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import UploadIcon from '@mui/icons-material/Upload';
import Divider from '@mui/material/Divider/Divider';
import { useGet, usePost, usePatch } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import { getNoOfPages } from '@utility/utility';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import CustomPagination from '../../../components/pagination/CustomPagination';
import { RESULTS_PER_PAGE, TABLE_LABELS, TOOLBAR_LABELS } from '../../../constants/constants';
import Wrapper from '../../../shared/wrapper/Wrapper';
import RouteLayout from '../../layout/routeLayout';

const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;

type lessonWiseFormObjType = {
  [key: string]: string;
  assign_assignment: string;
  lesson_id: string;
  chapter_id: string;
}

let today = new Date();
const printButton = () => <PrintIcon />;

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user_profile_id: studentID, role } = useSelector(selectUser);

  const headers = [
    TABLE_LABELS?.ASSIGNMET_NAME,
    TABLE_LABELS?.SUBJECT,
    TABLE_LABELS?.TEACHER,
    TABLE_LABELS?.LESSONS,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.DUE_DATE,
    TABLE_LABELS?.SCORE,
    TABLE_LABELS?.STATE
  ];

  const [csvData, setCsvData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);
  const imageRef = useRef<any>();
  const TableColumns = [
    {
      label: '',
      isSort: false,
      mapper: '',
      isAdd: true
    },
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
      sx: { width: '90px' }
    },
    {
      label: TABLE_LABELS?.ASSIGNMET_NAME,
      mapper: 'assignment_name',
      sx: { width: '200px' },
      isSort: true
    },
    {
      label: TABLE_LABELS?.SUBJECT,
      isSort: true,
      mapper: 'subject_name'
    },
    {
      label: TABLE_LABELS?.TEACHER,
      isSort: true,
      mapper: 'teacher_name'
    },
    {
      label: TABLE_LABELS?.LESSONS,
      mapper: 'Lessons',
      sx: { width: '120px' }
    },
    {
      label: TABLE_LABELS?.STATUS,
      align: 'center',
      mapper: 'State',
      sx: { width: '100px' }
    },
    {
      label: TABLE_LABELS?.START_DATE,
      isSort: true,
      mapper: 'start_date',
      format: 'DD-MM-YYYY',
      sx: { width: '110px' }
    },
    {
      label: TABLE_LABELS?.DUE_DATE,
      align: 'center',
      isSort: true,
      mapper: 'end_date',
      format: 'DD-MM-YYYY',
      sx: { width: '110px' }
    },
    {
      label: TABLE_LABELS?.SCORE,
      align: 'center',
      isSort: true,
      mapper: 'score',
      sx: { width: '110px' }
    },
    {
      label: TABLE_LABELS?.REMARK,
      mapper: 'remark',
      sx: { width: '100px' }
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: 'Action',
      align: 'center',
      colspan: 2
    }
  ];

  const subTableHeader = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: 'Chapter',
      mapper: 'chapter_name',
      isSort: true
    },
    {
      label: 'Lesson Name',
      // isSort: true,
      mapper: 'lessonUnitName'
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: 'Action',
      align: 'center',
      colspan: 2
    }
  ];

  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [assignmentList, setAssignmentList] = useState<any>([]);
  const [searchVal, setSearchVal] = useState('');

  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [fromDate, setFromDate] = useState<any>('');
  const [toDate, setToDate] = useState<any>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [ErrorDialogOpen, setErrorDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(-1);
  const [actionConfirmPopup, setActionConfirmPopup] = useState(false);
  const [loaderIndexArray, setLoaderIndexArray] = useState<number[]>([]);
  const [formObject, setFormObject] = useState<any>(null);
  const [lessonWiseformObject, setLessonWiseformObject] = useState<any>(null);
  const componentRef = useRef(null);
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
  const [uploadLoaderIndex, setUploadLoaderIndex] = useState<number | undefined>();
  const [viewMoreOpenModal, setViewMoreOpenModal] = useState(false);
  const [remarkText, setRemarkText] = useState('');

  const handelSendEmail = () => {
    sendEmail();
  };

  const { isLoading: emailSendLoading, isRefetching: emailSendRefetch, refetch: sendEmail } = useGet({
    baseURL,
    url: `assignments-service/student-assigned-pdf-download/?student_id=${studentID}`,
    onSuccess: () => {
      toast('success', 'Email sent successfully');
    },
    retry: false,
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Unable to send email');
    },
    enabled: false
  }) as any;

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD_ASSIGNMENT) {
      navigate('create-assignment');
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };

  const onStartButtonClick = async (subData: any, state: string, contentUrl: string) => {
    if (subData?.status !== 'Ongoing') {
      statusChange('Ongoing');
    }
    const lessonWiseFormObj : lessonWiseFormObjType = {
      assign_assignment: subData.id,
      lesson_id: subData.lessonUnitId,
      chapter_id: subData.chapterMainId
    };
    const userFd = new FormData();
    Object.keys(lessonWiseFormObj).forEach((key: string) => {
      userFd.append(key, lessonWiseFormObj[key]);
    });
    setLessonWiseformObject(userFd);
    setTimeout(() => {
      const stateObj = {
        chapterMainId: subData.chapterMainId,
        courseId: subData.course_table_id,
        chapterId: subData.chapter_id,
        lessonId: subData.lessonMainId,
        urlCourseId: subData.course_id,
        urlLessonId: subData.lessonUnitId,
        chapterIndex: 0,
        lessonIndex: 0,
        assignButton: role.name === 'Teacher',
        isDueDatedExceeded: false,
        moduleName: 'assignment',
        assignmentId: subData.id,
        contentUrl,
        pageName: subData.pageName || subData.lessonUnitName,
        pageNumber: subData.pageNumber
      };
      navigatToPreview(stateObj);
    }, 1000);
  };

  const navigatToPreview = (state: any) => {
    navigate(`/${schoolNameInURL}/course-preview`, {
      state
    });
  };

  const onLinkClick = (fileArray: any, index: number) => {
    if (fileArray.length !== 0) {
      const fileUrl = fileArray[0].files;

      let tempLoaderIndexArray = [...loaderIndexArray, index];
      setLoaderIndexArray([...tempLoaderIndexArray]);
      fetch(fileUrl, {
        method: 'GET',
        headers: {}
      })
        .then((response) => {
          const foundIndex = tempLoaderIndexArray.indexOf(index);
          if (foundIndex > -1) {
            tempLoaderIndexArray = tempLoaderIndexArray.filter((item) => item !== index);
            setLoaderIndexArray([...tempLoaderIndexArray]);
          }
          response.arrayBuffer().then((buffer) => {
            const url = window.URL.createObjectURL(new Blob([buffer]));
            const fileName = fileUrl.split('/')[fileUrl.split('/').length - 1];
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
          });
        })
        .catch((err) => {
        });
    }
  };

  const onChange = (files: FileList, id: number, inde: number) => {
    const file = files?.[0];
    const userFd = new FormData();
    const passObj: any = {
      files: file,
      assigned_assignment: Number(id)
    };
    Object.keys(passObj).forEach((key: string) => {
      userFd.append(key, passObj[key]);
    });
    setUploadLoaderIndex(inde);
    mutateImport(userFd);
  };

  const { isLoading: LoadAssesment, mutate: mutateImport } = usePost({
    baseURL,
    url: `assignments-service/assignment/student/attachment`,
    onSuccess: (response: any) => {
      setDialogOpen(true);
      setUploadLoaderIndex(undefined);
    },
    onError: ({ response }: any) => {
      setErrorDialogOpen(true);
    }
  });

  const reset = () => {
    setToDate('');
    setFromDate('');
  };

  const statusChange = async (Status: string) => {
    const passObj: { state: string } = { state: Status };
    const userFd = new FormData();
    userFd.append('state', passObj.state);
    setFormObject(userFd);
  };

  useEffect(() => {
    if (lessonWiseformObject !== null && selectedStudentId !== -1) {
      updateLessonWiseStatus(lessonWiseformObject);
    }
  }, [lessonWiseformObject]);

  useEffect(() => {
    if (formObject !== null && selectedStudentId !== -1) {
      updateStatus(formObject);
    }
  }, [formObject]);

  const { isLoading: updateLoading, mutate: updateStatus } = usePatch({
    baseURL,
    url: `assignments-service/assignments/student/${selectedStudentId}/change-status/`,
    onSuccess: (response: any) => {
      toast('success', response?.data?.message);
      refetchAssignmentList();
    },
    onError: (response: any) => {
      toast('error', response?.response?.data?.message);
    }
  });

  const { mutate: updateLessonWiseStatus } = usePost({
    baseURL,
    url: `assignments-service/assignments/student/lessons-pages/change-status`,
    onSuccess: (response: any) => {
    },
    onError: (response: any) => {
      toast('error', response?.response?.data?.message);
    }
  });

  const desideButtonDisable = (startDate: string, endDate: string) => {
    let shouldButtonDisable = false;
    today = new Date(today.setHours(0, 0, 0, 0));
    const startDate1 = startDate && new Date(new Date(startDate).setHours(0, 0, 0, 0));
    const endDate1 = endDate && new Date(new Date(endDate).setHours(0, 0, 0, 0));

    if (startDate1 && endDate1) {
      shouldButtonDisable = (today >= startDate1 && today <= endDate1);
    }
    return !shouldButtonDisable;
  };

  const init = () => {
    const rows2 = assignmentList.map((ele: {
      grade_name: string;
      contentUrl: string;
      assignment_id: any;
      course_table_id: any;
      course_name: any;
      teacher_name: any;
      assignment_files(assignment_files: any): void;
      subData: any;
      assignment_name: any;
      subject: any;
      remark: string;
      single_access: boolean;
      teacher: any; AssignmentName: string; lesson_name: string; student_count: string; subject_name: string; state: string; start_date: string; end_date: string; score: string; id: number; chapters: any[];
    }, inde: number) => {
      const shouldDisableButton = desideButtonDisable(ele.start_date, ele.end_date);
      const ShouldDisableButtonCond2 = (ele.single_access && ele?.state === 'Ongoing');
      return {
        ...ele,
        SR_NO: inde + 1,
        subject_name: (
          <Link state={{ pagination: page, exitButton: true, path: `/${schoolNameInURL}/assignment` }} to={`/${schoolNameInURL}/MySubject/${ele.course_table_id}`}>
            {' '}
            <span className="underline cursor-pointer font-medium">{ele.course_name}</span>
            {' '}
          </Link>
        ),
        assignment_name: (ele.subData.length >= 2) ? ele.assignment_name : <Link
          state={ele.subData.length !== 0 ? {
            chapterMainId: ele.subData[0].chapterMainId,
            courseId: ele.subData[0].course_table_id,
            chapterId: ele.subData[0].chapter_id,
            lessonId: ele.subData[0].lessonMainId,
            urlCourseId: ele.subData[0].course_id,
            urlLessonId: ele.subData[0].lessonUnitId,
            chapterIndex: 0,
            lessonIndex: 0,
            assignButton: false,
            isDueDatedExceeded: false,
            moduleName: 'assignment',
            assignmentId: ele.subData[0].id,
            pageName: ele.subData[0].pageName,
            pageNumber: ele.subData[0].pageNumber,
            contentUrl: ele.subData[0].contentUrl,
            pagination: page
          } : {}}
          to={`/${schoolNameInURL}/assignment/assignment-details/${ele.id}/empty/false`}
        >
          {' '}
          <span className="underline cursor-pointer font-medium">{ele.assignment_name}</span>
          {' '}
          {/* eslint-disable-next-line react/jsx-closing-tag-location */}
        </Link>,
        teacher_name: ele.state === 'Submitted' ? <p className="">{ele.teacher_name}</p> : ele.teacher_name,
        Lessons: ele.state === 'Submitted' ? <p className="">{ele.lesson_name.length <= 25 ? ele.lesson_name : `${ele.lesson_name.substring(0, 25)}...`}</p> : ele.lesson_name.length <= 25 ? ele.lesson_name : <p title={ele.lesson_name}>{`${ele.lesson_name.substring(0, 25)}...`}</p>,
        start_date: ele.state === 'Submitted' ? <p className="">{ele.start_date}</p> : ele.start_date,
        // end_date: ele.state === 'Submitted' ? <p className="">{ele.end_date}</p> : <span>{ele.end_date}</span>,
        score: ele.state === 'Submitted' ? <p className="">{ele.score}</p> : <div className="text-center relative left-[-10px]">{ele.score ? ele.score : 'N/A'}</div>,
        State: ele.state === 'Submitted' ? <p className="">{ele.state}</p> : ele.state,
        rowSx: ele.state === 'Submitted' ? { td: { color: 'var(--accent)' } } : ele.state === 'Ongoing' ? { td: { color: 'var(--sunlight)' } } : '',
        Action: ele.state === 'Submitted' ? <p>
          {' '}
          <Button disabled={true}>
            {ele.state}
            {' '}
          </Button>
          {' '}
          {/* eslint-disable-next-line react/jsx-closing-tag-location */}
        </p> : (
          (ele.state === 'Yet to Start' || ele.state === 'Ongoing')
            ? (
              <div className="flex justify-center items-center">
                {ele.subData.length >= 2 ? null : <Button disabled={shouldDisableButton || ShouldDisableButtonCond2} onClick={() => { setSelectedStudentId(ele.id); onStartButtonClick(ele.subData[0], ele.state, ele.contentUrl); }} sx={{ width: '100px' }}>{ele.state === 'Yet to Start' ? 'Start' : 'Continue'}</Button>}
                <Button disabled={shouldDisableButton} onClick={() => { setActionConfirmPopup(true); setSelectedStudentId(ele.id); }} sx={{ width: '100px', marginLeft: '5px' }}>Submit</Button>
                {
                  ele.end_date >= moment(new Date()).format('YYYY-MM-DD')
                    ? (
                      <FileSelect
                        ref={imageRef}
                        onChange={(e) => onChange(e, ele.id, inde)}
                      >
                        {inde === uploadLoaderIndex ? <Button sx={{ marginLeft: '5px' }} loading={true}>l</Button> : <UploadIcon style={{ borderRadius: '5px', cursor: 'pointer', padding: '5px', width: '37px', height: '37px', marginLeft: '4px', background: 'var(--sunlight)', color: 'white' }} />}
                      </FileSelect>
                    )
                    : ''
                }
                {
                  ele?.assignment_files?.length
                    ? (
                      <>
                        {loaderIndexArray.includes(inde)
                          ? <Button sx={{ marginLeft: '5px' }} loading={true}>l</Button>
                          : (
                            <a
                              tabIndex={0}
                              aria-label="Button"
                              role="button"
                              download={true}
                              onClick={() => onLinkClick(ele.assignment_files, inde)}
                              style={{ cursor: 'pointer' }}
                            >
                              <DownloadIcon style={{ borderRadius: '5px', cursor: 'pointer', padding: '5px', width: '37px', height: '37px', marginLeft: '4px', background: '#516cf6', color: 'white' }} />
                            </a>
                          )}
                      </>
                    )
                    : <p style={{ borderRadius: '5px', cursor: 'pointer', padding: '5px', width: '37px', height: '37px', marginLeft: '4px', background: 'none', color: 'white' }} />
                }

              </div>
            ) : null
        ),
        remark: (
          <div>
            <div className="">
              {(ele?.remark ?? '').slice(0, 10)}
              {ele?.remark?.length > 10 && (
                <div>
                  <span role="cell" className="underline cursor-pointer" onClick={() => { setViewMoreOpenModal(true); setRemarkText(ele?.remark); }}>
                    {' '}
                    View More
                  </span>
                </div>
              )}
            </div>
          </div>
        ),
        subData: ele.subData.length >= 2 ? ele.subData.map((subData: any, index: number) => {
          const subShouldDisableButton = (ele.single_access && subData?.status === 'Ongoing');
          return {
            SR_NO: index + 1,
            chapter_name: subData.chapter_name,
            chapterMainId: subData.chapterMainId,
            chapter_id: subData.chapter_id,
            lessonMainId: subData.lessonMainId,
            lessonUnitId: subData.lessonUnitId,
            lessonUnitName: (
              <Link
                state={ele.subData.length !== 0 ? {
                  chapterMainId: ele.subData[index].chapterMainId,
                  courseId: ele.subData[index].course_table_id,
                  chapterId: ele.subData[index].chapter_id,
                  lessonId: ele.subData[index].lessonMainId,
                  urlCourseId: ele.subData[index].course_id,
                  urlLessonId: ele.subData[index].lessonUnitId,
                  chapterIndex: 0,
                  lessonIndex: 0,
                  assignButton: false,
                  isDueDatedExceeded: false,
                  moduleName: 'assignment',
                  assignmentId: ele.subData[index].id,
                  pageName: '',
                  pageNumber: '-1',
                  contentUrl: ele.subData[index].contentUrl,
                  pagination: page
                } : {}}
                to={`/${schoolNameInURL}/assignment/assignment-details/${ele.id}/empty/false`}
              >
                <span className="font-medium underline">
                  {subData.lessonUnitName}
                </span>
              </Link>
            ),
            pageName: (
              <span className="text-accent underline cursor-pointer font-medium">
                {subData.pageName && JSON.parse(subData.pageName || '').join(', ')}
              </span>
            ),
            Action: (
              (subData?.status === 'Yet to Start' || subData?.status === 'Ongoing')
                ? <div className="flex justify-center items-center">
                  <Button disabled={shouldDisableButton || subShouldDisableButton} onClick={() => { setSelectedStudentId(ele.id); onStartButtonClick(subData, ele.state, subData.contentUrl); }} sx={{ width: '100px' }}>{subData?.status === 'Yet to Start' ? 'Start' : 'Continue'}</Button>
                  {/* eslint-disable-next-line react/jsx-closing-tag-location */}
                </div> : <div />
            )
          };
        }) : []
      };
    }
    );
    setTableData([...rows2]);
  };

  useEffect(() => {
    init();
  }, [assignmentList, loaderIndexArray, uploadLoaderIndex]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);

  useEffect(() => {
    refetchAssignmentList();
  }, [fromDate, toDate, page, order, orderBy]);

  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isLoading, refetch: refetchAssignmentList, isRefetching }: any = useGet({
    baseURL,
    url: `assignments-service/student/assignment/list/?student_id=${studentID}${searchVal !== '' ? `&search=${searchVal}` : ''}&ordering=${ordering}&offset=${(page - 1) * Number(rowsPerPage)}${fromDate ? `&start_date=${moment(fromDate).format('YYYY-MM-DD')}` : ''}${toDate ? `&end_date=${moment(toDate).format('YYYY-MM-DD')}` : ''}&limit=10&all_assignments=all`,
    onSuccess: (res: any) => {
      const tempAssignmentList: any = res?.data?.results;
      const myCsvData = tempAssignmentList.map((ele: any) => ([
        ele.assignment_name, ele.course_name, ele.teacher_name, ele.lesson_name ? ele.lesson_name.substring(0, 20) : '', ele.start_date, ele.end_date, ele.score, ele.state
      ]));
      setCsvData(myCsvData);
      tempAssignmentList.map((assignmentMainList: any) => {
        const subData: any = [];
        if (assignmentMainList.chapters.length !== 0) {
          assignmentMainList.chapters.forEach((chapter: any) => {
            if (chapter.lessons.length !== 0) {
              chapter.lessons.forEach((lesson: any) => {
                if (lesson.pages.length !== 0) {
                  const pageNumberArray: string[] = [];
                  const pageNameArray: string[] = [];
                  lesson?.pages.forEach(({ name, page_number } : {name: string; page_number: string}) => {
                    pageNumberArray.push(page_number);
                    pageNameArray.push(name);
                  });
                  subData.push({
                    chapter_id: chapter.chapter_id,
                    chapterMainId: chapter.id,
                    chapter_name: chapter?.chapter_name.substring(0, 50),
                    lessonMainId: lesson.id,
                    lessonUnitId: lesson.unit_id,
                    lessonUnitName: lesson.unit_name,
                    course_id: assignmentMainList.course_id,
                    course_table_id: assignmentMainList.course_table_id,
                    id: assignmentMainList.id,
                    pageName: JSON.stringify(pageNameArray), // name,
                    pageNumber: pageNumberArray.join(','), // Number(page_number),
                    contentUrl: lesson.content_url,
                    module: 'Assignment',
                    status: lesson.status
                  });
                } else {
                  subData.push({
                    chapter_id: chapter.chapter_id,
                    chapterMainId: chapter.id,
                    chapter_name: chapter?.chapter_name.substring(0, 50),
                    lessonMainId: lesson.id,
                    lessonUnitId: lesson.unit_id,
                    lessonUnitName: lesson.unit_name,
                    course_id: assignmentMainList.course_id,
                    course_table_id: assignmentMainList.course_table_id,
                    id: assignmentMainList.id,
                    pageName: '',
                    pageNumber: '1',
                    contentUrl: lesson.content_url,
                    status: lesson.status
                  });
                }
              });
            }
          });
        }
        assignmentMainList.subData = subData;
        assignmentMainList.contentUrl = assignmentMainList.subData.length >= 2 ? '' : assignmentMainList?.chapters[0]?.lessons[0]?.content_url;
        return assignmentMainList;
      });
      setAssignmentList(tempAssignmentList);
      setTotalDataCount(res?.data?.count);
    },
    onError: ({ response }: any) => { }
  });

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.EMAIL,
      icon: (emailSendLoading || emailSendRefetch) ? <Loader size={20} /> : <EmailIcon />
    },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Assignments.csv"
          data={csvData}
          headers={headers}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      )
    },
    {
      title: TOOLBAR_LABELS.PRINT,
      icon: <ReactToPrint
        trigger={printButton}
        content={() => componentRef.current}
      />
    }
  ];
  return (
    <RouteLayout>
      <HeaderMenus title="Assigned Assignments" menuArray={ADMIN_TOOLBAR_MENU} handleToolbarAction={handleToolbarAction} />
      <CustomizedDialogs
        open={actionConfirmPopup}
        maxwidth="sm"
        setOpen={(parameter: any) => { setActionConfirmPopup(false); }}
        title="Select Action"
      >
        <div>
          Are you sure you want to submit the assignment ?
        </div>
        <div className="flex justify-end items-center mt-12">
          <Button
            onClick={async () => {
              setActionConfirmPopup(false);
              statusChange('Submitted');
            }}
            sx={{ marginRight: '10px' }}
          >
            Yes
          </Button>

          <Button
            onClick={() => {
              setActionConfirmPopup(false);
            }}
          >
            No
          </Button>
        </div>
      </CustomizedDialogs>
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="pt-[30px]">
            <div className="flex-1 flex bg-white border-2 rounded">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search"
                  className="h-full w-full px-1 outline-none placeholder:text-black text-sm"
                  value={searchVal}
                  onChange={(e) => { setSearchVal(e.target.value); }}
                />
              </div>
              <div role="presentation" className="w-[32px] h-full grid justify-center place-items-center" onClick={() => { refetchAssignmentList(); }}>
                <Search className="pl-1" />
              </div>
            </div>
          </div>
          <div>
            <DatePicker
              value={fromDate}
              label="From"
              format="yyyy-DD-MM"
              handlePickerChange={(date: string) => setFromDate(date)}
              sxType={1}
              defaultStyle={true}
              disableFuture={toDate}
              disablePast={false}
            />
          </div>
          <div>
            <DatePicker
              value={toDate}
              label="To"
              format="yyyy-DD-MM"
              handlePickerChange={(date: string) => setToDate(date)}
              sxType={1}
              defaultStyle={true}
              disablePast={false}
              disableOld={fromDate}
            />
          </div>
          <div className="flex gap-2 justify-center items-center h-[36px]">
            <span tabIndex={0} title="Clear dates" onClick={reset} role="button">
              <RestartAltIcon />
            </span>
            <Divider orientation="vertical" flexItem={true} className="border-[#D2D2D2] pl-2" />
            <Link to={`${location?.pathname}/completed-assignments`}>
              <div className="text-accent underline cursor-pointer text-base font-medium pl-2">
                Completed Assignments
              </div>
            </Link>
          </div>
        </div>
        <CustomPagination
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
        />
      </div>
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
            handleMoreOption={() => { }}
            moreMenuOptions={[]}
            subTableHeader={subTableHeader}
            setBulkSelect={() => { }}
            bulkSelect={[]}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            isLoading={isLoading || isRefetching}
          />
        </Wrapper>
      </div>
      <CustomizedDialogs
        onclose={() => { setDialogOpen(false); }}
        open={dialogOpen}
        setOpen={() => { setDialogOpen(false); }}
        title="File Upload"
      >
        <div className="text-center">
          <div className="mb-4"> File uploaded successfully. </div>
          <Button onClick={() => { setDialogOpen(false); }}> Ok </Button>
        </div>
      </CustomizedDialogs>
      <CustomizedDialogs
        onclose={() => { setErrorDialogOpen(false); }}
        open={ErrorDialogOpen}
        setOpen={() => { setErrorDialogOpen(false); }}
        title="Error"
      >
        <div className="text-center">
          <div className="mb-4"> Something Went Wrong. </div>
          <Button onClick={() => { setErrorDialogOpen(false); }}> Ok </Button>
        </div>
      </CustomizedDialogs>
      <CustomizedDialogs
        maxwidth="sm"
        open={viewMoreOpenModal}
        setOpen={() => {
          setViewMoreOpenModal(false);
        }}
        title="Remark"
      >
        <div>
          <p>{remarkText}</p>
        </div>
      </CustomizedDialogs>
    </RouteLayout>
  );
}
