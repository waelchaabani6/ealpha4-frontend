/* eslint-disable max-len */
import { useState, useEffect, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import EmailIcon from '@mui/icons-material/Email';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import PrintIcon from '@mui/icons-material/Print';
import { CSVLink } from 'react-csv';
import moment from 'moment';
import { useGet, usePost, useDelete, usePatch } from '@shared/api/useApi';
import toast from '@shared/toast';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import Loader from '@shared/loader';
import Pagination from '@mui/material/Pagination';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import {
  RESULTS_PER_PAGE,
  COMPONENTS,
  TABLE_COURCES,
  TABLE_SUBSCRIPTIONS,
  TOOLBAR_LABELS,
} from '@constants/constants';
import RouteLayout from '../../layout/routeLayout';
import Dropdown from '../../../components/dropdown/Dropdown';
import CustomPagination from '../../../components/pagination/CustomPagination';
import { getNoOfPages, sortData } from '../../../utilities/utility';
import Wrapper from '../../../shared/wrapper/Wrapper';

const printButton = () => <PrintIcon />;

const ManageCourses = (): JSX.Element => {
  const baseURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
  const componentRef = useRef(null);
  const TableColumns = [
    {
      label: TABLE_COURCES?.SR_NO,
      align: 'center',
    },
    {
      label: TABLE_SUBSCRIPTIONS?.Integration_Name,
      isSort: true,
      mapper: 'name',
      // align: 'center'
    },
    {
      label: TABLE_SUBSCRIPTIONS?.School_Name,
      isSort: true,
      mapper: 'school_name',
      // align: 'center'
    },
    {
      label: TABLE_SUBSCRIPTIONS?.Branch_Name,
      isSort: true,
      mapper: 'branch_name',
    },
    {
      label: TABLE_SUBSCRIPTIONS?.Number_of_Users,
      isSort: true,
      mapper: 'number_of_licenses',
    },
    {
      label: TABLE_SUBSCRIPTIONS?.Role,
      // isSort: true,
      mapper: 'role_names',
    },
    {
      label: TABLE_SUBSCRIPTIONS?.Assigned_Date,
      isSort: true,
      mapper: 'assign_date',
    },
    {
      label: TABLE_SUBSCRIPTIONS?.Assigned_By,
      isSort: true,
      mapper: 'assigned_by',
      align: 'left',
    },
    {
      label: TABLE_SUBSCRIPTIONS?.ACTION,
      mapper: 'status',
      component: COMPONENTS?.switch,
      showInHeader: false,
      align: 'center',
    },
  ];

  const SELECT = {
    label: 'Select',
    value: 'Select',
  };
  const [selectedData, setSelectedData] = useState<string>('Select');
  const [selectDataArray, setSelectDataArray] = useState<any>([SELECT]);
  const [selectedSchool, setSelectedSchool] = useState<string>('Select');
  const [selectSchoolArray, setSelectSchoolArray] = useState<any>([SELECT]);
  const [selectedBranch, setSelectedBranch] = useState<string>('Select');
  const [selectBranchArray, setSelectBranchArray] = useState<any>([SELECT]);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [tableData, setTableData] = useState<any>([]);
  const [csvData, setCsvData] = useState<[]>([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [targetStatusChange, setTargetStatusChange] = useState<any>(null);
  // const noOfpages = getNoOfPages(tableData?.length, rowsPerPage);

  const [order, setOrder] = useState<any>('asc');
  const [orderBy, setOrderBy] = useState<any>('name');

  // email api
  const {
    isRefetching: emailSendLoading,
    mutate: sendEmail,
    isLoading: emailLoad,
  } = usePost({
    baseURL,
    url: 'schools-service/schools/integrations/export-pdf/',
    onSuccess: (response: any) => {
      toast('success', response?.data?.message || 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
    enabled: false,
  }) as any;

  const csvSubHeaders = [
    TABLE_SUBSCRIPTIONS?.SR_NO,
    TABLE_SUBSCRIPTIONS?.Integration_Name,
    TABLE_SUBSCRIPTIONS?.School_Name,
    TABLE_SUBSCRIPTIONS?.Branch_Name,
    TABLE_SUBSCRIPTIONS?.Number_of_Users,
    TABLE_SUBSCRIPTIONS?.Role,
    TABLE_SUBSCRIPTIONS?.Assigned_Date,
    TABLE_SUBSCRIPTIONS?.Assigned_By,
    TABLE_SUBSCRIPTIONS?.ACTION,
  ];

  const ADMIN_TOOLBAR_MENU = [
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailSendLoading || emailLoad) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: 'Export',
      icon: (
        <CSVLink
          filename="Manage Subscriptions List.csv"
          data={csvData}
          headers={csvSubHeaders}
          enclosingCharacter=""
        >
          <Share />
        </CSVLink>
      ),
    },
    {
      title: 'Print',
      icon: (
        <ReactToPrint
          trigger={printButton}
          content={() => componentRef.current}
        />
      ),
    },
  ];

  const handlePerPage = (e: any) => {
    setRowsPerPage(e);
  };
  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const handleToolbarAction = (title: string) => {
    if (title === TOOLBAR_LABELS.EMAIL) {
      sendEmail('email');
    }
  };

  const statusHandler = (e: any, data: any) => {
    const payload = {
      status: e.target.checked ? 'Active' : 'Inactive',
    };
    setTargetStatusChange({ id: data?.id, data: payload });
  };

  const tableReset = () => {
    setPage(1);
    setTableData([]);
    setTotalDataCount(0);
  };

  const { isLoading: schoolListLoading, refetch: schoolList } = useGet({
    baseURL,
    url: `schools-service/schools/get-schools/?limit=1000`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results;
      const body: any = [];
      resp?.map((i: any) => {
        body.push({
          id: i?.id,
          label: i?.name,
          value: i?.name,
        });
        body.sort(sortData);
        return body;
      });
      setSelectSchoolArray([SELECT, ...body]);
    },
    onError: () => {},
  });

  const { isLoading: integrationListLoading, data: integrationList } = useGet({
    baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
    url: `master-service/integration/`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results;
      const body: any = [];
      resp?.map((i: any) => {
        body.push({
          label: i?.name,
          value: i?.name,
        });
        body.sort(sortData);
        return body;
      });
      setSelectDataArray([SELECT, ...body]);
    },
    onError: () => {},
  });

  const { isLoading: branchListLoading, data: branchList } = useGet({
    baseURL,
    url: `schools-service/school-branches/branch-list/?${selectedSchool !== 'Select' ? `school_id=${selectSchoolArray.find((ele: any) => ele?.value === selectedSchool)?.id}` : ''}`,
    enabled: !!selectedSchool,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      const body: any = [];
      resp?.map((i: any) => {
        body.push({
          label: i?.name,
          value: i?.name,
        });
        body?.sort(sortData);
        return body;
      });
      setSelectBranchArray([SELECT, ...body]);
    },
    onError: () => {},
  });

  // Status Update : Course
  const { isLoading: loadingStatus, mutate: mutateSubscriptionStatus } =
    usePatch({
      baseURL,
      url: `schools-service/schools/school-integrations/${targetStatusChange?.id}/change-status/`,
      onSuccess: (response: any) => {
        setTargetStatusChange(null);
        refetch();
        toast('success', 'Status Updated successfully');
      },
      onError: ({ response }: any) => {
        refetch();
        toast('error', response?.statusText || 'Error');
      },
    });

  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  // Get Manage Subscriptions Listing
  const temps = rowsPerPage === 'all' ? totalDataCount : rowsPerPage;
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isLoading, isRefetching, refetch } = useGet({
    baseURL,
    url: `schools-service/schools/school-integrations/?limit=${temps}&offset=${(page - 1) * Number(temps)}${selectedData !== 'Select' ? `&name=${selectedData}` : ''}${selectedSchool !== 'Select' ? `&school_name=${selectedSchool}` : ''}${selectedBranch !== 'Select' ? `&branch_name=${selectedBranch}` : ''}&ordering=${ordering}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const body: any = [];
      if (respData?.length) {
        setTotalDataCount(accData?.count);
        const newtableData = respData?.map((item: any, i: any): any => {
          const roles = item?.assigned_roles?.join(', ');
          body.push([
            i + 1,
            item?.name,
            item?.school_name,
            item?.branch_name,
            item?.number_of_licenses,
            roles,
            moment(item?.assign_date).format('DD-MM-YYYY'),
            item?.assigned_by,
            item?.status,
          ]);
          const temp = {
            ...item,
            role_names: roles,
            assign_date: moment(item?.assign_date).format('DD-MM-YYYY'),
          };
          return temp;
        });
        setCsvData(body);
        setTableData(newtableData);
      } else {
        tableReset();
      }
    },
    onError: ({ response }: any) => {
      tableReset();
    },
    enabled: false,
  });

  useEffect(() => {
    if (targetStatusChange) {
      mutateSubscriptionStatus(targetStatusChange?.data);
    }
  }, [targetStatusChange]);

  useEffect(() => {
    refetch();
  }, [
    rowsPerPage,
    page,
    selectedData,
    selectedSchool,
    selectedBranch,
    order,
    orderBy,
  ]);

  return (
    <>
      <RouteLayout navBack={true}>
        <HeaderMenus
          title="Manage Subscriptions"
          menuArray={ADMIN_TOOLBAR_MENU}
          handleToolbarAction={handleToolbarAction}
        />
        <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
          <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0">
            <Dropdown
              title="Select"
              value={selectedData}
              dataArray={selectDataArray}
              onChangeHandler={(value) => setSelectedData(value)}
            />
            <Dropdown
              title="Select School"
              value={selectedSchool}
              dataArray={selectSchoolArray}
              onChangeHandler={(value) => setSelectedSchool(value)}
            />
            <Dropdown
              title="Select Branch"
              value={selectedBranch}
              dataArray={selectBranchArray}
              onChangeHandler={(value) => setSelectedBranch(value)}
              loading={branchListLoading}
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
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              order={order}
              setOrder={setOrder}
              statusHandler={statusHandler}
              isLoading={isLoading || isRefetching || loadingStatus}
              setPage={setPage}
            />
          </Wrapper>
        </div>
      </RouteLayout>
    </>
  );
};

export default ManageCourses;
