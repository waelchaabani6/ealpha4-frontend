import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { COMPONENTS, TABLE_LABELS } from '@constants/constants';
import Wrapper from '@shared/wrapper/Wrapper';
import { useState, useEffect, forwardRef } from 'react';
import { useDelete, useGet, usePut } from '@shared/api/useApi';
import toast from '@shared/toast';
import DeletePopup from '@shared/DeletePopup';
import SimpleBackdrop from '@component/Backdrop';

type Region = {
  searchString?: string | any;
  page: number;
  noOfpages: number;
  curTotalPages: number;
  rowsPerPage: number | string;
  setPage: (e: any) => void;
  setCurTotalPages: (e: any) => void;
  triggerExport?: boolean;
  setTriggerExport?: any;
  handleEditPopup?: (e: any) => void;
  setAdminCsvData?: any;
  editMode?: boolean;
};

const Region = forwardRef((props: Region, ref: any) => {
  const {
    searchString, page, setPage, setCurTotalPages, noOfpages, rowsPerPage, curTotalPages,
    triggerExport, setTriggerExport, handleEditPopup, setAdminCsvData, editMode
  } = props;
  const [tableData, setTableData] = useState<any>([]);
  const [order, setOrder] = useState<any>('asc');
  const [orderBy, setOrderBy] = useState<any>('username');
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [popupData, setpopupData] = useState<any>({});
  const [deleteDialog, setDeleteDialog] = useState(false);

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: TABLE_LABELS?.USER_NAME,
      mapper: 'username',
      isSort: true
    },
    {
      label: TABLE_LABELS?.FIRST_NAME,
      mapper: 'first_name',
      isSort: true
    },
    {
      label: TABLE_LABELS?.LAST_NAME,
      mapper: 'last_name',
      isSort: true
    },
    {
      label: TABLE_LABELS?.REGION,
      mapper: 'region'
    },
    {
      label: TABLE_LABELS?.STATUS,
      mapper: 'status',
      align: 'center',
      // colspan: 2,
      // bodyAlign: 'right',
      component: COMPONENTS?.switch,
      showInHeader: false
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: 'Action',
      align: 'left',
      component: COMPONENTS?.delete,
      showInHeader: false
    }
  ];
  // const noOfpages = getNoOfPages(tableData?.length, rowsPerPage);
  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const APIS = {
    statusUpdate: 'status update',
    deleteRecord: 'delete Record'
  };
  const statusHandler = (e: any, data: any) => {
    const payload = {
      status: (e.target.checked) ? 'Active' : 'Inactive',
      id: data?.id
    };
    setPlayloadData({
      apiCall: APIS?.statusUpdate,
      payload
    });
  };

  const handleActionDelete = (row: any) => {
    setpopupData(row);
    setDeleteDialog(true);
  };

  const reset = () => {
    setPlayloadData({});
    setPage(1);
    setTableData([]);
  };

  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const temps = (rowsPerPage === 'all') ? curTotalPages : rowsPerPage;
  const offSet = (page - 1) * Number(temps);
  const { isLoading: tableLoading, refetch: tableRefetch } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/sub-admins/?limit=${temps}&offset=${offSet}&ordering=${ordering}&search=${searchString}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      if (respData?.length) {
        const body: any = [];
        const newTableData = respData?.map((i: any) => {
          body.push([
            i?.id,
            i?.username,
            i?.first_name,
            i?.last_name,

            i?.region,
            i?.status
          ]);
          const temp = {
            ...i,
            username: (<span className="navigateLink" onClick={() => handleEditPopup && handleEditPopup(i)}>{i?.username}</span>),
            first_name: (<span className="navigateLink" onClick={() => handleEditPopup && handleEditPopup(i)}>{i?.first_name}</span>),
            last_name: (<span className="navigateLink" onClick={() => handleEditPopup && handleEditPopup(i)}>{i?.last_name}</span>)
          };
          return temp;
        });
        setAdminCsvData(body);
        setCurTotalPages(accData?.count);
        setTableData(newTableData);
        setTriggerExport(false);
      } else {
        reset();
      }
    },
    onError: ({ response }: any) => {
      reset();
    },
    enabled: false
  });

  const stateReset = () => {
    setPlayloadData({});
    setpopupData({});
    setDeleteDialog(false);
  };

  const handelConfirmDelete = () => {
    mutateAdminDelete(popupData);
  };

  const { isLoading: loadingAdminDelete, mutate: mutateAdminDelete } = useDelete({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/sub-admins/${popupData?.id}/`,
    onSuccess: (response: any) => {
      stateReset();
      tableRefetch();
      toast('success', 'Admin deleted successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
      stateReset();
    }
  });

  const { isLoading: loadingStatus, mutate: mutateStatus } = usePut({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/sub-admins/change-status/${playloadData?.payload?.id}/${playloadData?.payload?.status}/`,
    onSuccess: (response: any) => {
      reset();
      toast('success', 'Status Updated successfully');
      tableRefetch();
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
      setPlayloadData({});
    }
  });

  useEffect(() => {
    if (Object.keys(playloadData).length) {
      if (playloadData?.apiCall === APIS?.statusUpdate) {
        mutateStatus(playloadData?.payload);
      }
    }
  }, [playloadData]);

  useEffect(() => {
    tableRefetch();
  }, [page, orderBy, order, searchString, rowsPerPage, editMode]);

  useEffect(() => {
    if (triggerExport) {
      tableRefetch();
    }
  }, [triggerExport]);

  return (
    <div className="wrapperBorder">
      <Wrapper>
        <AdvanceTable
          ref={ref}
          tableData={tableData}
          headerRows={TableColumns}
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
          rowsPerPage={rowsPerPage}
          setOrderBy={setOrderBy}
          orderBy={orderBy}
          order={order}
          setOrder={setOrder}
          statusHandler={statusHandler}
          deleteHandler={handleActionDelete}
          setPage={setPage}
          maxHeight={620}
        />
      </Wrapper>
      <DeletePopup
        title="Remove Admin"
        description="Are you sure you want to remove the Admin?"
        open={deleteDialog}
        setOpen={setDeleteDialog}
        handleDelete={handelConfirmDelete}
      />
      <SimpleBackdrop
        open={tableLoading || loadingAdminDelete || loadingStatus}
      />
    </div>
  );
});

export default Region;
