import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import DebounceInput from '@component/input/DebounceInput';
import CustomPagination from '@component/pagination/CustomPagination';
import { COMPONENTS, RESULTS_PER_PAGE, TABLE_LABELS, TOOLBAR_LABELS } from '@constants/constants';
import routes from '@constants/routes';
import { ReactComponent as Edit } from '@images/longMenuIcons/Edit.svg';
import { ReactComponent as Delete } from '@images/longMenuIcons/Delete2.svg';
import { ReactComponent as ISBN } from '@images/longMenuIcons/isbnNumber.svg';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import RouteLayout from '@layout/routeLayout';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import DeletePopup from '@shared/DeletePopup';
import { useDelete, useGet, usePatch, usePost } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import LongMenu from '@component/IconMenu/CustomIconMenu';
import PageTitle from '@shared/pageTitle';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages } from '@utility/utility';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
import ReactToPrint from 'react-to-print';

const printButton = () => <PrintIcon />;

export default function Index() {
  const baseURL = import.meta.env.VITE_APP_CMS_SERVICE_URL;
  const navigate = useNavigate();
  const componentRef = useRef(null);

  const moreMenuOptions = [
    {
      icon: <ISBN />,
      label: 'Preview',
      value: 'previewPage'
    },
    {
      icon: <Edit />,
      label: 'Edit',
      value: 'editPage'
    },
    {
      icon: <Delete />,
      label: 'Delete',
      value: 'delete'
    }
  ];
  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: TABLE_LABELS?.PAGE_TITLE,
      mapper: 'display_title'
    },
    {
      label: TABLE_LABELS?.STATUS,
      mapper: 'status'
    },
    {
      label: TABLE_LABELS?.PUBLISHED_ON,
      mapper: 'created_at'
    },
    {
      label: TABLE_LABELS?.PUBLISHED_BY,
      mapper: 'published_user'
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: 'menuOptions',
      align: 'center',
      showInHeader: false
    }
  ];

  const [selectData, setSelectData] = useState('All');
  const [page, setPage] = useState(1);
  const [tableData, setTableData] = useState<any>([]);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [order, setOrder] = useState<any>('des');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [popupData, setpopupData] = useState<any>({});
  const [dialogOpen, setdialogOpen] = useState<boolean>(false);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [csvData, setCsvData] = useState<[]>([]);
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [searchString, setSearchString] = useState('');
  const [pageDeleteDialog, setPageDeleteDialog] = useState(false);

  const headers = [
    TABLE_LABELS?.SR_NO,
    TABLE_LABELS?.PAGE_TITLE,
    TABLE_LABELS?.STATUS,
    TABLE_LABELS?.PUBLISHED_ON,
    TABLE_LABELS?.PUBLISHED_BY
  ];

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD) {
      navigate(routes?.ADD_INFORMATIVE_PAGE);
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      mutateEmail();
    }
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const statusHandler = (e: any, data: any) => {
    const payload = {
      status: (e.target.checked) ? 'Active' : 'Inactive'
    };
    setPlayloadData({
      apicall: 'courseStatus',
      payload,
      id: data?.id
    });
  };
  const handleMoreOption = (id: any, rowData: any) => {
    setpopupData(rowData);
    if (id === 'previewPage') {
      switch (rowData?.id) {
        case 1:
          navigate('/faq');
          break;
        case 2:
          navigate('/contact-us');
          break;
        case 3:
          navigate('/about-us');
          break;
        case 4:
          navigate('/alpha-program');
          break;
        default:
          // window.open(`/page/${rowData?.id}/`, '_blank');
          navigate(`/page/${rowData?.id}/`);
          break;
      }
    } else if (id === 'editPage') {
      navigate(`edit-informative-page/${rowData?.id}`);
    } else if (id === 'delete') {
      switch (rowData?.id) {
        case 1:
        case 2:
        case 3:
        case 4:
          toast('error', 'Can\'t delete this page');
          break;
        default:
          setPageDeleteDialog(true);
          break;
      }
    }
  };
  const tableReset = () => {
    setPage(1);
    setTableData([]);
    setTotalDataCount(0);
  };

  const allStateReset = () => {
    tableReset();
    tempDataReset();
  };

  const tempDataReset = () => {
    setPlayloadData({});
    setpopupData({});
  };

  const handlePageDelete = () => {
    setPageDeleteDialog(false);
    mutateDeletePage(popupData);
  };

  // Toolbar Email
  const { isLoading: emailLoaded, refetch: mutateEmail } = useGet({
    baseURL,
    url: `cms-service/page/list/export/`,
    onSuccess: (response: any) => {
      toast('success', response?.data?.message || 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
    enabled: false
  });

  //  Delete School
  const { isLoading: loadingDeletePage, mutate: mutateDeletePage } = useDelete({
    baseURL,
    url: `cms-service/page/${popupData?.id}/delete/`,
    onSuccess: (response: any) => {
      tempDataReset();
      refetch();
      toast('success', 'Page deleted successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  // Get Course code Listing
  const temps = (rowsPerPage === 'all') ? totalDataCount : rowsPerPage;
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isLoading, isRefetching, refetch } = useGet({
    baseURL,
    url: `cms-service/page/?limit=${temps}${searchString ? `&search=${searchString}` : ''}&offset=${(page - 1) * Number(temps)}&ordering=${ordering}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const body: any = [];
      if (respData?.length) {
        setTotalDataCount(accData?.count);
        const newtableData = respData?.map((item: any, i: any): any => {
          body.push([
            i + 1,
            item?.display_title,
            item?.status,
            moment(item?.created_at).format('DD-MM-YYYY hh:mm A'),
            item?.published_user
          ]);
          const temp = { ...item,
            created_at: moment(item?.created_at).format('DD-MM-YYYY hh:mm A'),
            menuOptions: (
              <LongMenu
                dataArray={item.id < 5 ? moreMenuOptions.slice(0, 2) : moreMenuOptions}
                rowData={{ ...item, created_at: moment(item?.created_at).format('DD-MM-YYYY hh:mm A') }}
                handleChange={handleMoreOption}
              />
            ) };
          return temp;
        });
        setCsvData(body);
        setTableData(newtableData);
      } else {
        tableReset();
      }
    },
    onError: ({ response }: any) => {
      allStateReset();
    },
    enabled: false
  });

  useEffect(() => {
    refetch();
  }, [rowsPerPage, page, selectData, orderBy, order, searchString]);

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.ADD,
      icon: <AddIcon />
    },
    {
      title: TOOLBAR_LABELS.EMAIL,
      icon: (emailLoaded) ? <Loader size={20} /> : <EmailIcon />
    },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Page List.csv"
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

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus title="Pages" menuArray={ADMIN_TOOLBAR_MENU} handleToolbarAction={handleToolbarAction} />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div>
            <DebounceInput
              onChange={(e) => setSearchString(e)}
              loading={isLoading}
            />
          </div>
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
            handleMoreOption={handleMoreOption}
            moreMenuOptions={moreMenuOptions}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            orderBy={orderBy}
            statusHandler={statusHandler}
            setPage={setPage}
            isLoading={isLoading || loadingDeletePage || isRefetching}
          />
        </Wrapper>
      </div>
      {/* Delete School */}
      <DeletePopup
        title="Remove Page"
        description="Are you sure you want to remove the page?"
        open={pageDeleteDialog}
        setOpen={setPageDeleteDialog}
        handleDelete={handlePageDelete}
      />
    </RouteLayout>
  );
}
