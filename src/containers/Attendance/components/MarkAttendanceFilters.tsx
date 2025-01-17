/* eslint-disable linebreak-style */
/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable operator-linebreak */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
import Dropdown from '@component/dropdown/Dropdown';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RESULTS_PER_PAGE, USER_TYPE } from '@constants/constants';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useGet, usePost, useRAWGetApi } from '@shared/api/useApi';
import { getNoOfPages, userRole, sortData, sortByName } from '@utility/utility';

import moment from 'moment';
import { selectUser } from '@shared/store/userSlice';
import SearchInputWithResults from '@component/input/SearchInputWithResults';
import AttendanceCalednar from '../AttendanceCalednar';
import { Student } from '../types';

const SchoolURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
const CourseURL = import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL;

type MarkAttendanceFiltersProps = {
  searchResults?: any;
  setSearchResults?: any;
  setSelectedBranch: React.Dispatch<React.SetStateAction<number | 'select'>>;
  selectedBranch: number | 'select';
  setCurrentClassName: React.Dispatch<React.SetStateAction<string>>;
  setTableData: React.Dispatch<React.SetStateAction<any>>;
  setCourses: React.Dispatch<React.SetStateAction<any>>;
  courses: any;
  setTmpTableData: React.Dispatch<React.SetStateAction<any>>;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
  selectedDate: Date | null;
};

function MarkAttendanceFilters({
  searchResults,
  setSearchResults,
  setSelectedBranch,
  selectedBranch,
  setCurrentClassName,
  setTableData,
  setCourses,
  courses,
  setTmpTableData,
  setSelectedDate,
  selectedDate,
}: MarkAttendanceFiltersProps) {
  const { TEACHER } = USER_TYPE;
  const usersRole = useSelector((state: any) => state?.user?.role);
  const { user } = useSelector((state: any) => state);
  const [TeacherClassesArray, setTeacherClassesArray] = useState<any>([]);

  const [selectedClass, setSelectedClass] = useState<
    string | number | null | 'select'
  >('select');

  const { schoolId } = useSelector(selectUser);

  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<
    number | null | 'select' | ''
  >('select');
  const { schoolData, branchData } = useSelector(selectSchoolData);

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [listOfStudents, setListOfStudents] = useState<any[]>([]);
  const [selectedClassStudents, setSelectedClassStudents] = useState([]);

  // Define state for selected course
  const [selectedCourse, setSelectedCourse] = useState<string | number>(
    'select'
  );

  // Simulated loading states
  const [loadCoursesForTeacher, setLoadCoursesForTeacher] = useState(false);
  const [loadClassesForCourse, setLoadClassesForCourse] = useState(false);

  const handleInputSearch = (value: string) => {
    setLoading(true);
    setTimeout(() => {
      const res = listOfStudents
        .flatMap((item) => item.students)
        .filter((student) =>
          `${student.first_name} ${student.last_name}`
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      setSearchResults(res);
      setLoading(false);
    }, 500);
  };

  const { data: data1, isLoading: isLoading1 } = useGet({
    baseURL: SchoolURL,
    url: `schools-service/school-branches/?limit=100&school_id=${
      schoolData?.id || branchData?.school_data?.id
    }`,
    enabled: !!(schoolData?.id || branchData?.school_data?.id),
  });

  const branchArr: [] = data1?.data?.response?.results?.sort(sortByName);

  const { isLoading: subLoading, refetch: refetchCourses } = useGet({
    baseURL: CourseURL,
    url: `course-code-service/courses/courses-selection/?school_id=${schoolId}&branch_id=${
      selectedBranch === 'select' ? '' : selectedBranch
    }&user_id=${user?.userId}`,
    enabled: false,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const formattedCourses = respData.results.map((course: any) => ({
        label: course.short_name,
        value: course.program_id,
      }));
      setCourses([...formattedCourses]);
    },
  });

  const { isLoading: classLoading, refetch: refetchClasses } = useGet({
    baseURL: SchoolURL,
    url: `schools-service/schools/get-classes?program_id=${selectedCourse}&school_id=${schoolId}&teacher_id=${user?.user_profile_id}`,
    enabled: false,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.results; // Adjust based on the actual API response structure

      const formattedClasses = respData.map((classItem: any) => ({
        label: classItem.class_name, // Replace `class_name` with the correct key if different
        value: classItem.class_id, // Replace `class_id` with the correct key if different
      }));
      const studentsByClass = respData.map((classItem: any) => ({
        class_id: classItem.class_id,
        students: classItem.student_profile, // Only store `student_profile`
      }));

      setClasses([...formattedClasses]);
      setListOfStudents(studentsByClass);
    },
  });

  useEffect(() => {
    refetchCourses();
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedCourse !== 'select') {
      refetchClasses();
    }
  }, [selectedCourse]);

  useEffect(() => {
    const isAdmin = [
      USER_TYPE.SCHOOL_ADMIN,
      USER_TYPE.BRANCH_ADMIN,
      USER_TYPE.SUPER_ADMIN,
    ].includes(usersRole?.name);
    if (selectedClass !== 'select' && isAdmin) {
      refetchClasses();
    } else if (
      selectedClass !== 'select' &&
      usersRole?.name === USER_TYPE.TEACHER
    ) {
      refetchCourses();
    }
  }, [selectedClass]);

  const branchName = useMemo(
    () =>
      data1?.data?.response?.results.find(
        (itm: any) => itm.id === selectedBranch || branchData?.id
      )?.name || branchData?.name,
    [selectedBranch, branchData]
  );

  const { data: data2, isLoading: isLoading2 } = useGet({
    baseURL: SchoolURL,
    url: `schools-service/school-classes/?limit=1000&school_id=${
      schoolData?.id || branchData?.school_data?.id
    } ${
      branchData || selectedBranch !== 'select'
        ? `&branch_name=${branchName}`
        : ''
    }`,
    enabled: !!(schoolData?.id || branchData?.school_data?.id),
  });

  const formatSchoolClasses =
    data2?.data?.response?.results?.map((item: any) => ({
      label: item.name,
      value: item.id,
    })) || [];

  formatSchoolClasses.sort(sortData);

  const className = useMemo(
    () =>
      (usersRole?.name === TEACHER
        ? TeacherClassesArray
        : formatSchoolClasses
      )?.find((itm: any) => itm.value === selectedClass)?.label,
    [selectedClass]
  );

  useEffect(() => {
    setCurrentClassName(className);
  }, [className]);

  // const subjectName = useMemo(() => {
  //   const tmp = courses?.find((item: any) => item?.value === selectedSubject);
  //   return tmp?.label;
  // }, [selectedSubject]);

  // const formatSelectedDate = useMemo(
  //   () => moment(selectedDate).format('yyyy-MM-DD'),
  //   [selectedDate]
  // );

  const { isLoading: loadClassesForTeacher, mutate: ClassesForTeacher } =
    usePost({
      baseURL: SchoolURL,
      url: `schools-service/school-classes/teacher/assigned-class`,
      onSuccess: (resp: any) => {
        const res = resp?.data?.response;
        const formatArr =
          res?.map((ele: any) => ({ label: ele.name, value: ele.class_id })) ||
          [];
        formatArr.sort(sortData);
        setTeacherClassesArray(formatArr);
      },
    });

  // const handleSearch = (value: any) => {
  //   setSearchString(value);
  // };

  const branchSelectHandler = (currentBranch: number) => {
    setSelectedBranch(currentBranch);
    setSelectedClass('select');
    setTableData([]);
  };

  useEffect(() => {
    if (usersRole?.name === TEACHER && user?.user_profile_id) {
      ClassesForTeacher({
        teacher_id: user?.user_profile_id,
      });
    }
  }, [usersRole, user]);

  useEffect(() => {
    if (selectedClassStudents) {
      const studentsData =
        selectedClassStudents?.map((itm: any, index: number) => ({
          id: itm?.student_id,
          SR_NO: index + 1,
          StudentFirstName: itm?.first_name,
          StudentLastName: itm?.last_name,
          Grade: selectedClass,
          isChecked: false,
          isPresent: false,
        })) || [];
      setTmpTableData(studentsData);
    }
  }, [selectedClassStudents]);

  // Todo: delete this afeter testing
  const roasterServiceBaseURL = import.meta.env.VITE_APP_ROSTER_SERVICE_URL;
  const { userId } = useSelector(selectUser);

  // const [eventID, setEventID] = useState<any>();
  const { data: eventData, refetch: refreshEvents } = useRAWGetApi({
    baseURL: roasterServiceBaseURL,
    url: `roster-service/events/?user_id=${userId}&school_id=${schoolId}`,
    cacheTime: 0,
  });

  return (
    <>
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 my-2 gap-2 items-center justify-between">
        <div className="pt-6 w-full">
          <SearchInputWithResults
            onChange={handleInputSearch}
            loading={loading}
            results={searchResults}
            renderResultItem={(student: Student) => (
              <span>
                {student.first_name} {student.last_name}
              </span>
            )}
            onResultSelect={(student) => {
              // console.log(`Selected student:`, student);
            }}
          />
        </div>

        <div className="md:col-span-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {!branchData && !userRole().isTeacher && (
            <Dropdown
              title="Select Branch"
              value={selectedBranch}
              loading={isLoading1}
              dataArray={[
                { label: 'Select', value: 'select' },
                ...(branchArr?.map((item: any) => ({
                  label: item.name,
                  value: item.id,
                })) || []),
              ]}
              onChangeHandler={branchSelectHandler}
              sxClass={{ width: '100%' }}
            />
          )}

          <Dropdown
            title="Select Course"
            value={selectedCourse}
            loading={loadCoursesForTeacher}
            dataArray={[{ label: 'Select', value: 'select' }, ...courses]}
            onChangeHandler={(currentCourse: number | string) =>
              setSelectedCourse(currentCourse)
            }
            sxClass={{ width: '100%' }}
          />

          <Dropdown
            title="Select Class"
            value={selectedClass}
            loading={loadClassesForCourse}
            dataArray={[{ label: 'Select', value: 'select' }, ...classes]}
            onChangeHandler={(currentClass: string | number) => {
              setSelectedClass(currentClass);
              setSelectedClassStudents(
                listOfStudents.find((item) => item.class_id === currentClass)
                  ?.students
              );
            }}
            sxClass={{ width: '100%' }}
            disabled={selectedCourse === 'select'} // Disable if no course selected
          />

          <div className="pb-[5px]">
            <AttendanceCalednar
              eventData={eventData}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default MarkAttendanceFilters;
