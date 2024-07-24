import { useState, useEffect, useRef, useMemo } from 'react';
import ReactToPrint from 'react-to-print';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import PrintIcon from '@mui/icons-material/Print';
import Loader from '@shared/loader';
import { useNavigate, useLocation } from 'react-router-dom';
import DebounceInput from '@component/input/DebounceInput';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import toast from '@shared/toast';
import { CSVLink } from 'react-csv';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { useGet, usePatch, api, usePost } from '@shared/api/useApi';
import moment from 'moment';
import RouteLayout from '@layout/routeLayout';
import Dropdown from '@component/dropdown/Dropdown';
import {
  RESULTS_PER_PAGE,
  COMPONENTS,
  TABLE_COURCES,
  TOOLBAR_LABELS,
} from '@constants/constants';
import CustomPagination from '@component/pagination/CustomPagination';
import { getNoOfPages } from '@utility/utility';
import Wrapper from '@shared/wrapper/Wrapper';

type DropDownType = {
  name: string;
  dataArray: { label: string; value: number | string }[];
};

const printButton = () => <PrintIcon />;

const ManageCourses = (): JSX.Element => {
  const componentRef = useRef(null);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [selectData, setSelectData] = useState<{ [key: string]: string }>({});
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [tableData, setTableData] = useState<any>([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [statusChangeId, setStatusChangeId] = useState<number | null>(null);
  const [load, setLoad] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [dynamicDropdown, setDynamicDropdown] = useState<DropDownType[]>([]);
  const [searchString, setSearchString] = useState('');
  const [dropdownHeaders, setDropdownHeaders] = useState([]);
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const [csvData, setCsvData] = useState<[]>([]);
  const [categiries, setCategiries] = useState([
    { name: 'Category' },
    { name: 'Course' },
    { name: 'Grade' },
    { name: 'Component' },
    { name: 'Volume' },
  ]);

  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');

  const headers = [
    TABLE_COURCES?.SR_NO,
    TABLE_COURCES?.CourceName,
    'Subject',
    'Grade',
    'Category',
    'Component',
    'Volume',
    // ...dropdownHeaders
  ];

  const TableColumns = [
    {
      label: TABLE_COURCES?.SR_NO,
      align: 'center',
    },
    {
      label: TABLE_COURCES?.CourceName,
      isSort: true,
      mapper: 'name',
    },
    {
      label: TABLE_COURCES?.Category,
      isSort: true,
      mapper: 'Category',
    },
    {
      label: TABLE_COURCES?.Course,
      isSort: true,
      mapper: 'Course',
    },
    {
      label: TABLE_COURCES?.Grade,
      isSort: true,
      mapper: 'Grade',
    },
    {
      label: TABLE_COURCES?.Component,
      isSort: true,
      mapper: 'Component',
    },
    {
      label: TABLE_COURCES?.Volume,
      isSort: true,
      mapper: 'Volume',
    },
    {
      label: 'Uploaded From',
      mapper: 'uploaded_from',
      isSort: false,
    },
    {
      label: 'Created At',
      mapper: 'created_at',
      isSort: false,
    },
    {
      label: TABLE_COURCES?.ISBN,
      mapper: 'isbn_number',
    },
    {
      label: TABLE_COURCES?.ACTION,
      mapper: 'status',
      component: COMPONENTS?.switch,
      showInHeader: false,
      align: 'center',
    },
  ];

  const navigateToPreview = (
    id: number,
    name: string,
    image: any,
    logo: any
  ) => {
    navigate(`/manage-courses/upload-course/preview`, {
      state: {
        id,
        name,
        image,
        logo,
      },
    });
  };

  const handlePerPage = (e: any) => {
    setPage(1);
    setRowsPerPage(e);
  };

  const selectHandleChange = (label: string, value: string) => {
    setSelectData((prev) => ({
      ...prev,
      [label]: value,
    }));
    // setSelectData((prev) => {
    //   const newData: any = {};
    //   Object.keys(prev).forEach((key) => {
    //     newData[key] = 'All';
    //   });
    //   newData[label] = value;
    //   return newData;
    // });
  };

  useEffect(() => {
    // const newData: any = [];
    // Object.keys(selectData).forEach((key) => {
    //   newData[key] = key;
    // });
    const newData = Object.entries(selectData)
      .map(([key, value]) => {
        if (value !== 'Select') {
          return `${key}=${value}`;
        }
        return null;
      })
      .filter((str) => str !== null)
      .join('&');
    setDropdownSearch(newData);
  }, [selectData]);

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const handleToolbarAction = (title: string) => {
    if (title === 'Add') {
      navigate(`${pathname}/upload-course`);
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      mutateEmail('email');
    }
  };
  const statusHandler = (e: any, data: object | any) => {
    setStatusChangeId(data?.id);
  };
  // const { isLoading: loadingDropdowns, data, isSuccess } = useGet({
  //   url: 'course-code-service/courses/selection/'
  // });

  // Toolbar Email
  const { isLoading: emailLoaded, mutate: mutateEmail } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/course-list/pdf-download/`,
    onSuccess: (response: any) => {
      toast('success', response?.data?.message || 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
  });

  const getDatas = (dataArr: any) => {
    const apis = dataArr?.map((item: any) =>
      api(import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL).get(
        `course-code-service/courses/content/?ordering=-created_at&limit=3000&offset=${0}&selection=${item.name}`
      )
    );
    Promise.allSettled(apis)
      .then((res: any) => {
        const headerData: any = [];
        const tmp = res.map((element: any) => {
          const url = new URL(
            `${import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL}/${element.value.config.url}`
          );
          const searchParams = new URLSearchParams(url.search);
          const arrDropdown = element.value.data.response.results.map(
            (i: any) => ({ label: i.content, value: i.content })
          );
          headerData.push({
            label: searchParams.get('selection'),
            isSort: true,
            mapper: searchParams.get('selection'),
            // align: 'center'
          });
          return {
            name: searchParams.get('selection'),
            dataArray: [{ label: 'Select', value: 'Select' }, ...arrDropdown],
          };
        });

        setDynamicDropdown(tmp);
        setSelectData(
          tmp.reduce(
            (acc: any, dropdown: any) => ({
              ...acc,
              [dropdown.name]: dropdown.dataArray[0].value,
            }),
            {}
          )
        );
        setDropdownHeaders(headerData);
      })
      .catch((err: any) => {
        setError('Someting Went Wrong');
      })
      .finally(() => setLoad(false));
  };

  // Status Update : Course
  const { isLoading: loadingStatus, mutate: mutateCourseStatus } = usePatch({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/${statusChangeId}/change-status/`,
    onSuccess: (response: any) => {
      setStatusChangeId(null);
      refetch();
      toast('success', 'Status Updated successfully');
    },
    onError: ({ response }: any) => {
      refetch();
      toast('error', response?.statusText || 'Error');
    },
  });
  const temps = rowsPerPage === 'all' ? totalDataCount : rowsPerPage;
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isLoading, isRefetching, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/?limit=${temps}${searchString ? `&search=${searchString}` : ''}&offset=${(page - 1) * Number(temps)}&ordering=${ordering}${dropdownSearch ? `&${dropdownSearch}` : ''}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;

      const body: any = [];
      if (respData?.length) {
        setTotalDataCount(accData?.count);
        const newtableData = respData?.map((item: any): any => {
          let temp = {
            ...item,
            created_at: moment(item.created_at).format('DD-MM-YYYY'),
            name: (
              <span
                className="text-accent underline cursor-pointer text-xs font-medium"
                role="presentation"
                onClick={() =>
                  navigateToPreview(
                    item?.id,
                    item?.name,
                    item?.logo_access_link,
                    item?.logo_file
                  )
                }
              >
                {item?.name}
              </span>
            ),
          };
          if (temp?.course_contents?.length) {
            const headerContents = temp?.course_contents.reduce(
              (acc: any, element: any) => ({
                ...acc,
                [element?.course_selection]: element?.category,
              }),
              {}
            );
            temp = { ...temp, ...headerContents };
          }
          body.push([
            item?.id,
            item?.name,
            temp?.Subject,
            temp?.Grade,
            temp?.Category,
            temp?.Component,
            temp?.Volume,
          ]);
          return temp;
        });
        setTableData(newtableData);
        setCsvData(body);
      } else {
        setTableData([]);
      }
    },
    onError: ({ response }: any) => {},
  });

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.ADD,
      icon: <AddIcon />,
    },
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailLoaded) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Manage Courses List.csv"
          data={csvData}
          headers={headers}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      ),
    },
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

  useEffect(() => {
    if (statusChangeId && statusChangeId !== null) {
      mutateCourseStatus(statusChangeId);
    }
  }, [statusChangeId]);

  useEffect(() => {
    refetch();
  }, [rowsPerPage, page, orderBy, order, searchString]);

  useEffect(() => {
    if (categiries.length > 0) {
      getDatas(categiries);
    }
  }, []);

  const dropdowns = useMemo(() => {
    if (dynamicDropdown) {
      return dynamicDropdown?.map((val: DropDownType) => (
        <Dropdown
          title={`Select ${val.name}`}
          value={selectData[val.name]}
          dataArray={val.dataArray}
          onChangeHandler={(e) => {
            selectHandleChange(val.name, e);
            setPage(1);
          }}
        />
      ));
    }
    return [];
  }, [dynamicDropdown, selectData]);

  return (
    <>
      <RouteLayout navBack={true}>
        <HeaderMenus
          title="Manage Courses"
          menuArray={ADMIN_TOOLBAR_MENU}
          handleToolbarAction={handleToolbarAction}
        />
        <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
          <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
            <div>
              <DebounceInput
                onChange={(e) => setSearchString(e)}
                loading={isLoading}
              />
            </div>
            {load ? (
              <div className="flex justify-center pl-16">
                <Loader size={20} />
              </div>
            ) : (
              dropdowns
            )}
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
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              order={order}
              setOrder={setOrder}
              statusHandler={statusHandler}
              isLoading={isLoading || loadingStatus || load || isRefetching}
            />
          </Wrapper>
        </div>
      </RouteLayout>
    </>
  );
};

export default ManageCourses;
