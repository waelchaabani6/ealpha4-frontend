import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { COMPONENTS, RESULTS_PER_PAGE, TABLE_LABELS, TOOLBAR_LABELS } from '@constants/constants';
import RouteLayout from '@layout/routeLayout';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages, userRole } from '@utility/utility';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import { ReactComponent as Download } from '@images/pageHeaderIcons/download.svg';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DebounceInput from '@component/input/DebounceInput';
import CustomPagination from '@component/pagination/CustomPagination';
import { useLocation, useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import ReactToPrint from 'react-to-print';
import { useDelete, useGet, usePost } from '@shared/api/useApi';
import toast from '@shared/toast';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import DeletePopup from '@shared/DeletePopup';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import Loader from '@shared/loader';

const printButton = () => <PrintIcon />;

export default function Index() {
  const [popupdata, setpopupdata] = useState<string[] | []>([]);
  const [openPopup, setopenPopup] = useState<boolean>(false);
  const [deleteGroupPopup, setdeleteGroupPopup] = useState<boolean>(false);
  const [searchString, setSearchString] = useState('');
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [deleteGroupId, setdeleteGroupId] = useState<number | null>(null);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const navigate = useNavigate();
  const componentRef = useRef(null);
  const { pathname } = useLocation();
  const location = useLocation();

  // const handlePerPage = (e: any) => {
  //   setPage(1);
  //   setRowsPerPage(e);
  // };
  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const { isLoading, data, refetch, isRefetching } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/groups-list/?limit=${10}${searchString ? `&search=${searchString}` : ''}&offset=${(page - 1) * 10}`,
    cacheTime: 0,
    onSuccess: (resp: any) => {
      setTotalDataCount(resp?.data?.response?.count);
    }
  });

  const { isLoading: deleteLoading, mutate: deleteGroup } = useDelete({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/group/${deleteGroupId}/delete/`,
    onSuccess: () => {
      setdeleteGroupId(null);
      setdeleteGroupPopup(false);
      refetch();
      toast('success', 'Group Deleted');
    },
    enabled: !!deleteGroupId
  });

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: 'Group Name',
      mapper: 'group_name'
    },
    {
      label: 'Students Name',
      mapper: `student_group`
    },
    {
      label: TABLE_LABELS?.ACTION,
      colspan: 2,
      align: 'center',
      bodyAlign: 'right',
      component: COMPONENTS?.edit,
      showInHeader: false
    },
    {
      bodyAlign: 'left',
      component: COMPONENTS?.delete,
      showInHeader: false
    }
  ];
  const { isRefetching: emailSendLoading, refetch: sendEmail } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/groups-list-export?school_id=${branchData?.school_data?.id || schoolData.id}`,
    onSuccess: () => {
      toast('success', 'Email sent successfully');
    },
    enabled: false
  }) as any;
  const actionHandler = (acdata: any, handlername: string) => {
    if (handlername === 'add') {
      navigate(`${pathname}/add`);
    }
    if (handlername === 'delete') {
      setdeleteGroupId(+acdata.id);
      setdeleteGroupPopup(true);
    }
    if (handlername === 'edit') {
      navigate(`${pathname}/edit/${acdata.id}`, { state: { page } });
    }
  };
  const handleToolbarAction = (title: string) => {
    if (title === 'Add') {
      navigate(`${pathname}/add`);
    }
    if (title === 'Email') {
      sendEmail();
    }
  };

  const csvData = data?.data?.response?.results?.map((i: any) => ([
    i.group_name,
    i?.student_group?.map((a: any) => a.student_name).join(' | ')
  ]));

  const ADMIN_TOOLBAR_MENU = [
    {
      title: 'Add',
      icon: <AddIcon />
    },
    {
      title: TOOLBAR_LABELS.EMAIL,
      icon: emailSendLoading ? <Loader size={20} /> : <EmailIcon />
    },
    // {
    //   title: TOOLBAR_LABELS.IMPORT,
    //   icon: <Download />
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Groups.csv"
          data={csvData || []}
          headers={['group_name', 'student_group']}
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

  const lst = useMemo(() => data?.data?.response?.results?.map((itm: any) => {
    const tmp = { ...itm };
    const len = 3;
    tmp.student_group = (
      <div className="flex gap-x-4 w-max">
        <p className="flex-1 truncate">
          {
            (itm.student_group.length > len ? tmp.student_group.slice(0, len) : tmp.student_group).map((i: any) => i.student_name).join(' , ')
          }
        </p>
        {
          itm.student_group.length > len && (
            <p
              className="flex-1 cursor-pointer underline font-semibold"
              onClick={() => {
                setpopupdata(itm.student_group.map((i: any) => i.student_name));
                setopenPopup(true);
              }}
            >
              {`+ ${tmp.student_group.length - len} more`}
            </p>
          )
        }
      </div>
    );
    return tmp;
  }), [data]);

  useEffect(() => {
    if (location?.state?.page) {
      setPage(location?.state?.page);
    }
  }, []);
  return (
    <RouteLayout navBack={false}>
      <HeaderMenus
        title="My Group"
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex flex-col gap-y-4 md:flex-row md:gap-y-0 justify-between py-4">
        <DebounceInput
          onChange={(e) => setSearchString(e)}
        />
        <CustomPagination
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
        />
      </div>
      <div className="wrapperBorder" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
            maxHeight={580}
            tableData={lst || []}
            headerRows={TableColumns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            rowsPerPage={rowsPerPage}
            actionHandler={actionHandler}
            isLoading={isLoading || isRefetching || deleteLoading}
            setPage={setPage}
          />
        </Wrapper>
      </div>
      <CustomizedDialogs title="Students Name" open={openPopup} setOpen={setopenPopup} onclose={() => setopenPopup(false)}>
        <div className="w-full grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {
            popupdata?.map((ele: string) => <p className="p-2">{ele}</p>)
          }
        </div>
      </CustomizedDialogs>
      <DeletePopup
        title="Delete Group"
        isLoading={deleteLoading}
        description="Are you sure you want to remove the group?"
        open={deleteGroupPopup}
        setOpen={setdeleteGroupPopup}
        handleDelete={() => deleteGroup()}
      />
    </RouteLayout>
  );
}
