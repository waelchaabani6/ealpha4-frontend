/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
import RouteLayout from '@layout/routeLayout';
import Button from '@component/button/button';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TABLE_LABELS,
  TOOLBAR_LABELS,
  RESULTS_PER_PAGE,
  USER_TYPE,
} from '@constants/constants';
import Wrapper from '@shared/wrapper/Wrapper';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import { useGet, usePost } from '@shared/api/useApi';
import {
  currentUserAcademicDate,
  getNoOfPages,
  incrementDateByOne,
  userRole,
} from '@utility/utility';
import toast from '@shared/toast';
import moment from 'moment';
import { selectUser } from '@shared/store/userSlice';
import { useNavigate, useParams } from 'react-router-dom';
import MarkAttendanceFilters from './components/MarkAttendanceFilters';
import { Student } from './types';
import StatusComponent from './components/StatusComponent';

const printButton = () => <PrintIcon />;

const TableColumns = [
  {
    label: TABLE_LABELS?.SR_NO,
    align: 'center',
  },

  {
    label: 'Student First Name',
    mapper: 'StudentFirstName',
    isSort: false,
  },
  {
    label: 'Student Last Name',
    mapper: 'StudentLastName',
  },
  {
    label: 'Class',
    mapper: 'Class',
  },
  // {
  //   label: 'Status',
  //   mapper: 'Status',
  //   align: 'center',
  // },

  {
    label: '',
    mapper: 'Select',
    component: 'custom-checkbox',
    selector: 'id',
    showInHeader: true,
    align: 'center',
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
];

function Attendance() {
  const usersRole = useSelector((state: any) => state?.user?.role);
  const { SCHOOL_ADMIN, BRANCH_ADMIN } = USER_TYPE;

  const [tableData, setTableData] = useState<any>([]);
  const [withredirection, setWithredirection] = useState(false);
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [order, setOrder] = useState<any>('asc');
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [abcentBulkSelect, setAbcentBulkSelect] = useState<any>([]);
  const [selectedBranch, setSelectedBranch] = useState<
    number | null | 'select'
  >('select');
  const [selectedClass, setSelectedClass] = useState<number | null | 'select'>(
    'select'
  );
  const [selectedClassName, setSelectedClassName] = useState<string | null>('');

  const AttendanceUrl = import.meta.env.VITE_APP_ATTENDANCE_SERVICE_URL;
  const { branchId, schoolId } = useSelector(selectUser);
  const [searchString, setSearchString] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [totalDataCount, setTotalDataCount] = useState(0);

  const noOfpages = getNoOfPages(totalDataCount, RESULTS_PER_PAGE?.[0]);
  const componentRef = useRef(null);
  const [courses, setCourses] = useState<any>([]);

  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [currentClassName, SetCurrentClassName] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string | number>(
    'select'
  );
  const isAdmin =
    usersRole?.name === SCHOOL_ADMIN || usersRole?.name === BRANCH_ADMIN;
  const isBranchAdmin = usersRole?.name === BRANCH_ADMIN;

  // useEffect(() => {
  //   if (selectedClass === "select" && results.length === 0) {
  //     setSelectedClassStudents([]);
  //   }
  // }, [selectedClassStudents]);
  const { user } = useSelector((state: any) => state);
  const navigate = useNavigate();
  const { schoolName } = useParams();
  const formatSelectedDate = useMemo(
    () => moment(selectedDate).format('yyyy-MM-DD'),
    [selectedDate]
  );

  const generatedUrl = `roster-service/student-attendance-list?limit=${10}&school_id=${
    schoolData?.id || branchData?.school_data?.id
  }&subject=${currentClassName || ''}&class_name=${currentClassName}${
    selectedDate ? `&date=${formatSelectedDate}` : ''
  }${
    branchData
      ? `&branch_id=${branchData?.id}`
      : selectedBranch !== 'select'
        ? `&branch_id=${selectedBranch}`
        : ''
  }&offset=${(page - 1) * Number(noOfpages)}${
    searchString ? `&search=${searchString}` : ''
  }`;
  const cleanedUrl = generatedUrl.trim().replace(/\s+/g, ' ');

  const { data, isLoading, refetchhh } = useGet({
    baseURL: import.meta.env.VITE_APP_ROSTER_SERVICE_URL,
    url: `${cleanedUrl}`,
    enabled: false,
    onSuccess: (res: any) => {
      setTotalDataCount(res?.data?.response?.count);
    },
  });

  const MarkAttendanceEndpointUrl = isAdmin
    ? `attendance_service/attendance/mark/?course_id=${selectedCourse}&date=${moment(
        selectedDate
      ).format(
        'YYYY-MM-DD'
      )}&class_id=${selectedClass}&school_id=${schoolId}&branch_id=${
        isBranchAdmin ? branchId : ''
      }`
    : `attendance_service/attendance/mark/?course_id=${selectedCourse}&date=${moment(
        selectedDate
      ).format('YYYY-MM-DD')}&teacher_id=${
        user?.user_profile_id
      }&class_id=${selectedClass}&school_id=${schoolId}`;

  const { isLoading: isLoading3, mutate } = usePost({
    baseURL: AttendanceUrl,
    url: MarkAttendanceEndpointUrl,
    onSuccess: () => {
      toast('success', 'Attendance Updated Successfully!');
      setBulkSelect([]);
      setAbcentBulkSelect([]);

      if (withredirection) {
        navigate(`/${schoolName}/attandance/reports`);
      }
    },
    onError: (error: any) => {
      toast('error', error?.response?.data?.message);
    },
  });

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

  const handleSelection = (params: any) => {
    setBulkSelect(params);
  };

  const handleDeSelection = (params: any) => {
    setAbcentBulkSelect(params);
  };

  const handleOnchange = (id: number) => {
    console.log('id is', id);
    const index = tmpTableData.findIndex((itm: any) => itm.id === id);
    if (index > -1) {
      const oldD = data?.data?.response?.result[index].is_present;
      const newD = !tmpTableData[index].isPresent;
      setTmpTableData([
        ...tmpTableData.slice(0, index),
        {
          ...tmpTableData[index],
          isPresent: newD,
        },
        ...tmpTableData.slice(index + 1),
      ]);
      if (oldD !== newD) {
        setBulkSelect(
          Array.from(new Set([...bulkSelect, tmpTableData[index].id]))
        );
      } else {
        setBulkSelect((prev: number[]) =>
          prev?.filter((ids: number) => ids !== tmpTableData[index].id)
        );
      }
    }
  };

  const [tmpTableData, setTmpTableData] = useState<any[]>([]);

  useEffect(() => {
    const bb = tmpTableData?.map((itm: any, index: number) => ({
      id: itm?.id,
      SR_NO: index + 1,
      StudentFirstName: itm?.StudentFirstName,
      StudentLastName: itm?.StudentLastName,
      Class: selectedClassName || '',
      isChecked: itm.isChecked,
      Status: <StatusComponent itm={itm} handleOnchange={handleOnchange} />,
    }));

    setTableData(bb || []);
  }, [tmpTableData]);

  useEffect(() => {
    if (data) {
      const aa =
        data?.data?.response?.result?.map((itm: any, index: number) => ({
          id: itm?.id,
          SR_NO: index + 1,
          StudentFirstName: itm?.first_name,
          StudentLastName: itm?.last_name,
          Class: selectedClassName,
          isChecked: false,
          isPresent: itm?.is_present,
        })) || [];
      setTmpTableData(aa);
    }
  }, [data]);

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  function submitFunc() {
    if (!selectedDate) {
      toast('error', 'Please select a date before submitting attendance.');
      return;
    }

    const studentsData = tmpTableData
      ?.map((item: any) => {
        if (item) {
          return {
            student_id: item.id,
            status: bulkSelect.includes(item.id)
              ? 'present'
              : abcentBulkSelect.includes(item.id)
                ? 'absent'
                : 'present',
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null values

    if (studentsData.length === 0) {
      toast('error', 'No students selected for attendance.');
      return; // Prevent submission if no students are selected
    }

    const payload = {
      students: studentsData,
    };

    console.log('submit data', payload);

    mutate(payload);
  }

  const submitHandler = () => {
    submitFunc();
    setWithredirection(false);
  };

  const submitAndExitHandler = () => {
    submitFunc();
    setWithredirection(true);
  };

  const toggleAllHandler = (flag = true) => {
    console.log('here toggle all');
    const dt = data?.data?.response?.result?.map((item: any) => {
      const tmp = {
        student: item?.id,
        school_id: schoolData?.id || branchData?.school_data?.id,
        school_class: selectedClass,
        // subject: subjectName || '',
        present: flag,
        present_on_date: formatSelectedDate,
      } as any;
      if (branchId) {
        tmp.branch_id = branchId;
      }

      if (selectedBranch !== 'select') {
        tmp.branch_id = selectedBranch;
      }
      return tmp;
    });
  };

  const minStartDate = useMemo(() => {
    const targetDate = incrementDateByOne(currentUserAcademicDate()?.start, -5);
    if (new Date() >= currentUserAcademicDate()?.start) {
      return new Date();
    }
    return targetDate;
  }, [schoolData, branchData]);

  const { attendanceData, isLoadingAttendanceData, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_ATTENDANCE_SERVICE_URL,
    url: `/attendance_service/attendance/history/?course_id=${selectedCourse}&date=${moment(
      selectedDate
    ).format(
      'YYYY-MM-DD'
    )}&class_id=${selectedClass}&school_id=${schoolId}&branch_id=${
      isBranchAdmin ? branchId : ''
    }`,
    enabled: false,
    onSuccess: (res: any) => {
      console.log(res);
      // setTotalDataCount(res?.data?.response?.count);
    },
  });

  useEffect(() => {
    refetch();
  }, [selectedDate]);

  useEffect(() => {
    if (attendanceData) {
      const aa =
        attendanceData?.data?.response?.result?.map(
          (itm: any, index: number) => ({
            id: itm?.id,
            SR_NO: index + 1,
            StudentFirstName: itm?.first_name,
            StudentLastName: itm?.last_name,
            Class: selectedClassName,
            isChecked: false,
            isPresent: itm?.is_present,
          })
        ) || [];
      setTmpTableData(aa);
    }
  }, [attendanceData]);

  return (
    <RouteLayout navBack={true} overflow={true}>
      <HeaderMenus
        title="Attendance"
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

      <MarkAttendanceFilters
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        setCurrentClassName={SetCurrentClassName}
        setTableData={setTableData}
        setCourses={setCourses}
        courses={courses}
        setTmpTableData={setTmpTableData}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        selectedClassName={selectedClassName}
        setSelectedClassName={setSelectedClassName}
      />

      <div className="bg-white" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
            isLoading={isLoading}
            tableData={tableData}
            headerRows={TableColumns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            rowsPerPage={RESULTS_PER_PAGE?.[0]}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            setPage={setPage}
            setBulkSelect={handleSelection}
            maxHeight={620}
            bulkSelect={bulkSelect}
            setAbcentBulkSelect={handleDeSelection}
            abcentBulkSelect={abcentBulkSelect}
            toggelAll={toggleAllHandler}
          />
        </Wrapper>
      </div>

      <div className="flex gap-3 justify-end">
        <div className="flex justify-end py-2">
          <Button
            disabled={
              isLoading3 ||
              (bulkSelect.length < 1 && abcentBulkSelect.length < 1) ||
              tmpTableData.length !==
                bulkSelect.length + abcentBulkSelect.length
            }
            onClick={submitHandler}
            loading={isLoading3}
            tooltipMessage="Please submit status to the remaining students first"
          >
            Submit
          </Button>
        </div>

        <div className="flex justify-end py-2">
          <Button
            disabled={
              isLoading3 ||
              (bulkSelect.length < 1 && abcentBulkSelect.length < 1) ||
              tmpTableData.length !==
                bulkSelect.length + abcentBulkSelect.length
            }
            onClick={submitAndExitHandler}
            loading={isLoading3}
            tooltipMessage="Please submit status to the remaining students first"
          >
            Submit and exit
          </Button>
        </div>
      </div>
    </RouteLayout>
  );
}

export default Attendance;
