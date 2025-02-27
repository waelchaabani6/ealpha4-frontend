/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable react/jsx-curly-newline */
/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable implicit-arrow-linebreak */
import { useEffect, useMemo, useRef, useState } from 'react';
import RouteLayout from '@layout/routeLayout';
import SimpleTableAttendanceReport from '@component/SimpleTableAttendanceReport';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useGet, usePost } from '@shared/api/useApi';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import {
  RESULTS_PER_PAGE,
  TOOLBAR_LABELS,
  USER_TYPE,
} from '@constants/constants';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import { getNoOfPages, userRole } from '@utility/utility';
import { selectUser } from '@shared/store/userSlice';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import AttendanceReportFilters from './components/AttendanceReportFilters';

const printButton = () => <PrintIcon />;

type DateNavigation = {
  start_date: string;
  end_date: string;
  flag: boolean;
};
type SortByType = 'Present' | 'Absent' | 'All';

function formatData(data: any, page: number, subject: string | undefined) {
  console.log('here');
  const cData = [] as any;
  const headerDates = [] as any;
  let isNext = {
    start_date: '',
    end_date: '',
    flag: false,
  } as DateNavigation;

  let isPrev = {
    start_date: '',
    end_date: '',
    flag: false,
  } as DateNavigation;
  console.log(data, '#data');

  const attendanceData =
    userRole().isStudent || userRole().isParent
      ? data?.data?.attendance
      : data?.data?.results?.data?.attendance_records;

  attendanceData?.forEach((item: any, index: number) => {
    // if (index === 0) {
    //   if (item.attendence_recors.previous) {
    //     const prevUrl = new URL(item.attendence_recors.previous);
    //     const searchParams = new URLSearchParams(prevUrl.search);
    //     isPrev = {
    //       start_date: searchParams.get('start_date') || '',
    //       end_date: searchParams.get('end_date') || '',
    //       flag: true,
    //     };
    //   }
    //   if (item.attendence_recors.next) {
    //     const nextUrl = new URL(item.attendence_recors.next);
    //     const searchParams = new URLSearchParams(nextUrl.search);
    //     isNext = {
    //       start_date: searchParams.get('start_date') || '',
    //       end_date: searchParams.get('end_date') || '',
    //       flag: true,
    //     };
    //   }
    // }
    if (userRole().isStudent || userRole().isParent) {
      const tmp = {
        sr_no: (page - 1) * 10 + index + 1,
        TotalPresent: item.total_days_present,
        TotalAbsent: item.total_days_absent,
        // AttendanceReport: item.attendence_recors.results.map((itm: any) => {
        //   const dt = new Date(itm.present_on_date).getDate();

        //   if (headerDates.indexOf(dt) < 0) {
        //     headerDates.push(dt);
        //   }

        //   return itm.present
        //     ? 'Checked'
        //     : itm.is_weekend
        //       ? 'Weekend'
        //       : itm.is_holiday
        //         ? 'HoliDay'
        //         : itm.present === null
        //           ? 'UnChecked'
        //           : 'Absent';
        // }),
        subject: item.program_name,
      } as any;
      cData.push(tmp);
    } else {
      const tmp = {
        sr_no: (page - 1) * 10 + index + 1,
        TotalPresent: item.total_days_present,
        TotalAbsent: item.total_days_absent,
        // AttendanceReport: item.attendence_recors.results.map((itm: any) => {
        //   const dt = new Date(itm.present_on_date).getDate();

        //   if (headerDates.indexOf(dt) < 0) {
        //     headerDates.push(dt);
        //   }

        //   return itm.present
        //     ? 'Checked'
        //     : itm.is_weekend
        //       ? 'Weekend'
        //       : itm.is_holiday
        //         ? 'HoliDay'
        //         : itm.present === null
        //           ? 'UnChecked'
        //           : 'Absent';
        // }),
        StudentFirstname: item.first_name,
        StudentLastname: item.last_name,
      } as any;
      cData.push(tmp);
    }
  });

  return { cData, headerDates, isNext, isPrev };
}

export default function () {
  const { TEACHER } = USER_TYPE;
  const usersRole = useSelector((state: any) => state?.user?.role);
  const { user } = useSelector((state: any) => state);
  const componentRef = useRef(null);
  const [page, setPage] = useState(1);
  const [datesPerPage, setDatesPerPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortByType>('All');
  const [recordsPerPage, setRecordsPerPage] = useState<number | 'all'>(10);

  const [totalDataCount, setTotalDataCount] = useState(0);
  const [TeacherClassesArray, setTeacherClassesArray] = useState<any>([]);
  const {
    role,
    branchId,
    user_profile_id: userId,
    class_name: userClassName,
    user_id,
  } = useSelector(selectUser);
  const [courses, setCourses] = useState<any>([]);
  const { schoolData, branchData } = useSelector(selectSchoolData);

  const [rowsPerPage, setRowsPerPage] = useState(
    RESULTS_PER_PAGE?.[0] as number | 'All'
  );
  const noOfpages = getNoOfPages(totalDataCount, RESULTS_PER_PAGE?.[0]);
  const SchoolUrl = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;

  const { control, watch } = useForm();

  const [selectedBranch, setSelectedBranch] = useState<number | 'select'>(
    'select'
  );
  const [selectedCourse, setSelectedCourse] = useState<number | 'select'>(
    'select'
  );
  const [selectedClass, setSelectedClass] = useState<number | 'select'>(
    'select'
  );
  const [selectedChild, setSelectedChild] = useState<number | 'select'>(
    'select'
  );
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const fetchReportData = () => {
    console.log('Fetching report data with:', {
      selectedBranch,
      selectedCourse,
      selectedClass,
      fromDate,
      toDate,
    });
    // Call API or handle the report generation logic here
  };

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.ADD,
    //   icon: <AddIcon />
    // },
    // {
    //   title: TOOLBAR_LABELS.IMPORT,
    //   icon: <DriveFolderUploadIcon />
    // },
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: <EmailIcon />
    // },
    // {
    //   title: TOOLBAR_LABELS.EXPORT,
    //   icon: <CSVLink filename="Class List.csv" onClick={onCsvClick} data={csvData} headers={headers} enclosingCharacter=""><Share /></CSVLink>
    // },
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
  const formatFromDate = useMemo(() => {
    if (fromDate) {
      return moment(fromDate).format('yyyy-MM-DD');
    }

    return null;
  }, [fromDate]);

  const formatToDate = useMemo(() => {
    if (toDate) {
      return moment(toDate).format('yyyy-MM-DD');
    }
    return null;
  }, [toDate]);

  const classId =
    selectedClass !== 'select' ? selectedClass : user?.class_id || '';
  const { isLoading: subLoading, refetch: refectSubject } = useGet({
    baseURL: SchoolUrl,
    url: `schools-service/school-classes/subject/get?user_id=${user?.userId}&class_id=${classId}`,

    enabled: false,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const temp3: any = [];
      respData?.map((i: any) => {
        temp3.push({ label: i?.name, value: i?.subject_id });
        return temp3;
      });
      setCourses([...temp3]);
    },
  });

  const subjectName = useMemo(() => {
    const tmp = courses?.find((item: any) => item.value === selectedCourse);
    return tmp?.label;
  }, [selectedCourse]);

  const { data, isLoading } = useGet({
    baseURL: SchoolUrl,
    url: `schools-service/school-branches/?limit=100&school_id=${
      schoolData?.id || branchData?.school_data?.id
    }`,
    enabled: !branchId,
  });
  const branchName = useMemo(
    () =>
      data?.data?.response?.results.find(
        (itm: any) => itm.id === selectedBranch
      ),
    [selectedBranch]
  );
  const { data: data1, isLoading: isLoading1 } = useGet({
    baseURL: SchoolUrl,
    url: `schools-service/school-classes/?limit=1000&school_id=${
      schoolData?.id || branchData?.school_data?.id
    } ${
      branchData || selectedBranch !== 'select'
        ? `&branch_name=${branchName?.name || branchData?.name}`
        : ''
    }`,
    enabled: !!(schoolData?.id || branchData?.school_data?.id),
  });

  const formatSchoolClasses =
    data1?.data?.response?.results?.map((item: any) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const schoolId = schoolData?.id || branchData?.school_data?.id;
  const branch_id = branchId
    ? `&branch_id=${branchId}`
    : selectedBranch !== 'select'
      ? `&branch_id=${selectedBranch}`
      : '&branch_id=';

  const {
    data: data2,
    isLoading: isLoading2,
    refetch: refetchReport,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_ATTENDANCE_SERVICE_URL,
    url: `attendance_service/attendance/${
      userRole().isStudent || userRole().isParent ? 'student' : `report`
    }/?school_id=${schoolId}${`&course_id=${selectedCourse}`}${branch_id}${
      userRole().isTeacher
        ? `&teacher_id=${userId}`
        : `&user_id=${selectedChild || user_id}`
    }&limit=${
      rowsPerPage === 'All' ? 'All' : rowsPerPage
    }&offset=${rowsPerPage === 'All' ? 0 : (page - 1) * rowsPerPage}&page=${page}&page_size=${rowsPerPage}&child_limit=7&child_offset=${
      (datesPerPage - 1) * Number(noOfpages)
    }${formatFromDate && `&from_date=${formatFromDate}`}${
      toDate ? `&to_date=${formatToDate}` : '&to_date='
    }${
      selectedClass !== 'select' ? `&class_id=${selectedClass}` : '&class_id='
    }`,
    enabled: selectedCourse !== 'select' || selectedClass !== 'select',
    onSuccess: (res: any) => {
      setTotalDataCount(res?.data?.count);
    },
  });

  const { isLoading: loadClassesForTeacher, mutate: ClassesForTeacher } =
    usePost({
      baseURL: SchoolUrl,
      url: `schools-service/school-classes/teacher/assigned-class`,
      onSuccess: (resp: any) => {
        const res = resp?.data?.response;
        const formatArr =
          res?.map((ele: any) => ({ label: ele.name, value: ele.class_id })) ||
          [];
        setTeacherClassesArray(formatArr);
      },
    });

  const { cData, headerDates, isNext, isPrev } = useMemo(
    () => formatData(data2, page, subjectName),
    [page, fromDate, toDate, data2, selectedClass, selectedCourse]
  );

  const rowsPerPageHandler = (val: number | 'all') => {
    setRecordsPerPage(val);
  };
  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const increaseDates = () => {
    setDatesPerPage(datesPerPage + 7);
  };
  const decreaseDates = () => {
    const aa = datesPerPage - 7;
    setDatesPerPage(aa > 0 ? aa : 1);
  };

  const columns = useMemo(() => {
    if (role.name === USER_TYPE.STUDENT || role.name === USER_TYPE.PARENTS) {
      return [
        {
          label: 'Sr No.',
          id: 'sr_no',
        },
        {
          id: 'subject',
          label: 'Course',
        },
        {
          id: 'AttendanceReport',
          label: headerDates,
        },
        {
          id: 'TotalPresent',
          label: 'Total Days Present',
        },
        {
          id: 'TotalAbsent',
          label: 'Total Days Absent',
        },
      ];
    }
    return [
      {
        label: 'Sr No.',
        id: 'sr_no',
      },
      {
        id: 'StudentFirstname',
        label: 'Student First name',
      },
      {
        id: 'StudentLastname',
        label: 'Student Last name',
      },
      {
        id: 'AttendanceReport',
        label: headerDates,
      },
      {
        id: 'TotalPresent',
        label: 'Total Present',
      },
      {
        id: 'TotalAbsent',
        label: 'Total Absent',
      },
    ];
  }, [role, headerDates]);

  const CLASS_ARRAY =
    (usersRole?.name === TEACHER ? TeacherClassesArray : formatSchoolClasses) ||
    [];

  const compare = (a: any, b: any) => {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  };
  CLASS_ARRAY.sort(compare);

  useEffect(() => {
    if (usersRole?.name === TEACHER && user?.user_profile_id) {
      ClassesForTeacher({
        teacher_id: user?.user_profile_id,
      });
    }
  }, [usersRole, user]);

  useEffect(() => {
    if (selectedClass !== 'select' && selectedCourse !== 'select') {
      refetchReport();
    }
  }, [selectedBranch, selectedClass, selectedChild, selectedCourse, fromDate]);

  return (
    <RouteLayout navBack={true}>
      <div className="flex h-full w-full flex-col">
        <HeaderMenus
          title={`Attendance ${userRole().isTeacher || userRole().isSchoolAdmin || userRole().isBranchAdmin ? 'Reports' : ''}`}
          subtitle={
            userRole().isSuperAdmin
              ? `School : ${
                  schoolData
                    ? schoolData?.school_name
                    : branchData?.school_data.school_name
                }`
              : ''
          }
          subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ''}
          menuArray={ADMIN_TOOLBAR_MENU}
          // handleToolbarAction={handleToolbarAction}
        />

        <AttendanceReportFilters
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          fetchReportData={fetchReportData}
          control={control}
          watch={watch}
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          refetchReport={refetchReport}
        />

        <div className=" wrapperBorder overflow-hidden" ref={componentRef}>
          <SimpleTableAttendanceReport
            columns={columns}
            rows={cData}
            paginateHandler={handlePagination}
            rowsPerPageHandler={rowsPerPageHandler}
            totalPages={noOfpages}
            currentPage={page}
            clickLeft={decreaseDates}
            clickRight={increaseDates}
            recordsPerPage={recordsPerPage}
            isNext={isNext.flag}
            isPrev={isPrev.flag}
            isLoading={isLoading2}
            sortBy={sortBy}
          />
        </div>
      </div>
    </RouteLayout>
  );
}
