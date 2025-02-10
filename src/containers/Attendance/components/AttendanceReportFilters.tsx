import Dropdown from "@component/dropdown/Dropdown";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectSchoolData } from "@shared/store/schoolSlice";
import { useGet } from "@shared/api/useApi";
import DatePicker from "@shared/form/DatePicker";
import { selectUser } from "@shared/store/userSlice";
import { USER_TYPE } from "@constants/constants";
import { sortByName } from "@utility/utility";

const AttendanceReportURL = import.meta.env.VITE_APP_ATTENDANCE_SERVICE_URL;
const CourseURL = import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL;
const SchoolURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;

function AttendanceReportFilters({
  selectedBranch,
  setSelectedBranch,
  selectedChild,
  setSelectedChild,
  selectedCourse,
  setSelectedCourse,
  selectedClass,
  setSelectedClass,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  fetchReportData,
  control,
  watch,
}) {
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const {
    userId,
    role: usersRole,
    schoolId,
    branchId,
  } = useSelector(selectUser);

  const isParent = usersRole?.name === USER_TYPE.PARENTS;
  const isAdmin =
    usersRole?.name === USER_TYPE.SCHOOL_ADMIN ||
    usersRole?.name === USER_TYPE.BRANCH_ADMIN;
  const isBranchAdmin = usersRole?.name === USER_TYPE.BRANCH_ADMIN;
  const isStudent = usersRole?.name === USER_TYPE.STUDENT;
  const isParentOrStudent = isParent || isStudent;

  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [childrenData, setChildrenData] = useState([]);

  useEffect(() => {
    if (isBranchAdmin) {
      setSelectedBranch(branchId);
    }
  }, [branchId]);

  useEffect(() => {
    if (isStudent) {
      setSelectedChild(userId);
    }
  }, [userId]);

  // Fetching Children for Parent Role
  const { isLoading: childrenLoading, refetch: childrenFetch } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/parent-student-details/${userId}/`,
    enabled: isParent,
    onSuccess: (res) => {
      const students = res?.data?.response?.students || [];
      const formattedChildren = students.map((child) => ({
        label: `${child.first_name} ${child.last_name}`,
        value: child.id,
      }));
      setChildrenData(formattedChildren);
    },
  });

  // Fetching Branch Data
  const { data: branchDataResponse } = useGet({
    baseURL: SchoolURL,
    url: `schools-service/school-branches/?limit=100&school_id=${schoolId}`,
    enabled: !!(schoolId && (isBranchAdmin || isAdmin)),
    onSuccess: (resp) => {
      setBranches(
        resp.data.response.results.map(({ name, id }) => ({
          label: name,
          value: id,
        }))
      );
    },
  });

  // Fetching Courses
  const coursesEndPointUrl = isAdmin
    ? `course-code-service/courses/courses-selection/?school_id=${schoolId}&branch_id=${
        selectedBranch !== "select"
          ? selectedBranch
          : isBranchAdmin
          ? branchData?.id
          : ""
      }`
    : `course-code-service/courses/courses-selection/?school_id=${schoolId}&branch_id=${
        selectedBranch === "select" ? "" : selectedBranch
      }&student_id=${selectedChild}`;

  const { isLoading: isCoursesLoading, refetch: refetchCourses } = useGet({
    baseURL: CourseURL,
    url: coursesEndPointUrl,
    enabled: true,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const formattedCourses = respData.results.map((course: any) => ({
        label: course.short_name,
        value: course.program_id,
      }));
      setCourses([...formattedCourses]);
    },
  });

  // Fetching Classes
  const classesEndPointUrl = isAdmin
    ? `schools-service/schools/get-classes?program_id=${
        selectedCourse !== "select" ? selectedCourse : ""
      }&school_id=${schoolId}&class_id=${
        selectedClass !== "select" ? selectedClass : ""
      }&branch_id=${selectedBranch !== "select" ? selectedBranch : ""}`
    : `schools-service/schools/get-classes?program_id=${
        selectedCourse !== "select" ? selectedCourse : ""
      }&school_id=${schoolId}&student_id=${selectedChild}`;

  const { data: classesResponse, refetch: refetchClasses } = useGet({
    baseURL: SchoolURL,
    url: classesEndPointUrl,
    enabled: false,
    onSuccess: (resp) =>
      setClasses(
        resp.data.results.map(({ class_name, class_id }) => ({
          label: class_name,
          value: class_id,
        }))
      ),
  });

  useEffect(() => {
    if (selectedBranch) refetchCourses();
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedCourse !== "select") refetchClasses();
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedClass && fromDate && toDate) fetchReportData();
  }, [selectedClass, fromDate, toDate]);

  const branchSelectHandler = (currentBranch: number) => {
    setSelectedBranch(currentBranch);
  };

  const courseSelectHandler = (currentCourse: number) => {
    setSelectedCourse(currentCourse);
    setSelectedClass("select");
  };

  const branchArr: [] =
    branchDataResponse?.data?.response?.results?.sort(sortByName);

  return (
    <div className="w-full flex flex-wrap gap-4 items-center mt-5 mb-5">
      {isParent && (
        <Dropdown
          title="Select Child"
          value={selectedChild}
          dataArray={[...childrenData]}
          displayEmpty={true}
          onChangeHandler={(option) => setSelectedChild(option || "select")}
          loading={childrenLoading}
          sxClass={{
            width: "250px",
          }}
        />
      )}
      {isAdmin && (
        <Dropdown
          title="Select Branch"
          value={selectedBranch}
          dataArray={[
            { label: "Select", value: "select" },
            ...(branchArr?.map((item: any) => ({
              label: item.name,
              value: item.id,
            })) || []),
          ]}
          onChangeHandler={branchSelectHandler}
          sxClass={{
            width: "250px",
          }}
        />
      )}

      <Dropdown
        title="Select Course"
        value={selectedCourse}
        dataArray={[{ label: "Select", value: "select" }, ...courses]}
        onChangeHandler={(option) => setSelectedCourse(option || "select")}
        sxClass={{
          width: "250px",
        }}
      />
      {!isParentOrStudent && (
        <Dropdown
          title="Select Class"
          value={selectedClass}
          dataArray={[{ label: "Select", value: "select" }, ...classes]}
          onChangeHandler={(option) => setSelectedClass(option || "select")}
          disabled={selectedCourse === "select"}
          sxClass={{
            width: "250px",
          }}
        />
      )}

      <div>
        <DatePicker
          control={control}
          name="start_date"
          label="Start Date"
          sxClass={{
            backgroundColor: "white",
            border: "none",
            borderRadius: "4px",
            borderColor: "transparent",
            outline: "none",
          }}
          padding={true}
          disableOld={true}
          disableFuture={watch("end_date")}
          required={true}
        />
      </div>
      <div>
        <DatePicker
          control={control}
          name="end_date"
          label="End Date"
          sxClass={{
            backgroundColor: "white",
            border: "none",
            borderRadius: "4px",
            borderColor: "transparent",
            outline: "none",
          }}
          padding={true}
          disableOld={true}
          required={true}
        />
      </div>
    </div>
  );
}

export default AttendanceReportFilters;
