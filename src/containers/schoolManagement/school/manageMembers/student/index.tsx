import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { COMPONENTS, TABLE_LABELS } from '@constants/constants';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages, userRole } from '@utility/utility';
import { useEffect, useState } from 'react';
import { useGet } from '@shared/api/useApi';
import { useNavigate, useParams } from 'react-router-dom';
import { BRANCH, EDIT_STUDENT, MANAGE_MEMBERS, SCHOOL, SCHOOL_MANAGEMENT } from '@constants/routes';

export default function Index(props: any) {
  const { id, branchId: branchID, schoolName } = useParams();
  const navigate = useNavigate();
  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    setTotalDataCount,
    deleteHandler,
    totalDataCount,
    selectedBranch,
    selectedBranchId,
    searchString,
    selectedClass,
    tableReload,
    setTableReload,
    deleteLoading,
    schoolData,
    branchData,
    setAdminCsvData,
    setBulkSelect,
    bulkSelect
  } = props;
  const [tableData, setTableData] = useState<any>([]);
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [branchId, setBranchId] = useState<any>('');

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: '',
      align: 'center',
      component: COMPONENTS?.checkbox,
      selector: 'id',
      showInHeader: true
    },
    {
      label: TABLE_LABELS?.BRANCH_NAME,
      mapper: 'branch_name',
      isSort: true
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
      isSort: true,
      mapper: 'last_name'
    },
    {
      label: TABLE_LABELS?.CLASSES,
      mapper: 'class_name'
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

  const actionHandler = (data: any, handlername: string) => {
    if (handlername === 'edit') {
      if (userRole().isSchoolAdmin || userRole().isBranchAdmin) {
        navigate(`/${schoolName}/dashboard/${branchId ? `${BRANCH}/` : data?.branch_id ? `${BRANCH}/` : ''}${id ? (data?.branch_id ? data?.branch_id : id) : branchId}/${MANAGE_MEMBERS}/${EDIT_STUDENT}/${data?.id}`);
      } else {
        navigate(`${SCHOOL_MANAGEMENT}/${branchId ? BRANCH : data?.branch_id ? BRANCH : SCHOOL}/${id ? (data?.branch_id ? data?.branch_id : id) : branchId}/${MANAGE_MEMBERS}/${EDIT_STUDENT}/${data?.id}`);
      }
    } else if (handlername === 'delete') {
      deleteHandler(data);
    }
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);

  //  Get Students List
  const temps = (rowsPerPage === 'All') ? totalDataCount : rowsPerPage;
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const body: any = [];
  const { isFetching: studentLoading, refetch: fetchStudent } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/students-list/?school_id=${id || branchData?.school_id}&limit=${temps}&offset=${(page - 1) * Number(temps)}&ordering=${ordering}&search=${searchString}&class_name=${selectedClass !== 'All' ? selectedClass : ''}${branchId ? `&branch_id=${branchId}` : ''}`,
    onSuccess: (res: any) => {
      const accData = res?.data?.response;
      const respData = accData?.results;
      setTotalDataCount(accData.count);
      setTableData(respData);
      setTableReload(false);
      respData?.forEach((item: any): any => {
        body.push([
          item?.id,
          item?.username,
          item?.first_name,
          item?.last_name,
          item?.class_name
        ]);
      });
      setAdminCsvData(body);
    },
    onError: ({ response }: any) => {
      setTableReload(false);
    },
    enabled: !!(id || branchData?.school_id)
  });

  useEffect(() => {
    const tempBranchID = branchID || (selectedBranch !== 'All' ? selectedBranchId : '');
    setBranchId(tempBranchID);
  }, [branchID, selectedBranch]);

  useEffect(() => {
    if (id || branchData?.school_id) {
      fetchStudent();
    }
  }, [page, order, orderBy, searchString, selectedClass, branchId, id, branchData]);

  useEffect(() => {
    if (tableReload) {
      fetchStudent();
    }
  }, [tableReload]);

  return (
    <div className="wrapperBorder">
      <Wrapper>
        <AdvanceTable
          maxHeight={580}
          tableData={tableData}
          headerRows={TableColumns}
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
          rowsPerPage={rowsPerPage}
          order={order}
          setOrder={setOrder}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          actionHandler={actionHandler}
          isLoading={studentLoading || deleteLoading}
          setPage={setPage}
          setBulkSelect={setBulkSelect}
          bulkSelect={bulkSelect}
        />
      </Wrapper>
    </div>
  );
}
