import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Dropdown from '@component/dropdown/Dropdown';
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import CustomPagination from '@component/pagination/CustomPagination';
import { COMPONENTS, TABLE_LABELS, ASSESSMENT_TYPE, USER_TYPE, RESULTS_PER_PAGE } from '@constants/constants';
import RouteLayout from '@layout/routeLayout';
import { selectSchoolData } from '@shared/store/schoolSlice';
import PageTitle from '@shared/pageTitle';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import DeletePopup from '@shared/DeletePopup';
import { getNoOfPages } from '@utility/utility';
import { useEffect, useState } from 'react';
import Button from '@component/button/button';
import { useSelector } from 'react-redux';
import { useGet, usePost, useDelete } from '@shared/api/useApi';
import encryptMessage from '@utility/encrypt';

interface Message {
  key: string;
  user_name: string;
  user_id: string;
  assessment_id: string | null;
  date_time: Date;
  role: String;
  redirectionPath: String;
}

export default function OBE_MyAssessments() {
  const { SCHOOL_ADMIN, BRANCH_ADMIN, TEACHER } = USER_TYPE;
  const userRole = useSelector((state: any) => state?.user?.role);
  const { schoolName } = useParams();
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const { user } = useSelector((state: any) => state);
  const navigate = useNavigate();
  const ALL: Array<any> = [
    {
      label: 'All',
      value: 'Select'
    }
  ];

  const handleNavigate = (data: any, type: string) => {
    console.log(data, 'cataclicked')
    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    const navState = {
      assignType: type === 'printed' ? 'print-assessment' : ''
    };
    navigate(`/${schoolNameInURL}/obe-assessments/assign/${data?.obeasses_id}?name=${data?.assessment_name}${type === 'printed' ? '&type=print-assessment' : ''}`, { state: { obassess: true, navState, page, path: `/${schoolName}/obe-assessments/my-assessments` } });
  };

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: TABLE_LABELS?.ASSESSMENT_NAME,
      mapper: 'assessment_name',
      isSort: true
    },
    {
      label: 'Online',
      mapper: 'online',
      align: 'center'
    },
    {
      label: 'Printed',
      mapper: 'printed',
      align: 'center'
    },
    {
      label: TABLE_LABELS?.ACTION,
      colspan: 2,
      align: 'center',
      bodyAlign: 'right',
      component: COMPONENTS?.view,
      showInHeader: false
    },
    {
      bodyAlign: 'left',
      component: COMPONENTS?.delete,
      showInHeader: false
    }
  ];
  const [tableData, setTableData] = useState<any>([]);
  const [adminDeleteDialog, setAdminDeleteDialog] = useState(false);

  const [currentCourse, setCurrentCourse] = useState('Select');
  const [selectedGrade, setselectedGrade] = useState('Select');
  const [selectedCategory, setselectedCategory] = useState('Select');
  const [assessmentType, setassessmentType] = useState(ASSESSMENT_TYPE[0]?.value);
  const [TeacherClassesArray, setTeacherClassesArray] = useState<any>([]);
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const location = useLocation();

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const actionHandler = (data: any, handlername: string) => {
    const obeasses_id = data?.obeasses_id;
    let assessId = null;
    if (data) {
      assessId = data?.obeasses_id;
    }

    if (handlername === 'delete') {
      deleteHandler(data);
    } else if (handlername === 'view') {
      // navigate(`/${schoolName}/assessments/preview_myassessment_question/${data?.id}`, { state: { page, obeasses_id, path: `/${schoolName}/assessments/my-assessments` } });
      const currentDate = new Date();
      const schoolName = decodeURIComponent(location.pathname.split('/')[1]);
      const targetPagePath = `/${schoolName}/obe-assessments/my-assessments`; // Update this to the path of the page you want to redirect to
      const targetPageUrl = `${window.location.origin}${targetPagePath}`; // Constructs the full URL
      const domain_name = import.meta.env.VITE_OBESASS_domain_name;

      const message: Message = {
        key: import.meta.env.VITE_OBESASS_API_ENC_KEY as string,
        user_name: `${user?.first_name} ${user?.last_name}`,
        user_id: user?.user_ting,
        assessment_id: assessId || null,
        date_time: currentDate,
        role: user?.role?.name,
        redirectionPath: targetPageUrl
      };
      const encryptedData = encryptMessage(JSON.stringify(message));
      window.open(`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/views/${assessId}?token=${encodeURIComponent(encryptedData)}&domain_name=${domain_name}`, '_blank');
    }
  };

  const deleteHandler = (row: any) => {
    setPlayloadData({
      id: row?.id
    });
    setAdminDeleteDialog(true);
  };

  const handleAdminDelete = () => {
    setAdminDeleteDialog(false);
    mutateDelete(playloadData);
  };

  // ------------------API----------------------------------------------------
  // Delete Admin
  const { isLoading: loadingDelete, mutate: mutateDelete } = useDelete({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/delete-assessment/${playloadData?.id}/?type=hard`,
    onSuccess: (response: any) => {
      toast('success', 'Record Deleted successfully');
      fetchAssignments();
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    }
  });

  const { isLoading: loadCourses, data: Courses } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assigned_courses/${user?.userId}/details/?all_courses=all`
  });
  const filteredCourses = Courses?.data?.response?.filter((i: any) => i?.name)?.map((ele: any) => ({ label: ele.name, value: ele.name })) || [];

  const { isLoading: loadCategories, data: Categories } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?ordering=-created_at&limit=500&selection=Category`
  });
  const categoryArrays = Categories?.data?.response?.results?.map((ele: any) => ({ label: ele.content, value: ele.content })) || [];

  const { isLoading: loadClassesForSchool, data: ClassesForSchool } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?limit=1000&school_id=${schoolData?.id || branchData?.school_data?.id}&branch_name=${branchData?.name || ''}`,
    enabled: !!((userRole?.name === SCHOOL_ADMIN && schoolData?.id) || (userRole?.name === BRANCH_ADMIN || branchData?.school_id?.id))
  });
  const formatSchoolClasses = ClassesForSchool?.data?.response?.results?.map((ele: any) => ({ label: ele.name, value: ele.name })) || [];

  const { isLoading: loadClassesForTeacher, mutate: ClassesForTeacher } = usePost({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/teacher/assigned-class`,
    onSuccess: (resp: any) => {
      const res = resp?.data?.response;
      const formatArr = res?.map((ele: any) => ({ label: ele.name, value: ele.name })) || [];
      setTeacherClassesArray(formatArr);
    }
  });

  // Get Assessment List
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const assmentFilter = assessmentType === ASSESSMENT_TYPE[0].value ? '' : (assessmentType !== ASSESSMENT_TYPE[1].value);
  const { isLoading: assignmentLoading, isRefetching, refetch: fetchAssignments } = useGet({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/my_assessments_list/?limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}&courses_name=${currentCourse !== 'Select' ? currentCourse : ''}&grade_name=${selectedGrade !== 'Select' ? selectedGrade : ''}&is_paperscorer_type=${assmentFilter}&category=${selectedCategory !== 'Select' ? selectedCategory : ''}&user_id=${user?.userId}`,
    onSuccess: (res: any) => {
      const accData = res?.data?.response;
      const respData = accData?.results;

      const newTableData = respData?.map((item: any) => {
        const temp = {
          ...item,
          online: <Button onClick={() => handleNavigate(item, 'online')}>Assign</Button>,
          printed: (item?.is_paperscorer_type) ? <Button onClick={() => handleNavigate(item, 'printed')}>Assign</Button> : null
        };
        return temp;
      });

      setTotalDataCount(accData.count);
      setTableData(newTableData);
    }
  });
  const { isLoading: loadSync, refetch: sync } = useGet({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/fetch-activity-from-learnosity/?user_id=${user?.userId}&domain_name=${window?.location?.hostname}`,
    enabled: false,
    onSuccess: (resp: any) => {
      fetchAssignments();
    }
  });
    // ------------------END API's-----------------------------------------------

  useEffect(() => {
    if (userRole?.name === TEACHER && user?.user_profile_id) {
      ClassesForTeacher({
        teacher_id: user?.user_profile_id
      });
    }
  }, [userRole, user]);

  // useEffect(() => {
  //   sync();
  //   if (location?.state?.page) {
  //     setPage(location?.state?.page);
  //   }
  // }, []);

  useEffect(() => {
    // sync();
    fetchAssignments();
  }, [rowsPerPage, page, orderBy, order, currentCourse, selectedGrade, assessmentType]);

  const CLASS_ARRAY = (userRole?.name === TEACHER ? TeacherClassesArray : formatSchoolClasses) || [];

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

  const handlePerPage = (e: any) => {
    setRowsPerPage(e);
  };

  return (
    <RouteLayout navBack={true}>
      <div className="flex flex-col mb-4">
        <div className="h-max py-4">
          <PageTitle title="My OBE Assessments" />
        </div>
        <div className="flex justify-between flex-col md:flex-row items-center gap-y-4 md:gap-y-0">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Dropdown
              title="Select Course"
              value={currentCourse}
              dataArray={[...ALL, ...filteredCourses]}
              onChangeHandler={(d: any) => {
                setCurrentCourse(d);
                setPage(1);
              }}
              loading={loadCourses}
              sxClass={{ width: '206px', marginRight: '5px' }}
            />
            <Dropdown
              title="Select Class"
              value={selectedGrade}
              dataArray={[...ALL, ...CLASS_ARRAY]}
              onChangeHandler={(d: any) => {
                setselectedGrade(d);
                setPage(1);
              }}
              loading={loadClassesForTeacher || loadClassesForSchool}
              sxClass={{ width: '206px', marginRight: '5px' }}
            />
            <Dropdown
              title="Select Category"
              value={selectedCategory}
              dataArray={[...ALL, ...categoryArrays]}
              onChangeHandler={(d: any) => {
                setselectedCategory(d);
                setPage(1);
              }}
              loading={loadCategories}
              sxClass={{ width: '206px', marginRight: '5px' }}
            />
            <Dropdown
              title="Assessment Type"
              value={assessmentType}
              dataArray={ASSESSMENT_TYPE}
              onChangeHandler={(d: any) => {
                setassessmentType(d);
                setPage(1);
              }}
              sxClass={{ width: '206px', marginRight: '5px' }}
            />
            <Dropdown
              title="Result Of Pages"
              value={rowsPerPage}
              dataArray={RESULTS_PER_PAGE}
              onChangeHandler={handlePerPage}
              sxClass={{ width: '206px', marginRight: '5px' }}
            />
            <div className="pt-4 md:pt-8 h-full flex items-center">
              <Link to={`/${schoolName}/assessments/create-new-assessment`} className="cursor-pointer h-full font-medium underline flex items-center md:border-l-2 px-2 border-gray-300 text-accent">
                Create Assessment
              </Link>
              <Link to={`/${schoolName}/assessments/assigned`} className="cursor-pointer h-full font-medium underline flex items-center md:border-l-2 px-2 border-gray-300 text-accent">
                Assigned Assessments
              </Link>
            </div>
          </div>
          <div className="flex gap-[5px]">
            {/* <Button loading={loadSync} onClick={() => { sync(); }}>Sync</Button> */}
            <CustomPagination
              totalPages={noOfpages}
              paginateHandler={handlePagination}
              currentPage={page}
            />
          </div>
        </div>
      </div>
      <div className="wrapperBorder">
        <Wrapper>
          <AdvanceTable
            maxHeight={580}
            tableData={tableData}
            headerRows={TableColumns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            rowsPerPage={rowsPerPage}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            actionHandler={actionHandler}
            isLoading={assignmentLoading || loadSync || isRefetching || loadingDelete}
            setPage={setPage}
          />
        </Wrapper>
      </div>
      {/* Delete Assignment */}
      <DeletePopup
        title="Delete Assessment"
        description="Are you sure you want to delete Assessment?"
        open={adminDeleteDialog}
        setOpen={setAdminDeleteDialog}
        handleDelete={handleAdminDelete}
      />
    </RouteLayout>
  );
}
