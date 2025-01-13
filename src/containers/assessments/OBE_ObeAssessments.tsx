/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Button from '@component/button/button';
import Dropdown from '@component/dropdown/Dropdown';
import CustomPagination from '@component/pagination/CustomPagination';
import {
  ASSESSMENT_TYPE,
  COMPONENTS,
  RESULTS_PER_PAGE,
  TABLE_LABELS,
} from '@constants/constants';
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
// eslint-disable-next-line import/no-extraneous-dependencies
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
export default function OBE_ObeAssessments() {
  const { user } = useSelector((state: any) => state);
  const navigate = useNavigate();
  const { schoolName } = useParams();
  const ALL: Array<any> = [
    {
      label: 'Select',
      value: 'Select',
    },
  ];

  const handleNavigate = (data: any, type: string) => {
    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    const navState = {
      assignType: type === 'printed' ? 'print-assessment' : '',
    };
    navigate(
      `/${schoolNameInURL}/obe-assessments/assign/${data?.id}?name=${data?.name}${type === 'printed' ? '&type=print-assessment' : ''}`,
      {
        state: {
          obassess: true,
          navState,
          page,
          path: `/${schoolName}/obe-assessments`,
        },
      }
    );
  };

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
    },
    {
      label: TABLE_LABELS?.ASSESSMENT_NAME,
      mapper: 'name',
      isSort: true,
    },
    {
      label: 'Online',
      mapper: 'online',
      align: 'center',
    },
    {
      label: TABLE_LABELS?.ACTION,
      align: 'flex-start',
      bodyAlign: 'left',
      component: COMPONENTS?.view,
      showInHeader: false,
    },
    /*    {
      label: 'Printed',
      mapper: 'printed',
      align: 'center'
    }, */
    /* {
      label: TABLE_LABELS?.ACTION,
      colspan: 2,
      align: 'center',
      bodyAlign: 'right',
      component: COMPONENTS?.view,
      showInHeader: false
    }, */
    /*    {
      bodyAlign: 'left',
      component: COMPONENTS?.delete,
      showInHeader: false
    } */
  ];
  const [tableData, setTableData] = useState<any>([]);
  const [adminDeleteDialog, setAdminDeleteDialog] = useState(false);

  const [currentCourse, setCurrentCourse] = useState(ALL[0].value);
  const [selectedGrade, setselectedGrade] = useState(ALL[0].value);
  const [selectedTag, setselectedTag] = useState(ALL[0].value);
  const [selectedCategory, setselectedCategory] = useState(ALL[0].value);
  const [assessmentType, setassessmentType] = useState(
    ASSESSMENT_TYPE[0]?.value
  );
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [totalDataCount, setTotalDataCount] = useState(0);

  const [order, setOrder] = useState<any>('asc');
  const [orderBy, setOrderBy] = useState<any>('name');
  // const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const location = useLocation();
  const usersRole = useSelector((state: any) => state?.user?.role);

  const [fillCourses, setFillCourses] = useState<any>([]);
  const [fillGrades, setFillGrades] = useState<any>([]);
  const [fillTags, setFillTags] = useState<any>([]);

  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const [page, setPage] = useState(1);

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const actionHandler = (data: any, handlername: string) => {
    let assessId = null;
    if (data) {
      assessId = data?.id;
    }

    if (handlername === 'delete') {
      deleteHandler(data);
    } else if (handlername === 'view') {
      const currentDate = new Date();
      const schoolName = decodeURIComponent(location.pathname.split('/')[1]);
      const targetPagePath = `/${schoolName}/obe-assessments`; // Update this to the path of the page you want to redirect to
      const targetPageUrl = `${window.location.origin}${targetPagePath}`; // Constructs the full URL
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
      console.log('helloe heree ', encodeURIComponent(encryptedData))
      window.open(`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/views/${assessId}?token=${encodeURIComponent(encryptedData)}`, '_blank');
    }
  };

  const deleteHandler = (row: any) => {
    setPlayloadData({
      id: row?.id,
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
    url: `assessments-service/delete-assessment/${playloadData?.id}/`,
    onSuccess: (response: any) => {
      toast('success', 'Record Deleted successfully');
      fetchAssignments();
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
  });

  // Get Courses
  // const { isLoading: loadCourses, data: Courses } = useGet({
  //   baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
  //   url: `assessments-service/alpha-assessment/courses/`,
  // });

  const OBESASS_API_KEY = import.meta.env.VITE_OBESASS_API_KEY;
  const obeassessUrl = import.meta.env.VITE_APP_OBEASSESS_SDK_URL;

  let filteredCourses;

  const handlePerPage = (e: any) => {
    setPage(1);
    setRowsPerPage(e);
  };

  const getAllCourses = () => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'X-Authorization': OBESASS_API_KEY,
        User: user?.userId,
        Role: usersRole?.name,
      },
    };

    fetch(`${obeassessUrl}subject/`, requestOptions)
      .then((response) => response.json())
      // eslint-disable-next-line no-shadow
      .then((Courses) => {
        filteredCourses =
          Courses?.data?.map((ele: any) => ({
            label: ele.name,
            value: ele.id,
          })) || [];
        setFillCourses(filteredCourses);
      })
      .catch((error) => {});
  };

  const getAllGrades = () => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'X-Authorization': OBESASS_API_KEY,
        User: user?.userId,
        Role: usersRole?.name,
      },
    };
    const getCourseName = fillCourses.filter(
      (x: any) => x.value === currentCourse
    );
    fetch(
      `${obeassessUrl}grade/?subject=${getCourseName[0]?.label || ''}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        // eslint-disable-next-line no-shadow
        const filteredCourses =
          result?.data?.map((ele: any) => ({
            label: ele.name,
            value: ele.id,
          })) || [];
        setFillGrades(filteredCourses);
      })
      // eslint-disable-next-line no-console
      .catch((error) => console.log('error', error));
  };

  const getAllTags = () => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'X-Authorization': OBESASS_API_KEY,
        User: user?.userId,
        Role: usersRole?.name,
      },
    };

    const getCourseName = fillCourses.filter(
      (x: any) => x.value === currentCourse
    );
    const getGradeName = fillGrades.filter(
      (x: any) => x.value === selectedGrade
    );

    fetch(
      `${obeassessUrl}tag/?grade=${getGradeName[0]?.label}&subject=${getCourseName[0]?.label}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        // eslint-disable-next-line no-shadow
        const filteredTags =
          result?.data?.map((ele: any) => ({
            label: ele.name,
            value: ele.id,
          })) || [];
        setFillTags(filteredTags);
      })
      // eslint-disable-next-line no-console
      .catch((error) => console.log('error', error));
  };

  // Get Assessment List
  const sort_by = orderBy ?? 'name';
  const directoon = order ?? 'asc';
  const fetchAssignments = () => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'X-Authorization': OBESASS_API_KEY,
        User: user?.userId,
        Role: usersRole?.name,
      },
    };
    const getCourseName = fillCourses.filter(
      (x: any) => x.value === currentCourse
    );
    const getGradeName = fillGrades.filter(
      (x: any) => x.value === selectedGrade
    );

    const getTagName = fillTags.filter((x: any) => x.value === selectedTag);

    fetch(
      `${obeassessUrl}assessment/?grade=${getGradeName[0]?.label}&subject=${getCourseName[0]?.label}&tags=${getTagName[0]?.label || ''}&per_page=${rowsPerPage}&page=${page}&sort_by=${sort_by}&order=${directoon}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((res) => {
        setTotalDataCount(res?.pagination?.total);

        const accData = res?.data;
        const newTableData = accData?.map((item: any) => {
          // const schoolNameInURL = decodeURIComponent(
          //   location.pathname.split('/')[1]
          // );
          // const link = `/${schoolNameInURL}/assessments/assigned/assessment-report/${item?.code}?assessment=${item?.name}`;

          const temp = {
            ...item,
            online: (
              <Button onClick={() => handleNavigate(item, 'online')}>
                Assign
              </Button>
            ),
            /*
            printed: (item?.is_paperscorer_type) ? <Button onClick={() => handleNavigate(item, 'printed')}>Assign</Button> : null,
*/
            status: (
              <Button onClick={() => handleNavigate(item, 'online')}>
                Assign
              </Button>
            ),
            assessment_name: item?.name || '',
          };
          return temp;
        });

        setTableData(newTableData);
      })
      // eslint-disable-next-line no-console
      .catch((error) => console.log('error', error));
  };

  useEffect(() => {
    if (selectedGrade !== ALL[0].value) {
      fetchAssignments();
    }
  }, [
    rowsPerPage,
    page,
    orderBy,
    order,
    selectedGrade,
    selectedTag,
    assessmentType,
    selectedCategory,
  ]);

  useEffect(() => {
    getAllCourses();
    if (currentCourse) {
      getAllGrades();
    }

    if (currentCourse && selectedGrade !== ALL[0].value) {
      getAllTags();
    }
  }, [currentCourse, selectedGrade]);

  return (
    <RouteLayout navBack={true}>
      <div className="flex flex-col mb-4">
        <div className="h-max py-4">
          <PageTitle title="OBE Assessments" />
        </div>

        <div className="flex justify-between flex-col md:flex-row items-center gap-y-4 md:gap-y-0">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Dropdown
              title="Select Course"
              value={currentCourse}
              dataArray={[...ALL, ...fillCourses]}
              onChangeHandler={(d: any) => {
                setCurrentCourse(d);
                setPage(1);
              }}
            />
            <Dropdown
              title="Select Grade"
              value={selectedGrade}
              dataArray={[...ALL, ...fillGrades]}
              onChangeHandler={(d: any) => {
                setselectedGrade(d);
                setPage(1);
              }}
            />

            <Dropdown
              title="Select Category"
              value={selectedTag}
              dataArray={[...ALL, ...fillTags]}
              onChangeHandler={(d: any) => {
                setselectedTag(d);
                setPage(1);
              }}
            />

            <Dropdown
              title="Result Of Pages"
              value={rowsPerPage}
              dataArray={RESULTS_PER_PAGE}
              onChangeHandler={handlePerPage}
            />
          </div>
        </div>
      </div>
      <div className="wrapperBorder">
        <Wrapper>
          {selectedGrade !== ALL[0].value ? (
            <AdvanceTable
              maxHeight={580}
              tableData={tableData}
              headerRows={TableColumns}
              setPage={setPage}
              totalPages={noOfpages}
              paginateHandler={handlePagination}
              currentPage={page}
              rowsPerPage={rowsPerPage}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              order={order}
              setOrder={setOrder}
              actionHandler={actionHandler}
              isLoading={loadingDelete} // assignmentLoading || loadSync ||
            />
          ) : (
            <p className="text-lg text-center italic">Please Select Grade</p>
          )}
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
