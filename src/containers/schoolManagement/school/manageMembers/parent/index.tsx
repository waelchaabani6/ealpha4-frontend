import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { COMPONENTS, TABLE_LABELS } from '@constants/constants';
import { BRANCH, EDIT_PARENT, MANAGE_MEMBERS, SCHOOL, SCHOOL_MANAGEMENT } from '@constants/routes';
import { useGet } from '@shared/api/useApi';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages, userRole } from '@utility/utility';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssignStudent from '../student/assignStudent';

export default function Index(props: any) {
  const { id, branchId: branchID, schoolName } = useParams();
  const navigate = useNavigate();
  const {
    page,
    setPage,
    rowsPerPage,
    setTotalDataCount,
    deleteHandler,
    totalDataCount,
    selectedBranchId,
    selectedBranch,
    searchString,
    selectedClass,
    tableReload,
    setTableReload,
    deleteLoading,
    branchData,
    setAdminCsvData,
    setBulkSelect,
    bulkSelect
  } = props;

  const [dialog, toggleDialog] = useState(false);
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [tableData, setTableData] = useState<any>([]);
  const [parentData, setParentData] = useState<any>({});
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
      label: TABLE_LABELS?.ASSIGNED_STUDENT,
      mapper: 'students'
    },
    {
      label: TABLE_LABELS?.CLASSES,
      mapper: 'class_name'
    },
    {
      label: TABLE_LABELS?.ACTION,
      colspan: 3,
      align: 'center',
      bodyAlign: 'right',
      component: COMPONENTS?.assign,
      showInHeader: false
    },
    {
      align: 'center',
      component: COMPONENTS?.edit,
      bodyAlign: 'center',
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
        navigate(`/${schoolName}/dashboard/${branchId ? `${BRANCH}/` : data?.branch_id ? `${BRANCH}/` : ''}${id ? (data?.branch_id ? data?.branch_id : id) : branchId}/${MANAGE_MEMBERS}/${EDIT_PARENT}/${data?.user_id}`);
      } else {
        navigate(`${SCHOOL_MANAGEMENT}/${branchId ? BRANCH : data?.branch_id ? BRANCH : SCHOOL}/${id ? (data?.branch_id ? data?.branch_id : id) : branchId}/${MANAGE_MEMBERS}/${EDIT_PARENT}/${data?.user_id}`);
      }
    } else if (handlername === 'delete') {
      const newData = {
        id: data?.user_id
      };
      deleteHandler(newData);
    } else if (handlername === 'assign') {
      setParentData(data);
      toggleDialog(true);
    }
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);

  // -------------------------------API---------------------------
  //  Get Teachers List
  const temps = (rowsPerPage === 'All') ? totalDataCount : rowsPerPage;
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const body: any = [];
  const { isFetching: parentLoading, refetch: fetchParent } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/parents-list/?school_id=${id || branchData?.school_id || ''}&limit=${temps}&offset=${(page - 1) * Number(temps)}&ordering=${ordering}&search=${searchString}&class_name=${selectedClass !== 'All' ? selectedClass : ''}${branchId ? `&branch_id=${branchId}` : ''}`,
    onSuccess: (res: any) => {
      setTableReload(false);
      const accData = res?.data?.response;
      setTotalDataCount(accData.count);
      const respData = accData?.results.map((item: any): any => {
        if (item.class_name.length) {
          item.class_name = item.class_name.filter((value: string, index: number, self: string | any[]) => self.indexOf(value) === index);
        }
        body.push([
          item?.id,
          item?.user_id,
          item?.branch_name,
          item?.username,
          item?.first_name,
          item?.last_name,
          item?.students.join('|'),
          item?.class_name.join('|')
        ]);
        return { ...item };
      });
      props?.setParentData(respData);
      setTableData(respData || []);
      setAdminCsvData(body);
    },
    onError: ({ response }: any) => {
      setTableReload(false);
    },
    enabled: !!(id || branchData?.school_id),
    cacheTime: 0
  });
  // -------------------------------END API---------------------------

  useEffect(() => {
    const tempBranchID = branchID || (selectedBranch !== 'All' ? selectedBranchId : '');
    setBranchId(tempBranchID);
  }, [branchID, selectedBranch]);

  useEffect(() => {
    if (id || branchData?.school_id) {
      fetchParent();
    }
  }, [page, order, orderBy, searchString, selectedClass, branchId, id, branchData]);

  useEffect(() => {
    if (tableReload) {
      fetchParent();
    }
  }, [tableReload]);

  return (
    <div className="wrapperBorder">
      <Wrapper>
        <AdvanceTable
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
          isLoading={parentLoading || deleteLoading}
          actionHandler={actionHandler}
          setBulkSelect={setBulkSelect}
          bulkSelect={bulkSelect}
        />
      </Wrapper>
      <CustomizedDialogs
        open={dialog}
        setOpen={() => toggleDialog(false)}
        title="Assign Students to Parent"
      >
        <AssignStudent parentData={parentData} toggleDialog={toggleDialog} fetchParent={fetchParent} />
      </CustomizedDialogs>
    </div>
  );
}
