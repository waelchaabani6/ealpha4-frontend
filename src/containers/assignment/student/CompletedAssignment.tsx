import React, { Component, useEffect, useRef, useState } from 'react';
import Divider from '@mui/material/Divider/Divider';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import DatePicker from '@component/datepicker';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import { CSVLink } from 'react-csv';
import ReactToPrint from 'react-to-print';
import Button, { IconButton } from '@component/button/button';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { useGet } from '@shared/api/useApi';
import moment from 'moment';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import { ReactComponent as Search } from '@images/search.svg';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { getNoOfPages } from '@utility/utility';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import Loader from '@shared/loader';
import toast from '@shared/toast';
import Dropdown from '@component/dropdown/Dropdown';
import RouteLayout from '../../layout/routeLayout';
import {
  RESULTS_PER_PAGE,
  COMPONENTS,
  TABLE_LABELS,
  TOOLBAR_LABELS,
} from '../../../constants/constants';
import CustomPagination from '../../../components/pagination/CustomPagination';
import Wrapper from '../../../shared/wrapper/Wrapper';

const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;

const printButton = () => <PrintIcon />;

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user_profile_id: studentID } = useSelector(selectUser);

  const headers = [
    TABLE_LABELS?.ASSIGNMET_NAME,
    TABLE_LABELS?.COURSES,
    TABLE_LABELS?.TEACHER,
    TABLE_LABELS?.LESSONS,
    TABLE_LABELS?.START_DATE,
    TABLE_LABELS?.DUE_DATE,
    TABLE_LABELS?.SCORE,
  ];

  const [csvData, setCsvData] = useState<[]>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [bulkSelect, setBulkSelect] = useState<any>([]);

  const TableColumns = [
    {
      // label: TABLE_LABELS?.SR_NO,
      // align: 'center',
      label: '',
      isSort: false,
      mapper: '',
      isAdd: true,
    },
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
      sx: { width: '90px' },
    },
    {
      label: TABLE_LABELS?.ASSIGNMET_NAME,
      mapper: 'assignment_name',
      sx: { width: '200px' },
      isSort: true,
    },
    {
      label: TABLE_LABELS?.COURSES,
      isSort: true,
      mapper: 'subject_name',
    },
    {
      label: TABLE_LABELS?.COMPONENT,
      align: 'center',
      sx: { width: '150px' },
      mapper: 'component',
    },
    {
      label: TABLE_LABELS?.TEACHER,
      isSort: true,
      mapper: 'teacher_name',
    },
    {
      label: TABLE_LABELS?.LESSONS,
      isSort: true,
      mapper: 'Lessons',
    },
    {
      label: TABLE_LABELS?.START_DATE,
      isSort: true,
      sx: { width: '110px' },
      format: 'DD-MM-YYYY',
      mapper: 'start_date',
    },
    {
      label: TABLE_LABELS?.DUE_DATE,
      align: 'center',
      isSort: true,
      sx: { width: '110px' },
      format: 'DD-MM-YYYY',
      mapper: 'end_date',
    },
    {
      label: TABLE_LABELS?.REMARK,
      mapper: 'remark',
      sx: { width: '100px' },
    },
    {
      label: TABLE_LABELS?.SCORE,
      align: 'center',
      sx: { width: '90px' },
      mapper: 'score',
    },
  ];

  const subTableHeader = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
    },
    {
      label: 'Chapter',
      mapper: 'chapter_name',
      isSort: true,
    },
    {
      label: 'Lesson Name',
      sx: { width: '200px' },
      mapper: 'lessonUnitName',
    },
  ];

  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [assignmentList, setAssignmentList] = useState<any>([]);
  const [searchVal, setSearchVal] = useState('');

  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [fromDate, setFromDate] = useState<any>('');
  const [toDate, setToDate] = useState<any>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [viewMoreOpenModal, setViewMoreOpenModal] = useState(false);
  const [remarkText, setRemarkText] = useState('');

  // noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const componentRef = useRef(null);
  const completedAssignRef = useRef(null);
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);

  const handelSendEmail = () => {
    sendEmail();
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD_ASSIGNMENT) {
      navigate('create-assignment');
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      // importData();
    }
  };

  const onStartButtonClick = (subData: any) => {
    navigate(
      `/${schoolNameInURL}/course-preview/${subData.course_table_id}/${subData.chapter_id}/${subData.lessonMainId}/${subData.course_id}/${subData.lessonUnitId}`
    );
  };

  const onLinkClick = () => {
    fetch(
      'https://images.unsplash.com/photo-1519575993697-5eb7f0dcda98?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80',
      {
        method: 'GET',
        headers: {},
      }
    )
      .then((response) => {
        response.arrayBuffer().then((buffer) => {
          const url = window.URL.createObjectURL(new Blob([buffer]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'image.png'); // or any other extension
          document.body.appendChild(link);
          link.click();
        });
      })
      .catch((err) => {});
  };

  const init = () => {
    const rows2 = assignmentList.map(
      (
        ele: {
          assignment_id: any;
          course_table_id: any;
          course_name: any;
          teacher_name: any;
          assignment_files(assignment_files: any): void;
          subData: any;
          assignment_name: any;
          subject: any;
          remark: string;
          teacher: any;
          AssignmentName: string;
          lesson_name: string;
          student_count: string;
          subject_name: string;
          component_name: string;
          state: string;
          start_date: string;
          end_date: string;
          score: string;
          id: number;
          chapters: any[];
        },
        inde: number
      ) => ({
        ...ele,
        SR_NO: inde + 1,
        subject_name: (
          <Link
            state={{
              pagination: page,
              exitButton: true,
              path: `/${schoolNameInURL}/assignment/completed-assignments`,
            }}
            to={`/${schoolNameInURL}/MySubject/${ele.course_table_id}`}
          >
            {' '}
            <span className="text-accent underline cursor-pointer text-xs font-medium">
              {ele.course_name}
            </span>{' '}
            {/* eslint-disable-next-line react/jsx-closing-tag-location */}
          </Link>
        ),
        assignment_name:
          ele.subData.length >= 2 ? (
            ele.assignment_name
          ) : (
            <Link
              state={
                ele.subData.length !== 0
                  ? {
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
                      pagination: page,
                    }
                  : {}
              }
              to={`/${schoolNameInURL}/assignment/assignment-details/${ele.id}/empty/true`}
            >
              {' '}
              <span className="text-accent underline cursor-pointer text-xs font-medium">
                {ele.assignment_name}
              </span>{' '}
              {/* eslint-disable-next-line react/jsx-closing-tag-location */}
            </Link>
          ),
        teacher_name: ele.teacher_name,
        Lessons:
          ele.lesson_name.length <= 50
            ? ele.lesson_name
            : `${ele.lesson_name.substring(0, 50)}...`,
        start_date: ele.start_date,
        end_date: ele.end_date,
        score: ele.score,
        State: ele.state,
        component: ele.component_name,
        remark: (
          <div>
            <div className="">
              {(ele?.remark ?? '').slice(0, 10)}
              {ele?.remark?.length > 10 && (
                <div>
                  <span
                    role="cell"
                    className="underline cursor-pointer"
                    onClick={() => {
                      setViewMoreOpenModal(true);
                      setRemarkText(ele?.remark);
                    }}
                  >
                    {' '}
                    View More
                  </span>
                </div>
              )}
            </div>
          </div>
        ),
        subData:
          ele.subData.length >= 2
            ? ele.subData.map((subData: any, index: number) => ({
                SR_NO: index + 1,
                chapter_name: subData.chapter_name,
                chapterMainId: subData.chapterMainId,
                chapter_id: subData.chapter_id,
                lessonMainId: subData.lessonMainId,
                lessonUnitId: subData.lessonUnitId,
                lessonUnitName: (
                  <Link
                    state={
                      ele.subData.length !== 0
                        ? {
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
                            pagination: page,
                          }
                        : {}
                    }
                    to={`/${schoolNameInURL}/assignment/assignment-details/${ele.id}/empty/true`}
                  >
                    <span className="text-xs underline font-medium">
                      {subData.lessonUnitName}
                    </span>
                  </Link>
                ),
                pageName: (
                  <span className="text-accent underline cursor-pointer font-medium">
                    {subData.pageName}
                  </span>
                ),
                Action:
                  ele.state === 'Yet to start' || ele.state === 'Ongoing' ? (
                    <div className="flex justify-center items-center">
                      <Button
                        onClick={() => onStartButtonClick(subData)}
                        sx={{ width: '100px' }}
                      >
                        {ele.state === 'Yet to start' ? 'Start' : 'Continue'}
                      </Button>
                      {/* eslint-disable-next-line react/jsx-closing-tag-location */}
                    </div>
                  ) : (
                    <div />
                  ),
              }))
            : [],
      })
    );
    setTableData([...rows2]);
  };

  useEffect(() => {
    init();
  }, [assignmentList]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);

  useEffect(() => {
    refetchAssignmentList();
  }, [fromDate, toDate, orderBy, order, page, searchVal, rowsPerPage]);

  const handleDialog = () => {
    setDialogOpen(false);
  };

  const {
    isLoading: emailSendLoading,
    isRefetching: emailSendRefetch,
    refetch: sendEmail,
  } = useGet({
    baseURL,
    url: `assignments-service/student-assigned-pdf-download/?student_id=${studentID}&status=Completed`,
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
    //   icon: (emailSendLoading || emailSendRefetch) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Completed Assignments.csv"
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

  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const {
    isLoading,
    refetch: refetchAssignmentList,
    isRefetching,
  }: any = useGet({
    baseURL,
    url: `assignments-service/student/assignment/list/?student_id=${studentID}&state=Completed&ordering=${ordering}&offset=${(page - 1) * Number(rowsPerPage)}${searchVal ? `&search=${searchVal}` : ''}${fromDate ? `&start_date=${moment(fromDate).format('YYYY-MM-DD')}` : ''}${toDate ? `&end_date=${moment(toDate).format('YYYY-MM-DD')}` : ''}&limit=${rowsPerPage}`,
    onSuccess: (res: any) => {
      const tempAssignmentList: any = res?.data?.results;
      const myCsvData = tempAssignmentList.map((ele: any) => [
        ele.assignment_name,
        ele.course_name,
        ele.teacher_name,
        ele.lesson_name ? ele.lesson_name.substring(0, 20) : '',
        ele.start_date,
        ele.end_date,
        ele.score,
      ]);
      setCsvData(myCsvData);
      setTotalDataCount(res?.data?.count);
      tempAssignmentList.map((assignmentMainList: any) => {
        const subData: any = [];
        if (assignmentMainList.chapters.length !== 0) {
          assignmentMainList.chapters.forEach((chapter: any) => {
            if (chapter.lessons.length !== 0) {
              chapter.lessons.forEach((lesson: any) => {
                if (lesson.pages.length !== 0) {
                  lesson.pages.forEach(({ name }: { name: string }) => {
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
                      pageName: name,
                      pageNumber:
                        name !== ''
                          ? `${name.split(' ')[name.split(' ').length - 1]}`
                          : '-1',
                      contentUrl: lesson.content_url,
                    });
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
                    pageNumber: '-1',
                    contentUrl: lesson.content_url,
                  });
                }
              });
            }
          });
        }
        assignmentMainList.subData = subData;
        return assignmentMainList;
      });
      setAssignmentList(tempAssignmentList);
    },
    onError: ({ response }: any) => {},
    enabled: true,
  });

  const reset = () => {
    setToDate('');
    setFromDate('');
  };

  const handlePerPage = (e: any) => {
    setPage(page);
    setRowsPerPage(e);
  };

  return (
    <RouteLayout>
      <HeaderMenus
        title="Completed Assignments"
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
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
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                  }}
                />
              </div>
              <div
                className="w-[32px] h-full grid justify-center place-items-center"
                onClick={() => {
                  refetchAssignmentList();
                }}
              >
                <Search className="pl-1" />
              </div>
            </div>
          </div>
          <div>
            <DatePicker
              value={fromDate}
              label="From"
              handlePickerChange={(date: string) => setFromDate(date)}
              sxType={2}
              defaultStyle={true}
              disableFuture={toDate}
              disablePast={false}
            />
          </div>
          <div>
            <DatePicker
              value={toDate}
              label="To"
              handlePickerChange={(date: string) => setToDate(date)}
              sxType={2}
              defaultStyle={true}
              disablePast={false}
              disableOld={fromDate}
            />
          </div>
          <Dropdown
            title="Result Of Pages"
            value={rowsPerPage}
            dataArray={RESULTS_PER_PAGE}
            onChangeHandler={handlePerPage}
            sxClass={{ width: '206px', marginRight: '5px' }}
          />
          <div className="flex gap-2 justify-center items-center h-[36px]">
            <span
              tabIndex={0}
              title="Clear dates"
              onClick={reset}
              role="button"
            >
              <RestartAltIcon />
            </span>
            <Divider
              orientation="vertical"
              flexItem={true}
              className="border-[#D2D2D2] pl-2"
            />
            <Link to={`/${schoolNameInURL}/assignment`}>
              <div className="text-accent underline cursor-pointer text-base font-medium pl-2">
                Assigned Assignments
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
            handleMoreOption={() => {}}
            moreMenuOptions={[]}
            subTableHeader={subTableHeader}
            setBulkSelect={() => {}}
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
