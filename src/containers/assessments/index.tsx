import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Button from '@component/button/button';
import Dropdown from '@component/dropdown/Dropdown';
import CustomPagination from '@component/pagination/CustomPagination';
import { ASSESSMENT_TYPE, COMPONENTS, RESULTS_PER_PAGE, TABLE_LABELS } from '@constants/constants';
import RouteLayout from '@layout/routeLayout';
import DeletePopup from '@shared/DeletePopup';
import { useDelete, useGet } from '@shared/api/useApi';
import PageTitle from '@shared/pageTitle';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages, sortData } from '@utility/utility';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

export default function Index() {
  const { user } = useSelector((state: any) => state);
  const navigate = useNavigate();
  const { schoolName } = useParams();
  const ALL: Array<any> = [
    {
      label: 'Select',
      value: 'Select'
    }
  ];

  const handleNavigate = (data: any, type: string) => {
    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    const navState = {
      assignType: type === 'printed' ? 'print-assessment' : ''
    };
    navigate(`/${schoolNameInURL}/assessments/assign/${data?.assessment_id}?name=${data?.assessment_name}${type === 'printed' ? '&type=print-assessment' : ''}`, { state: { navState, page, path: `/${schoolName}/assessments` } });
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

  const [currentCourse, setCurrentCourse] = useState(ALL[0].value);
  const [selectedGrade, setselectedGrade] = useState(ALL[0].value);
  const [selectedCategory, setselectedCategory] = useState(ALL[0].value);
  const [assessmentType, setassessmentType] = useState(ASSESSMENT_TYPE[0]?.value);
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('assessment_name');
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const location = useLocation();

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const actionHandler = (data: any, handlername: string) => {
    if (handlername === 'delete') {
      deleteHandler(data);
    } else if (handlername === 'view') {
      navigate(`preview_question/${data?.id}`, { state: { page, path: `/${schoolName}/assessments` } });
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
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/delete-assessment/${playloadData?.id}/`,
    onSuccess: (response: any) => {
      toast('success', 'Record Deleted successfully');
      fetchAssignments();
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    }
  });

  // Get Courses
  const { isLoading: loadCourses, data: Courses } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/alpha-assessment/courses/`
  });
  const filteredCourses = Courses?.data?.map((ele: any) => ({ label: ele.name, value: ele.id })) || [];

  // Get Grades
  const { isLoading: loadGrades, isRefetching: refetchingGrades, data: Grades } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/alpha-assessment/grades/?course_id=${currentCourse}`,
    enabled: currentCourse !== ALL[0].value
  });

  let filteredGrades = Grades?.data?.response?.map((ele: any) => ({ label: ele.name, value: ele.id })) || [];

  // Get Categories
  const { isLoading: loadCategories, isRefetching: refetchingCategories, data: Categories } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/alpha-assessment/categories/?grade_id=${selectedGrade}`,
    enabled: selectedGrade !== ALL[0].value
  });

  const categoryArrays = Categories?.data?.response?.map((ele: any) => ({ label: ele.name, value: ele.id })) || [];

  let CategoryArr = categoryArrays?.sort(sortData);

  // Get Assessment List
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const assmentFilter = assessmentType === ASSESSMENT_TYPE[0].value ? '' : (assessmentType !== ASSESSMENT_TYPE[1].value);
  const { isLoading: assignmentLoading, refetch: fetchAssignments } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/alpha-assessment/activities/?limit=${rowsPerPage}&offset=${(page - 1) * Number(rowsPerPage)}&ordering=${ordering}&alpha_course=${currentCourse !== ALL[0].value ? currentCourse : ''}&grade_id=${selectedGrade !== ALL[0].value ? selectedGrade : ''}&is_paperscorer_type=${assmentFilter}&category_id=${selectedCategory !== ALL[0].value ? selectedCategory : ''}&user_id=${user?.userId}`,
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
    },
    enabled: false
  });
  const { isLoading: loadSync, refetch: sync } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/fetch-activity-from-learnosity/?user_id=${user?.userId}&domain_name=${window?.location?.hostname}`,
    enabled: false
  });
  // ------------------END API's-----------------------------------------------
  useEffect(() => {
    if (currentCourse === ALL[0].value) {
      filteredGrades = ALL;
      setselectedGrade(ALL[0].value);

      CategoryArr = ALL;
      setselectedCategory(ALL[0].value);
    }
    if (selectedGrade === ALL[0].value) {
      CategoryArr = ALL;
      setselectedCategory(ALL[0].value);
    }
  }, [currentCourse, selectedGrade, selectedCategory]);

  useEffect(() => {
    if (selectedGrade !== ALL[0].value) {
      CategoryArr = ALL;
      setselectedCategory(ALL[0].value);
    }
  }, [selectedGrade]);

  useEffect(() => {
    if (currentCourse !== ALL[0].value) {
      filteredGrades = ALL;
      setselectedGrade(ALL[0].value);

      CategoryArr = ALL;
      setselectedCategory(ALL[0].value);
    }
  }, [currentCourse]);

  // useEffect(() => {
  //   sync();
  // }, []);

  useEffect(() => {
    if (selectedGrade !== ALL[0].value) {
      fetchAssignments();
    }
  }, [rowsPerPage, page, orderBy, order, selectedGrade, assessmentType, selectedCategory]);

  const handlePerPage = (e: any) => {
    setRowsPerPage(e);
  };

  return (
    <RouteLayout navBack={true}>
      <div className="flex flex-col mb-4">
        <div className="h-max py-4">
          <PageTitle title="Alpha Assessments" />
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
              sxClass={{ width: '206px' }}
              loading={loadCourses}
            />
            <Dropdown
              title="Select Grade"
              value={selectedGrade}
              dataArray={[...ALL, ...filteredGrades]}
              onChangeHandler={(d: any) => setselectedGrade(d)}
              loading={loadGrades || refetchingGrades}
              sxClass={{ width: '206px' }}
            />
            <Dropdown
              title="Select Category"
              value={selectedCategory}
              dataArray={[...ALL, ...CategoryArr]}
              onChangeHandler={(d: any) => {
                setselectedCategory(d);
                setPage(1);
              }}
              loading={loadCategories || refetchingCategories}
              sxClass={{ width: '206px' }}
            />
            <Dropdown
              title="Assessment Type"
              value={assessmentType}
              dataArray={ASSESSMENT_TYPE}
              onChangeHandler={(d: any) => {
                setassessmentType(d);
                setPage(1);
              }}
              sxClass={{ width: '206px' }}
            />
            <Dropdown
              title="Result Of Pages"
              value={rowsPerPage}
              dataArray={RESULTS_PER_PAGE}
              onChangeHandler={handlePerPage}
              sxClass={{ width: '206px' }}
            />
            <div className="pt-4 md:pt-8 h-full flex items-center">
              <Link to={`${location?.pathname}/my-assessments`} className="cursor-pointer h-full font-medium underline flex items-center md:border-l-2 px-2 border-gray-300 text-accent">
                My Assessments
              </Link>
              <Link to={`${location?.pathname}/assigned`} className="cursor-pointer h-full font-medium underline flex items-center md:border-l-2 px-2 border-gray-300 text-accent">
                Assigned Assessments
              </Link>
            </div>
          </div>
          <div className="flex gap-[5px]">
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
          {
            selectedGrade !== ALL[0].value
              ? (
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
                  isLoading={assignmentLoading || loadSync || loadingDelete}
                  setPage={setPage}
                />
              )
              : (
                <p className="text-lg text-center italic">Please Select Grade</p>
              )
          }
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
