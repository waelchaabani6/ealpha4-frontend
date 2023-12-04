import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { COMPONENTS, TABLE_LABELS } from '@constants/constants';
import { useGet } from '@shared/api/useApi';
import PageTitle from '@shared/pageTitle';
import { selectSchoolData } from '@shared/store/schoolSlice';
import Wrapper from '@shared/wrapper/Wrapper';
import { capitalizeFirstLetter, getNoOfPages, userRole } from '@utility/utility';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link, useParams } from 'react-router-dom';

const Imported = (props: any) => {
  const { id, branchId, moduleName, schoolName } = useParams();
  const { branchData } = useSelector(selectSchoolData);
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [tableData, setTableData] = useState<any>([]);
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [totalDataCount, setTotalDataCount] = useState(0);
  const navigate = useNavigate();

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: TABLE_LABELS?.FILE_NAME,
      mapper: 'file_name',
      isSort: true
    },
    {
      label: TABLE_LABELS?.UPLOADED_BY,
      mapper: 'created_by',
      isSort: true
    },
    {
      label: TABLE_LABELS?.CREATED_ON,
      mapper: 'created_at',
      format: 'DD-MM-YYYY',
      isSort: true
    },
    {
      label: TABLE_LABELS?.STATUS,
      mapper: 'status',
      align: 'center',
      isSort: true
    },
    {
      label: TABLE_LABELS?.ERRORS,
      mapper: 'error_count',
      isSort: true
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: 'Action',
      align: 'center',
      component: COMPONENTS?.view,
      showInHeader: false
    }
  ];

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const actionHandler = (data: any, handlername: string) => {
    if (handlername === 'view') {
      if (userRole().isSuperAdmin) {
        navigate(`/bulk-upload/details/${data?.id}`);
      } else {
        navigate(`/${schoolName}/bulk-upload/details/${data?.id}`);
      }
    }
  };
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  // -------------------API-------------------------------------------------
  //  Get Imported Logs list
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isFetching: LogListLoading, refetch: fetchLogs } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/import-audit/?school_id=${id || branchData?.school_id}${branchId ? `&branch_id=${branchId || ''}` : ''}&import_type=${moduleName}&limit=${rowsPerPage}&offset=${(page - 1) * rowsPerPage}&ordering=${ordering}`,
    onSuccess: (res: any) => {
      const accData = res?.data?.response;
      const respData = accData?.results;
      setTotalDataCount(accData.count);
      setTableData(respData);
    },
    onError: ({ response }: any) => { },
    enabled: false
  });
  // -------------------END-API-------------------------------------------------

  useEffect(() => {
    fetchLogs();
  }, [page, order, orderBy]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="items-center py-5 ">
        <div className="my-5 mx-4 ">
          <PageTitle title={capitalizeFirstLetter(moduleName)} />
        </div>
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
            setPage={setPage}
            actionHandler={actionHandler}
            isLoading={LogListLoading}
          />
        </Wrapper>
      </div>
    </div>

  );
};
export default Imported;
