/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable linebreak-style */
/* eslint-disable operator-linebreak */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
import RouteLayout from "@layout/routeLayout";
import Dropdown from "@component/dropdown/Dropdown";
import DatePicker from "@component/datepicker";
import Button from "@component/button/button";
import AdvanceTable from "@component/AdvancedTable/AdvanceTable";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  TABLE_LABELS,
  COMPONENTS,
  TOOLBAR_LABELS,
  RESULTS_PER_PAGE,
  USER_TYPE,
} from "@constants/constants";
import Wrapper from "@shared/wrapper/Wrapper";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { HeaderMenus } from "@shared/pageHeaderMenu/HeaderMenus";
import { useSelector } from "react-redux";
import { selectSchoolData } from "@shared/store/schoolSlice";
import ReactToPrint from "react-to-print";
import PrintIcon from "@mui/icons-material/Print";
import { useGet, usePost } from "@shared/api/useApi";
import {
  currentUserAcademicDate,
  getNoOfPages,
  incrementDateByOne,
  userRole,
  sortData,
  sortByName,
} from "@utility/utility";
import DebounceInput from "@component/input/DebounceInput";
import toast from "@shared/toast";
import moment from "moment";
import { selectUser } from "@shared/store/userSlice";
import SearchInputWithResults from "@component/input/SearchInputWithResults";
import { useNavigate, useParams } from "react-router-dom";
import { set } from "react-hook-form";

const printButton = () => <PrintIcon />;

const TableColumns = [
  {
    //   align: 'center',
    //   component: COMPONENTS?.checkbox,
    //   selector: 'id',
    //   showInHeader: true
    label: TABLE_LABELS?.SR_NO,
    align: "center",
  },
  // {
  //   label: "Select",
  //   mapper: "Select",
  //   component: COMPONENTS?.checkbox,
  //   selector: "id",
  //   showInHeader: true,
  //   sx: {
  //     display: "flex",
  //     alignItems: "center",
  //   },
  //   cellSx: {
  //     // display: 'flex',
  //     justifyContent: "flex-start",
  //     position: "relative",
  //     left: "0px",
  //   },
  //   elementClass: "flex items-center",
  //   // component: COMPONENTS?.checkbox
  // },
  {
    label: "Student First Name",
    mapper: "StudentFirstName",
    isSort: false,
  },
  {
    label: "Student Last Name",
    mapper: "StudentLastName",
  },
  {
    label: "Grade",
    mapper: "Grade",
  },
  // {
  //   label: 'Status',
  //   mapper: 'Status',
  //   align: 'center',
  // },
  {
    label: "Status",
    mapper: "Status",
    align: "center",
  },
  {
    label: "",
    mapper: "Select",
    component: "custom-checkbox",
    selector: "id",
    showInHeader: true,
    align: "center",
    sx: {
      display: "flex",
      alignItems: "center",
      elementClass: "flex items-center",
      // component: COMPONENTS?.checkbox
    },
  },
];

type Student = {
  student_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
};
function Attendance() {
  const { TEACHER } = USER_TYPE;
  const usersRole = useSelector((state: any) => state?.user?.role);
  const { user } = useSelector((state: any) => state);
  const [tableData, setTableData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<any>("created_at");
  const [order, setOrder] = useState<any>("asc");
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [TeacherClassesArray, setTeacherClassesArray] = useState<any>([]);
  const [selectedBranch, setSelectedBranch] = useState<
    number | null | "select"
  >("select");
  const [selectedClass, setSelectedClass] = useState<
    string | number | null | "select"
  >("select");

  const { role, branchId, schoolId } = useSelector(selectUser);

  const [searchString, setSearchString] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<
    number | null | "select" | ""
  >("select");
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [absentLoader, setAbsentLoader] = useState<boolean>();
  const [presentLoader, setPresentLoader] = useState<boolean>();
  const noOfpages = getNoOfPages(totalDataCount, RESULTS_PER_PAGE?.[0]);
  const componentRef = useRef(null);
  const [courses, setCourses] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Student[]>([]);

  // Define state for selected course
  const [selectedCourse, setSelectedCourse] = useState<string | number>(
    "select"
  );

  // Simulated loading states
  const [loadCoursesForTeacher, setLoadCoursesForTeacher] = useState(false);
  const [loadClassesForCourse, setLoadClassesForCourse] = useState(false);

  // Fake array of courses
  const coursesArray = [
    { label: "Math", value: 1 },
    { label: "Science", value: 2 },
    { label: "English", value: 3 },
    { label: "History", value: 4 },
    { label: "Geography", value: 5 },
  ];
  const classesByCourse = {
    1: [
      { label: "Algebra 101", value: "algebra_101" },
      { label: "Geometry Basics", value: "geometry_basics" },
    ],
    2: [
      { label: "Physics Intro", value: "physics_intro" },
      { label: "Chemistry Basics", value: "chemistry_basics" },
    ],
    3: [
      { label: "Grammar 101", value: "grammar_101" },
      { label: "Literature Basics", value: "literature_basics" },
    ],
    4: [
      { label: "World History", value: "world_history" },
      { label: "Medieval Times", value: "medieval_times" },
    ],
    5: [
      { label: "Physical Geography", value: "physical_geography" },
      { label: "Human Geography", value: "human_geography" },
    ],
  };

  const handleInputSearch = (value: string) => {
    setLoading(true);
    // Simulate an API call
    setTimeout(() => {
      const mockResponse = {
        students: [
          {
            student_id: 101,
            user_id: 1001,
            first_name: "Alice",
            last_name: "Johnson",
          },
          {
            student_id: 102,
            user_id: 1002,
            first_name: "Bob",
            last_name: "Smith",
          },
        ],
      };
      setResults(
        mockResponse.students.filter((student) =>
          `${student.first_name} ${student.last_name}`
            .toLowerCase()
            .includes(value.toLowerCase())
        )
      );
      setLoading(false);
    }, 500);
  };
  const handleCourseChange = (currentCourse: number | string) => {
    setSelectedCourse(currentCourse);
    setSelectedClass("select"); // Reset class selection when a course changes
  };

  const navigate = useNavigate();
  const { schoolName } = useParams();

  const SchoolURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
  const CourseURL = import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL;
  const { data: data1, isLoading: isLoading1 } = useGet({
    baseURL: SchoolURL,
    url: `schools-service/school-branches/?limit=100&school_id=${
      schoolData?.id || branchData?.school_data?.id
    }`,
    enabled: !!(schoolData?.id || branchData?.school_data?.id),
  });
  const branchArr: [] = data1?.data?.response?.results?.sort(sortByName);

  const { isLoading: subjectLoading, refetch: refetchSubjects } = useGet({
    baseURL: SchoolURL,
    url: `schools-service/schools/subject/list/?class_id=${
      selectedClass || ""
    }`,
    enabled: false,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const temp3: any =
        respData?.map((i: any) => ({
          label: i?.name,
          value: i?.id,
        })) || [];
      setCourses([...temp3]);
    },
  });

  const { isLoading: subLoading, refetch: refetchCourses } = useGet({
    baseURL: CourseURL,
    url: `course-code-service/courses/courses-selection/?school_id=${schoolId}&branch_id=${
      selectedBranch === "select" ? "" : selectedBranch
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

  useEffect(() => {
    refetchCourses();
  }, [selectedBranch]);

  useEffect(() => {
    const isAdmin = [
      USER_TYPE.SCHOOL_ADMIN,
      USER_TYPE.BRANCH_ADMIN,
      USER_TYPE.SUPER_ADMIN,
    ].includes(usersRole?.name);
    if (selectedClass !== "select" && isAdmin) {
      refetchSubjects();
    } else if (
      selectedClass !== "select" &&
      usersRole?.name === USER_TYPE.TEACHER
    ) {
      refectSubject();
    }
  }, [selectedClass, selectedSubject]);

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
      branchData || selectedBranch !== "select"
        ? `&branch_name=${branchName}`
        : ""
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

  const subjectName = useMemo(() => {
    const tmp = courses?.find((item: any) => item?.value === selectedSubject);
    return tmp?.label;
  }, [selectedSubject]);

  const formatSelectedDate = useMemo(
    () => moment(selectedDate).format("yyyy-MM-DD"),
    [selectedDate]
  );

  const generatedUrl = `roster-service/student-attendance-list?limit=${10}&school_id=${
    schoolData?.id || branchData?.school_data?.id
  }&subject=${subjectName || ""}&class_name=${className}${
    selectedDate ? `&date=${formatSelectedDate}` : ""
  }${
    branchData
      ? `&branch_id=${branchData?.id}`
      : selectedBranch !== "select"
      ? `&branch_id=${selectedBranch}`
      : ""
  }&offset=${(page - 1) * Number(noOfpages)}${
    searchString ? `&search=${searchString}` : ""
  }`;
  const cleanedUrl = generatedUrl.trim().replace(/\s+/g, " ");

  const { data, isLoading, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_ROSTER_SERVICE_URL,
    url: `${cleanedUrl}`,
    enabled: Boolean(
      (selectedClass !== "select" &&
        selectedSubject !== "select" &&
        selectedDate) ||
        (selectedClass !== "select" &&
          selectedSubject !== "select" &&
          selectedDate &&
          selectedBranch !== "select")
    ),
    onSuccess: (res: any) => {
      setTotalDataCount(res?.data?.response?.count);
    },
  });

  const { isLoading: isLoading3, mutate } = usePost({
    baseURL: import.meta.env.VITE_APP_ROSTER_SERVICE_URL,
    url: "roster-service/create-attendance-data",
    onSuccess: () => {
      refetch();
      const msg = absentLoader
        ? "All absent success"
        : presentLoader
        ? "All present success"
        : "success";
      toast("success", "Attendance Updated Successfully!");
      // setAbsentLoader(false);
      // setPresentLoader(false);
      setBulkSelect([]);
      navigate(`/${schoolName}/attandance/reports`);
    },
    onError: (error: any) => {
      // setAbsentLoader(false);
      // setPresentLoader(false);
      toast("error", error?.response?.data?.message);
    },
  });

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

  const handleOnchange = (id: number) => {
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
          // Array.from(new Set([...bulkSelect, tmpTableData[index]]))
        );
      } else {
        setBulkSelect((prev: number[]) =>
          // prev?.filter((ids: number) => ids !== tmpTableData[index])
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
      Grade: itm?.Grade,
      isChecked: itm.isChecked,
      Status: (
        <div className="flex justify-center">
          <RadioGroup
            row={true}
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={itm?.isPresent}
            // value={
            //   bulkSelect?.length > 0
            //     ? bulkSelect.find((i: any) => i === itm?.id)
            //     : itm?.isPresent
            // }
            // value={
            //   itm?.isPresent ||
            //   bulkSelect.some((item) => item.student === itm?.id)
            // }
            onChange={() => handleOnchange(itm?.id)}
          >
            <FormControlLabel
              value={true}
              control={<Radio color="success" size="small" />}
              label="Present"
              sx={{ marginRight: "20px" }}
            />
            <FormControlLabel
              value={false}
              control={<Radio color="success" size="small" />}
              label="Absent"
            />
          </RadioGroup>
        </div>
      ),
    }));
    tmpTableData.map((itm) => {
      // console.log(bulkSelect);
      // const x = bulkSelect.some((item) => item.student == itm?.id);
      // console.log(x);
      // console.log(bulkSelect.includes.call(itm?.id));
      // const i = bulkSelect.find((i: any) => i.student === itm?.id).present;
      // console.log(i);
    });
    setTableData(bb || []);
  }, [tmpTableData, bulkSelect]);

  useEffect(() => {
    if (data) {
      const aa =
        data?.data?.response?.result?.map((itm: any, index: number) => ({
          id: itm?.id,
          SR_NO: index + 1,
          StudentFirstName: itm?.first_name,
          StudentLastName: itm?.last_name,
          Grade: itm?.class_name,
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

  const submitHandler = () => {
    const dt = bulkSelect?.map((item: any) => {
      const idx = tmpTableData.find((itm: any) => itm.id === item);
      if (idx) {
        const tmp = {
          student: item,
          school_id: schoolData?.id || branchData?.school_data?.id,
          school_class: selectedClass,
          subject: subjectName || "",
          present: idx?.isPresent,
          present_on_date: formatSelectedDate,
        } as any;
        if (branchId) {
          tmp.branch_id = branchId;
        }
        if (selectedBranch !== "select") {
          tmp.branch_id = selectedBranch;
        }
        return tmp;
      }
      return null;
    });
    mutate(dt);
  };

  const toggleAllHandler = (flag = true) => {
    const dt = data?.data?.response?.result?.map((item: any) => {
      const tmp = {
        student: item?.id,
        school_id: schoolData?.id || branchData?.school_data?.id,
        school_class: selectedClass,
        subject: subjectName || "",
        present: flag,
        present_on_date: formatSelectedDate,
      } as any;
      if (branchId) {
        tmp.branch_id = branchId;
      }

      if (selectedBranch !== "select") {
        tmp.branch_id = selectedBranch;
      }
      return tmp;
    });

    // const ids = data?.data?.response?.result?.map((item: any) => item?.id);
    // bulkSelect.find((i: any) => i.student === itm?.id)?.isPresent
    // setBulkSelect(ids);
    // mutate(dt);
  };

  const handleSearch = (value: any) => {
    setSearchString(value);
  };

  const branchSelectHandler = (currentBranch: number) => {
    setSelectedBranch(currentBranch);
    setSelectedClass("select");
    setTableData([]);
  };

  const minStartDate = useMemo(() => {
    const targetDate = incrementDateByOne(currentUserAcademicDate()?.start, -5);
    if (new Date() >= currentUserAcademicDate()?.start) {
      return new Date();
    }
    return targetDate;
  }, [schoolData, branchData]);

  const CLASS_ARRAY =
    (usersRole?.name === TEACHER ? TeacherClassesArray : formatSchoolClasses) ||
    [];

  const ClassArray = CLASS_ARRAY.sort(sortData);

  useEffect(() => {
    if (usersRole?.name === TEACHER && user?.user_profile_id) {
      ClassesForTeacher({
        teacher_id: user?.user_profile_id,
      });
    }
  }, [usersRole, user]);

  const SubjectData = courses.sort(sortData);
  return (
    <RouteLayout navBack={true} overflow={true}>
      <HeaderMenus
        title="Attendance t"
        subtitle={
          userRole().isSuperAdmin
            ? `School : ${
                schoolData
                  ? schoolData?.school_name
                  : branchData?.school_data.school_name
              }`
            : ""
        }
        subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ""}
        menuArray={ADMIN_TOOLBAR_MENU}
        // handleToolbarAction={handleToolbarAction}
      />

      <div className="w-full grid grid-cols-1 lg:grid-cols-4 my-2 gap-2 items-center justify-between">
        <div className="pt-6 w-full">
          {/* <DebounceInput onChange={handleSearch} /> */}
          <SearchInputWithResults
            onChange={handleInputSearch}
            loading={loading}
            results={results}
            renderResultItem={(student: Student) => (
              <span>
                {student.first_name} {student.last_name}
              </span>
            )}
            onResultSelect={(student) =>
              console.log(`Selected student:`, student)
            }
          />
        </div>
        <div className="md:col-span-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {!branchData && !userRole().isTeacher && (
            <Dropdown
              title="Select Branch"
              value={selectedBranch}
              loading={isLoading1}
              dataArray={[
                { label: "Select", value: "select" },
                ...(branchArr?.map((item: any) => ({
                  label: item.name,
                  value: item.id,
                })) || []),
              ]}
              onChangeHandler={branchSelectHandler}
              sxClass={{ width: "100%" }}
            />
          )}
          {/* <Dropdown
            title="Select Class"
            value={selectedClass}
            loading={loadClassesForTeacher}
            dataArray={[{ label: "Select", value: "select" }, ...ClassArray]}
            onChangeHandler={(currentClass: number) =>
              setSelectedClass(currentClass)
            }
            sxClass={{ width: "100%" }}
          /> */}
          <Dropdown
            title="Select Course"
            value={selectedCourse}
            loading={loadCoursesForTeacher}
            dataArray={[{ label: "Select", value: "select" }, ...courses]}
            onChangeHandler={(currentCourse: number | string) =>
              setSelectedCourse(currentCourse)
            }
            sxClass={{ width: "100%" }}
          />
          <Dropdown
            title="Select Class"
            value={selectedClass}
            loading={loadClassesForCourse}
            dataArray={[
              { label: "Select", value: "select" },
              ...(classesByCourse[selectedCourse] || []),
            ]}
            onChangeHandler={(currentClass: string | number) =>
              setSelectedClass(currentClass)
            }
            sxClass={{ width: "100%" }}
            disabled={selectedCourse === "select"} // Disable if no course selected
          />
          {/* <Dropdown
            title="Select Subject"
            value={selectedSubject}
            loading={subjectLoading || subLoading}
            dataArray={[
              { label: "Select", value: "select" },
              ...(SubjectData?.map((item: any) => ({
                label: item.label,
                value: item?.value,
              })) || []),
            ]}
            onChangeHandler={(currentSubject: number) =>
              setSelectedSubject(currentSubject)
            }
            sxClass={{ width: "100%" }}
          /> */}
          <div className="pb-[5px]">
            <DatePicker
              fullWidth={true}
              sxType={1}
              value={!selectedDate ? selectedDate : selectedDate.toString()}
              label="Select Date"
              disabled={false}
              defaultStyle={true}
              disablePast={false}
              disableOld={minStartDate}
              disableFuture={new Date()}
              handlePickerChange={(val: any) => setSelectedDate(val.toDate())}
              error={null}
              shouldDisableDate={() => false}
            />
          </div>
          {/* <div className="sm:mt-[1.6rem]">
            <Button
              className="h-[38px] w-full text-[16px]"
              type="button"
              loading={presentLoader}
              disabled={
                absentLoader ||
                presentLoader ||
                isLoading ||
                tableData?.length < 1
              }
              onClick={() => {
                toggleAllHandler();
                // setPresentLoader(true);
              }}
            >
              Present All
            </Button>
          </div> */}
          {/* <div className="sm:mt-[1.6rem]">
            <Button
              className="h-[38px] w-full text-[16px]"
              type="button"
              loading={absentLoader}
              disabled={
                absentLoader ||
                presentLoader ||
                isLoading ||
                tableData?.length < 1
              }
              onClick={() => {
                toggleAllHandler(false);
                // setAbsentLoader(true);
              }}
            >
              Absent All
            </Button>
          </div> */}
        </div>
      </div>

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
          />
        </Wrapper>
      </div>
      <div className="flex justify-end py-2">
        <Button
          disabled={
            absentLoader || presentLoader || isLoading3 || bulkSelect.length < 1
          }
          onClick={submitHandler}
          loading={isLoading3 && !absentLoader && !presentLoader}
        >
          Submit
        </Button>
      </div>
    </RouteLayout>
  );
}

export default Attendance;
