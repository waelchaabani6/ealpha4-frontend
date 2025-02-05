import Dropdown from "@component/dropdown/Dropdown";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectSchoolData } from "@shared/store/schoolSlice";
import { useGet } from "@shared/api/useApi";
import DatePicker from "@shared/form/DatePicker";

const AttendanceReportURL = import.meta.env.VITE_APP_ATTENDANCE_SERVICE_URL;
const CourseURL = import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL;
const SchoolURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;

console.log("Attendance Report URL:", AttendanceReportURL);

function AttendanceReportFilters({
  selectedBranch,
  setSelectedBranch,
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
    schoolId,
    branchId,
    role: usersRole,
  } = useSelector(
    (state: {
      user: {
        schoolId: string;
        branchId: string;
        role: { name: string; user_profile_id: string };
      };
    }) => state.user
  );
  const isAdmin =
    usersRole?.name === "School Admin" || usersRole?.name === "Branch Admin";
  const isBranchAdmin = usersRole?.name === "BRANCH_ADMIN";

  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);

  const { data: branchDataResponse } = useGet({
    baseURL: SchoolURL,
    url: `schools-service/school-branches/?limit=100&school_id=${
      schoolData?.id || branchData?.school_data?.id
    }`,
    enabled: !!(schoolData?.id || branchData?.school_data?.id),
    onSuccess: (resp) => {
      setBranches(
        resp.data.response.results.map(({ name, id }) => ({
          label: name,
          value: id,
        }))
      );
    },
  });

  const coursesEndPointUrl = isAdmin
    ? `course-code-service/courses/courses-selection/?school_id=${schoolId}&branch_id=${
        selectedBranch !== "select"
          ? selectedBranch
          : isBranchAdmin
          ? branchId
          : ""
      }`
    : `course-code-service/courses/courses-selection/?school_id=${schoolId}&branch_id=${
        selectedBranch === "select" ? "" : selectedBranch
      }`;

  const { isLoading: isCoursesLoading, refetch: refetchCourses } = useGet({
    baseURL: CourseURL,
    url: coursesEndPointUrl,
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

  const classesEndPointUrl = isAdmin
    ? `schools-service/schools/get-classes?program_id=${
        selectedCourse !== "select" ? selectedCourse : ""
      }&school_id=${schoolId}&class_id=${
        selectedClass !== "select" ? selectedClass : ""
      }&branch_id=${selectedBranch !== "select" ? selectedBranch : ""}`
    : `schools-service/schools/get-classes?program_id=${
        selectedCourse !== "select" ? selectedCourse : ""
      }&school_id=${schoolId}&teacher_id=${
        usersRole?.user_profile_id
      }&class_id=${selectedClass !== "select" ? selectedClass : ""}`;

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
    refetchCourses();
  }, [selectedBranch]);
  useEffect(() => {
    if (selectedCourse) refetchClasses();
  }, [selectedCourse]);
  useEffect(() => {
    if (selectedClass && fromDate && toDate) fetchReportData();
  }, [selectedClass, fromDate, toDate]);

  return (
    <div className="w-full flex flex-wrap gap-4 items-center">
      {!branchData && (
        <Dropdown
          title="Select Branch"
          value={selectedBranch}
          dataArray={[{ label: "Select", value: "" }, ...branches]}
          onChangeHandler={setSelectedBranch}
        />
      )}
      <Dropdown
        title="Select Course"
        value={selectedCourse}
        dataArray={[{ label: "Select", value: "" }, ...courses]}
        onChangeHandler={setSelectedCourse}
      />
      <Dropdown
        title="Select Class"
        value={selectedClass}
        dataArray={[{ label: "Select", value: "" }, ...classes]}
        onChangeHandler={setSelectedClass}
        disabled={!selectedCourse}
      />
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
