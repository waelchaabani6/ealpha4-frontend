import RouteLayout from '@layout/routeLayout';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import {
  RESULTS_PER_PAGE,
  TOOLBAR_LABELS,
  COMPONENTS,
} from '@constants/constants';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import { useEffect, useMemo, useRef, useState } from 'react';
import Dropdown from '@component/dropdown/Dropdown';
import CustomPagination from '@component/pagination/CustomPagination';
import { getNoOfPages, sortData } from '@utility/utility';
import { CSVLink } from 'react-csv';
import Wrapper from '@shared/wrapper/Wrapper';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { useGet, usePatch } from '@shared/api/useApi';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import toast from '@shared/toast';
import CreateSubscription from './createSubscription';

const printButton = () => <PrintIcon />;

const baseURL = import.meta.env.VITE_APP_MASTER_SERVICE_URL;

export default function Index(): JSX.Element {
  const ALL = {
    label: 'All',
    value: 'All',
  };
  const SELECT = {
    label: 'Select',
    value: 'Select',
  };
  const componentRef = useRef(null);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'Enabled' | 'Disabled' | 'All'>('All');
  const [selectedData, setSelectedData] = useState<string>('Select');
  const [selectDataArray, setSelectDataArray] = useState<any>([SELECT]);
  // const [integrationType, setIntegrationType] = useState<string>('All');
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [tableData, setTableData] = useState<any>([]);
  const [targetStatusChange, setTargetStatusChange] = useState<any>(null);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [csvData, setCsvData] = useState<[]>([]);
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const [order, setOrder] = useState<any>('asc');
  const [orderBy, setOrderBy] = useState<any>('Integration Name');
  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const csvSubHeaders = [
    'Sr No.',
    'Integration Name',
    'Integration Type',
    'Assigned To',
    'Integration Through',
    'Description',
    'Logo',
    'Status',
  ];

  const TableColumns = [
    {
      label: 'Sr No.',
      align: 'center',
    },
    {
      label: 'Integration Name',
      isSort: false,
      mapper: 'name',
      // align: 'center'
    },
    {
      label: 'Integration Type',
      isSort: false,
      mapper: 'integration_type',
      // align: 'center'
    },
    {
      label: 'Assigned To',
      isSort: false,
      mapper: 'role_names',
      // align: 'center'
    },
    {
      label: 'Integration Through',
      isSort: false,
      mapper: 'integration_through',
      // align: 'center'
    },
    {
      label: 'Description',
      isSort: false,
      mapper: 'description',
      // align: 'center'
    },
    {
      label: 'Logo',
      isSort: false,
      mapper: 'logo_names',
      // align: 'center'
    },
    {
      label: 'Status',
      mapper: 'status',
      component: COMPONENTS?.switch,
      showInHeader: false,
      align: 'center',
    },
  ];

  const tableReset = () => {
    setPage(1);
    setTableData([]);
    setTotalDataCount(0);
  };

  const statusHandler = (e: any, data: object | any) => {
    setTargetStatusChange({
      id: data.id,
      status: data.status === 'Active' ? 'Inactive' : 'Active',
    });
  };

  const { isLoading: integrationListLoading, data: integrationList } = useGet({
    baseURL,
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

  const { isLoading: statusUpdateLoading, mutate: updateStatus } = usePatch({
    baseURL,
    url: `master-service/integration/${targetStatusChange?.id}/edit/`,
    enabled: !!targetStatusChange,
    onSuccess: (res: any) => {
      toast('success', res?.data?.message);
      refetch();
      setTargetStatusChange(null);
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    },
  });

  const temps = rowsPerPage === 'all' ? totalDataCount : rowsPerPage;
  const { isLoading, data, refetch } = useGet({
    baseURL,
    url: `master-service/integration/?limit=${temps}&offset=${(page - 1) * Number(temps)}${sortBy !== 'All' ? `&status=${sortBy === 'Enabled' ? 'Active' : 'Inactive'}` : ''}${selectedData !== 'Select' ? `&name=${selectedData}` : ''}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const body: any = [];
      if (respData?.length) {
        setTotalDataCount(accData?.count);
        const newtableData = respData?.map((item: any, i: any): any => {
          const roles = item?.assigned_roles?.join(', ');
          const logo = item?.logo_url?.split('/')?.pop() || '';
          body.push([
            i + 1,
            item?.name,
            item?.integration_type,
            roles,
            item?.integration_through,
            item?.description,
            logo,
            item?.status,
          ]);
          const temp = { ...item, role_names: roles, logo_names: logo };
          return temp;
        });
        setCsvData(body);
        setTableData(newtableData);
      } else {
        tableReset();
      }
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    },
  });

  useEffect(() => {
    if (targetStatusChange) {
      updateStatus(targetStatusChange);
    }
  }, [targetStatusChange]);

  // email api
  const {
    isRefetching: emailSendLoading,
    refetch: sendEmail,
    isLoading: emailLoad,
  } = useGet({
    baseURL,
    url: 'master-service/integration-list/export-pdf/',
    onSuccess: (response: any) => {
      toast('success', response?.data?.message || 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
    enabled: false,
  }) as any;

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.ADD,
      icon: <AddIcon />,
    },
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailSendLoading || emailLoad) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: 'Export',
      icon: (
        <CSVLink
          filename="Manage Integration List.csv"
          data={csvData}
          headers={csvSubHeaders}
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
  const handleToolbarAction = (title: string) => {
    if (title === 'Add') {
      setOpenPopup(true);
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      sendEmail();
    }
  };

  useEffect(() => {
    refetch();
  }, [order, orderBy]);

  return (
    <RouteLayout navBack={true} overflow={true}>
      <HeaderMenus
        title="Manage Integration"
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center justify-between lg:flex-row flex-col">
        <div className="flex flex-col md:flex-row gap-4">
          <Dropdown
            title="Select"
            value={selectedData}
            dataArray={selectDataArray}
            onChangeHandler={(e) => setSelectedData(e)}
          />
          <Dropdown
            title="Sort By Status"
            value={sortBy}
            dataArray={['All', 'Enabled', 'Disabled']}
            onChangeHandler={(e) => setSortBy(e)}
          />
          <Dropdown
            title="Result of Pages"
            value={rowsPerPage}
            dataArray={RESULTS_PER_PAGE}
            onChangeHandler={(e) => setRowsPerPage(e)}
          />
        </div>
        <CustomPagination
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
        />
      </div>
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
            isLoading={isLoading || statusUpdateLoading}
            setPage={setPage}
          />
        </Wrapper>
      </div>
      <CustomizedDialogs
        open={openPopup}
        setOpen={() => setOpenPopup(false)}
        title="Add Integration"
      >
        <CreateSubscription
          close={() => setOpenPopup(false)}
          refetch={refetch}
        />
      </CustomizedDialogs>
    </RouteLayout>
  );
}
