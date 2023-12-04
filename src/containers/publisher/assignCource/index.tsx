/* eslint-disable no-console */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Dropdown from '@component/dropdown/Dropdown';
import DebounceInput from '@component/input/DebounceInput';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import { useDelete, useGet, usePatch, usePost } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import toast from '@shared/toast';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import Button from '@component/button/button';
import { CustomAutoComplete } from '@component/autoComplete/autoComplete';
import CustomPagination from '../../../components/pagination/CustomPagination';
import { COMPONENTS, RESULTS_PER_PAGE, TABLE_ASSIGNEDCOURCE, TABLE_LABELS, TOOLBAR_LABELS } from '../../../constants/constants';
import Wrapper from '../../../shared/wrapper/Wrapper';
import { getNoOfPages } from '../../../utilities/utility';
import RouteLayout from '../../layout/routeLayout';

const printButton = () => <PrintIcon />;

const AssignCource = (): JSX.Element => {
  const componentRef = useRef(null);
  let noOfpages = 1;
  const TableColumns = [
    {
      label: TABLE_ASSIGNEDCOURCE?.SELECTALL,
      align: 'center',
      component: COMPONENTS?.checkbox,
      selector: 'id',
      showInHeader: true
    },
    {
      label: '',
      isSort: false,
      mapper: '',
      isAdd: true
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.ASSIGNEDUSERS,
      isSort: true,
      mapper: 'assigned_user'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.COURCE,
      mapper: 'courses_name'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.REGION,
      mapper: 'courses_region'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.SCHOOL,
      isSort: true,
      mapper: 'school_name'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.BRANCH,
      isSort: true,
      mapper: 'branch_name'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.ACCESS_FROM,
      isSort: true,
      mapper: 'access_from',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.ACCESS_TO,
      isSort: true,
      mapper: 'access_to',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.STATUS,
      mapper: 'status',
      align: 'center',
      // colspan: 2,
      // bodyAlign: 'right',
      component: COMPONENTS?.switch,
      showInHeader: false
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.ACTION,
      mapper: 'Action',
      align: 'left',
      component: COMPONENTS?.delete,
      showInHeader: false
    }
  ];
  const subTableHeader = [
    {
      align: 'center',
      component: COMPONENTS?.checkbox,
      selector: 'id',
      showInHeader: true
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.ASSIGNEDUSERS,
      align: 'center',
      mapper: 'assigned_user'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.COURCE,
      align: 'center',
      mapper: 'course_name'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.REGION,
      isSort: true,
      mapper: 'course_region'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.SCHOOL,
      isSort: true,
      mapper: 'school_name'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.BRANCH,
      isSort: true,
      mapper: 'branch_name'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.ACCESS_FROM,
      isSort: true,
      mapper: 'access_from',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.ACCESS_TO,
      isSort: true,
      mapper: 'access_to',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.STATUS,
      mapper: 'status',
      align: 'center',
      // colspan: 2,
      // bodyAlign: 'right',
      component: COMPONENTS?.switch,
      showInHeader: false
    },
    {
      label: TABLE_ASSIGNEDCOURCE?.ACTION,
      mapper: 'status',
      align: 'left',
      component: COMPONENTS?.delete,
      showInHeader: false
    }
  ];
  const navigate = useNavigate();
  const ALL = {
    label: 'All',
    value: 'All'
  };
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [tableData, setTableData] = useState<any>([]);
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [tempCSVData, setTempCSVData] = useState<[]>([]);
  const [csvData, setCsvData] = useState<[]>([]);
  const [arrayRegions, setArrayRegions] = useState<any>([ALL]);
  const [regions, setRegions] = useState<string>('All');
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [selectedSchoolId, setSelectedSchoolId] = useState();
  const [schoolArray, setSchoolArray] = useState<any>([ALL]);
  const [courseArray, setCourseArray] = useState<any>([ALL]);
  const [branchArray, setBranchArray] = useState<any>([ALL]);
  const [selectBranch, setSelectBranch] = useState('All');
  const [selectCourse, setSelectCourse] = useState('All');
  const [searchString, setSearchString] = useState('');
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [courseInputVal, setCourseInputVal] = useState<string | undefined>('');
  noOfpages = getNoOfPages(totalDataCount, rowsPerPage);

  const [order, setOrder] = useState<any>('des');
  const [orderBy, setOrderBy] = useState<any>('created_at');

  const headers = [
    TABLE_ASSIGNEDCOURCE?.ASSIGNEDUSERS,
    TABLE_ASSIGNEDCOURCE?.COURCE,
    TABLE_ASSIGNEDCOURCE?.REGION,
    TABLE_ASSIGNEDCOURCE?.SCHOOL,
    TABLE_ASSIGNEDCOURCE?.BRANCH,
    TABLE_ASSIGNEDCOURCE?.ACCESS_FROM,
    TABLE_ASSIGNEDCOURCE?.ACCESS_TO,
    TABLE_ASSIGNEDCOURCE?.STATUS
  ];

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };

  const handelSendEmail = () => {
    mutateEmail('email');
  };

  const statusHandler = (e: any, data: object | any) => {
    let payload = {};
    if ('course_name' in data) {
      payload = {
        data_list: [
          {
            id: data?.id,
            is_active: !data?.status
          }
        ]
      };
      setPlayloadData({
        apicall: 'change-status',
        payload
      });
    } else {
      payload = {
        data_list: [
          {
            id: data?.id,
            status: !data?.status
          }
        ]
      };
      setPlayloadData({
        apicall: 'change-status-all',
        payload
      });
    }
  };

  const tableReset = () => {
    setPage(1);
    setTableData([]);
    setTotalDataCount(0);
    setBulkSelect([]);
  };

  const handleDelete = () => {
    const payload = {
      course_code_ids: bulkSelect
    };
    setBulkSelect([]);
    bulkDeleteAssignedCourse(payload);
  };

  // Toolbar Email
  const { isLoading: emailLoaded, mutate: mutateEmail } = usePost({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assign/pdf-download/`,
    onSuccess: (response: any) => {
      toast('success', response?.data?.message || 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    }
  });

  const { isLoading: regionsLoading, refetch: regionsFetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?ordering=-created_at&limit=30&offset=${0}&selection=Region`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results;
      const body: any = [];
      resp?.map((i: any) => {
        body.push(
          {
            label: i?.content,
            value: i?.content
          }
        );
        return true;
      });
      setArrayRegions([ALL, ...body]);
    },
    onError: () => { }
  });

  const { isLoading: schoolListLoading, refetch: schoolList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/get-schools/?limit=1000&ordering=name`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results;
      const body: any = [];
      resp?.map((i: any) => {
        body.push(
          {
            id: i?.id,
            label: i?.name,
            value: i?.name
          }
        );
        return true;
      });
      setSchoolArray([ALL, ...body]);
    },
    onError: () => { }
  });

  const { isLoading: courseListLoading, data: courseList } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/?ordering=name${courseInputVal !== undefined ? `&search=${courseInputVal}&limit=50` : ''}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results;
      const body: any = [];
      resp?.map((i: any) => {
        body.push(
          {
            label: i?.name,
            value: i?.name
          }
        );
        return true;
      });
      setCourseArray([...body]);
    },
    onError: () => { }
  });

  const { isLoading: branchListLoading, data: branchList } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/branch-list/?school_id=${selectedSchoolId}`,
    enabled: !!selectedSchoolId,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      const body: any = [];
      resp?.map((i: any) => {
        body.push(
          {
            label: i?.name,
            value: i?.name
          }
        );
        return true;
      });
      setBranchArray([ALL, ...body]);
    },
    onError: () => { }
  });

  const { isLoading: loadingDeleteAssignCourse, mutate: mutateDeleteAssignCourse } = useDelete({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assign-course/${playloadData?.id}/delete/`,
    onSuccess: (response: any) => {
      setPlayloadData({});
      refetch();
      toast('success', 'Course deleted successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  const { isLoading: loadingAllDeleteAssignCourse, mutate: mutateAllDeleteAssignCourse } = useDelete({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assign/${playloadData?.id}/delete/`,
    onSuccess: (response: any) => {
      setPlayloadData({});
      refetch();
      toast('success', 'Course deleted successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  const { isLoading: loadingBulkDeleteAssignedCourse, mutate: bulkDeleteAssignedCourse } = useDelete({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assign/bulk-selection/delete/`,
    onSuccess: (response: any) => {
      refetch();
      toast('success', 'Courses deleted successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  // Status Update : Course
  const { isLoading: loadingStatus, mutate: mutateAssignCourseStatus } = usePost({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assign/change-status/`,
    onSuccess: (response: any) => {
      setPlayloadData({});
      refetch();
      toast('success', 'Status Updated successfully');
    },
    onError: ({ response }: any) => {
      refetch();
      toast('error', response?.statusText || 'Error');
    }
  });

  // Status Update : Course
  const { isLoading: loadingAllStatus, mutate: mutateAllAssignCourseStatus } = usePatch({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assign/edit/`,
    onSuccess: (response: any) => {
      setPlayloadData({});
      refetch();
      toast('success', 'Status Updated successfully');
    },
    onError: ({ response }: any) => {
      refetch();
      toast('error', response?.statusText || 'Error');
    }
  });

  const temps = (rowsPerPage === 'all') ? totalDataCount : rowsPerPage;
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isLoading, isRefetching, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/assign/?limit=${temps}&offset=${(page - 1) * Number(temps)}${searchString ? `&search=${searchString}` : ''}${regions !== 'All' ? `&region=${regions}` : ''}${selectedSchool !== 'All' ? `&school_name=${selectedSchool}` : ''}${selectBranch !== 'All' ? `&branch_name=${selectBranch}` : ''}${selectCourse !== 'All' ? `&courses_name=${selectCourse}` : ''}&ordering=${ordering}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const body: any = [];
      if (respData?.length) {
        setTotalDataCount(accData?.count);
        const newtableData = respData?.map((item: any): any => {
          const allCourses = item?.user_assigned_courses?.map((obj: any) => obj.course.name).filter((name: any) => name).join(', ');
          const allRegions = item?.user_assigned_courses?.map((obj: any) => obj.course.course_region).filter((region: any) => region).join(', ');
          body.push([
            item?.assigned_user,
            allCourses,
            allRegions,
            item?.school_name,
            item?.branch_name,
            item?.access_from,
            item?.access_to,
            item?.status
          ]);
          let temp = { ...item, courses_name: allCourses, courses_region: allRegions };
          if (temp?.user_assigned_courses?.length) {
            const subData = temp?.user_assigned_courses.map((i: any) => {
              const newD = {
                id: i?.id,
                assigned_user: item?.assigned_user,
                course_name: i?.course?.name,
                course_region: i?.course?.course_region,
                school_name: item?.school_name,
                branch_name: item?.branch_name,
                access_from: item?.access_from,
                access_to: item?.access_to,
                status: i?.is_active
              };
              return newD;
            });
            delete subData.user_assigned_courses;
            temp = { ...temp, subData };
          }
          return temp;
        });
        setTempCSVData(body);
        setCsvData(body);
        setTableData(newtableData);
      } else {
        tableReset();
      }
    },
    onError: ({ response }: any) => {
      tableReset();
    },
    enabled: false
  });

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.EMAIL,
      icon: (emailLoaded) ? <Loader size={20} /> : <EmailIcon />
    },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Assign Course Code List.csv"
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

  useEffect(() => {
    refetch();
  }, [rowsPerPage, page, regions, searchString, orderBy, order, selectedSchool, selectBranch, selectCourse]);

  useEffect(() => {
    if (Object.keys(playloadData).length) {
      if (playloadData?.apicall === 'change-status-all') {
        mutateAllAssignCourseStatus(playloadData?.payload);
      } else if (playloadData?.apicall === 'change-status') {
        mutateAssignCourseStatus(playloadData?.payload);
      } else if (playloadData?.apicall === 'delete-course-all') {
        mutateAllDeleteAssignCourse();
      } else if (playloadData?.apicall === 'delete-course') {
        mutateDeleteAssignCourse();
      }
    }
  }, [playloadData]);

  const list = (data: any[]): JSX.Element[] => data?.map((item: any, index: number) => (
    <li key={item.id} data-target={index}>{item.name}</li>
  ));

  const onSelectSchool = (school: any) => {
    const schoolName: any = schoolArray.find((ele: any) => ele?.value === school);
    setSelectedSchoolId(schoolName?.id);
    setSelectedSchool(school);
  };

  const deleteHandler = (data: any) => {
    if ('course_name' in data) {
      setPlayloadData({
        apicall: 'delete-course',
        id: data?.id
      });
    } else {
      setPlayloadData({
        apicall: 'delete-course-all',
        id: data?.id
      });
    }
  };

  const handlePerPage = (e: any) => {
    setPage(1);
    setRowsPerPage(e);
  };

  return (
    <RouteLayout>
      <HeaderMenus
        title="Assigned Course Code"
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col relative ">
        <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div>
            <DebounceInput
              onChange={(e) => setSearchString(e)}
              loading={isLoading}
            />
          </div>
          <Dropdown
            title="Sort by: Region"
            value={regions}
            dataArray={arrayRegions}
            onChangeHandler={(value) => setRegions(value)}
          />
          <Dropdown
            title="Sort by: School"
            value={selectedSchool}
            dataArray={schoolArray}
            onChangeHandler={onSelectSchool}
          />
          <Dropdown
            title="Sort by: Branch"
            value={selectBranch}
            dataArray={branchArray}
            onChangeHandler={(value) => setSelectBranch(value)}
          />
          <CustomAutoComplete
            list={courseArray}
            setDebounceValue={(e: string) => { if (!e) { setCourseInputVal(undefined); setSelectCourse('All'); } else { setCourseInputVal(e); } }} //
            value={courseInputVal}
            isLoading={courseListLoading}
            targetKey="label"
            onSelect={(val: { label: string }) => { setSelectCourse(val.label); }}
            error={true}
            label="Sort By: Course"
            name="auto"
            disabled={false}
            parentClass="Custome_autoComplete"
          />
          <Dropdown
            title="Result Of Pages"
            value={rowsPerPage}
            dataArray={RESULTS_PER_PAGE}
            onChangeHandler={handlePerPage}
          />
        </div>
        <CustomPagination
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
        />
        <div className="relative self-end xl:self-auto">
          <Button disabled={!bulkSelect.length} onClick={handleDelete}> Delete </Button>
        </div>
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
            subTableHeader={subTableHeader}
            setBulkSelect={setBulkSelect}
            bulkSelect={bulkSelect}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            statusHandler={statusHandler}
            deleteHandler={deleteHandler}
            isLoading={isLoading || loadingDeleteAssignCourse || loadingAllDeleteAssignCourse || loadingStatus || loadingAllStatus || isRefetching || loadingBulkDeleteAssignedCourse}
          />
        </Wrapper>
      </div>
      {/* Delete Assign course */}
    </RouteLayout>
  );
};

export default AssignCource;
