import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { COMPONENTS, TABLE_LABELS } from '@constants/constants';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages } from '@utility/utility';
import { useEffect, useState } from 'react';
import RouteLayout from '@layout/routeLayout';
import PageTitle from '@shared/pageTitle';
import { useGet, usePatch } from '@shared/api/useApi';
import { useParams } from 'react-router-dom';
import Button from '@component/button/button';
import toast from '@shared/toast';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import DeletePopup from '@shared/DeletePopup';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector } from 'react-redux';
import TransferForm from '../TransferForm';

export default function Teacher(props: any) {
  const { id, branchId: BranchID } = useParams();
  const { page, setPage, rowsPerPage, setRowsPerPage, setTotalDataCount, deleteHandler, selectedBranch, setSelectedBranch, searchString, classID, selectedClass, setAdminCsvData, classDetail } = props;
  const { branchData } = useSelector(selectSchoolData);
  const [tableData, setTableData] = useState<any>([]);
  const [newtableData, newSetTableData] = useState<any>([]);
  const [order, setOrder] = useState<any>('desc');
  const [order2, setOrder2] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('first_name');
  const [orderBy2, setOrderBy2] = useState<any>('first_name');
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [bulkSelectNonAssign, setBulkSelectNonAssign] = useState<any>([]);
  const [totalCount, setTableCount] = useState(0);
  const [classDeleteDialog, setClassDeleteDialog] = useState(false);
  const [dialogOpen, setdialogOpen] = useState<any>(false);

  const ALL = {
    label: 'All',
    value: 'All'
  };
  const [branchArray, setBranchArray] = useState<any>([ALL]);

  const handleToolbarBranch = (e: any) => {
    setSelectedBranch(e);
  };

  const handleDialog = () => {
    // if (isAdd) {
    //   searchParams.delete('add');
    //   setSearchParams(searchParams);
    // }
    setdialogOpen(false);
  };

  const TableColumns = [
    {
      align: 'center',
      component: COMPONENTS?.checkbox,
      selector: 'id',
      showInHeader: true
    },
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
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
      label: TABLE_LABELS?.USER_NAME,
      mapper: 'username',
      isSort: true
    }
  ];

  const nonAssignTableColumns = [
    {
      align: 'center',
      component: COMPONENTS?.checkbox,
      selector: 'id',
      showInHeader: true
    },
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
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
      label: TABLE_LABELS?.USER_NAME,
      mapper: 'username',
      isSort: true
    },
    {
      label: TABLE_LABELS?.ACTION,
      align: 'center',
      // component: 'COMPONENTS?.delete',
      mapper: 'assign_action',
      showInHeader: false
    }
  ];

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const noOfpages = getNoOfPages(tableData?.length, rowsPerPage);

  const headers = [
    TABLE_LABELS?.ID,
    TABLE_LABELS?.FIRST_NAME,
    TABLE_LABELS?.LAST_NAME,
    TABLE_LABELS?.USER_NAME
  ];
  const temps: any = rowsPerPage !== 'all' ? rowsPerPage : totalCount;

  const onAssignClassHandler = (teacherId: number[]) => {
    if (teacherId?.length > 0) {
      mutate({
        school_id: id || branchData?.school_id,
        branch_id: branchId,
        class_id: classDetail?.id,
        teachers_list: teacherId
      });
    } else {
      toast('error', 'Please select any Non-assigned teachers');
    }
  };

  // ASSIGN TEACHER API
  const branchId = BranchID || (selectedBranch === 'All' ? '' : selectedBranch);
  let assignOrdering = '';
  let orderSign = '';
  if (orderBy === 'username') {
    assignOrdering = 'user_id__user_name';
  } else {
    assignOrdering = orderBy;
  }
  if (order === 'desc') {
    orderSign = '-';
  } else {
    orderSign = '';
  }
  const { isLoading: assignLoading, refetch: assignRefetch } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/teachers/assigned/?limit=${temps}&school_id=${id || branchData?.school_data?.id}&branch_id=${branchId}&class_id=${classDetail?.id}&search=${searchString}&ordering=${orderSign}${assignOrdering}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response?.results;
      const body: any = [];
      const tableDataArray = respData?.map((item: any, i: any): any => {
        body.push([
          i + 1,
          item?.first_name,
          item?.last_name,
          item?.username
        ]);
        const temp = { ...item };
        return temp;
      });
      setTableData(tableDataArray);
      setAdminCsvData(body);
      setTableCount(respData?.length || 0);
    },
    onError: ({ response }: any) => { },
    enabled: false
  });

  // NON-ASSIGN API
  let assignOrdering2 = '';
  let orderSign2 = '';
  if (orderBy2 === 'username') {
    assignOrdering2 = 'user_id__user_name';
  } else {
    assignOrdering2 = orderBy;
  }
  if (order2 === 'desc') {
    orderSign2 = '-';
  } else {
    orderSign2 = '';
  }

  const { isLoading: newAssignLoading, refetch: newAssignRefetch } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/teachers/non-assigned/?limit=${temps}&school_id=${id || branchData?.school_data?.id}&branch_id=${branchId}&class_id=${classDetail?.id}&search=${searchString}&ordering=${orderSign2}${assignOrdering2}`,
    onSuccess: (resp: any) => {
      const respData = (resp?.data?.response?.results || []).map((dt: any) => ({
        ...dt,
        assign_action: (
          <Button variant="outlined" onClick={() => onAssignClassHandler([dt.id])}>
            Assign
          </Button>
        )
      }));
      newSetTableData(respData);
      setTableCount(respData?.length || 0);
    },
    onError: ({ response }: any) => { },
    enabled: false
  });

  // Delete Table Row
  // const { isLoading: , mutate:  } = useDelete({
  //   url: ``,
  //   onSuccess: () => {
  //     toast('success', 'Class Deleted successfully');
  //     setClassDeleteDialog(false);
  //     refetch();
  //     tempDataReset();
  //   },
  //   onError: ({ response }: any) => {
  //     toast('error', response?.statusText || 'Error');
  //   }
  // });

  const { isLoading: assignLoadingPatch, mutate } = usePatch({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/teachers/assign-class/`,
    onSuccess: (res: any) => {
      assignRefetch();
      newAssignRefetch();
      setBulkSelect([]);
      setBulkSelectNonAssign([]);
      toast('success', 'Teacher assigned successfully');
    },
    onError: () => {
      toast('error', 'Error');
    }
  });

  const { isLoading: removeTeacherLoading, mutate: removeTeacher } = usePatch({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/teachers/remove-class/`,
    onSuccess: (res: any) => {
      setClassDeleteDialog(false);
      assignRefetch();
      newAssignRefetch();
      setBulkSelect([]);
      setBulkSelectNonAssign([]);
      toast('success', 'Teachers removed successfully');
    },
    onError: () => {
      setClassDeleteDialog(false);
      toast('error', 'Error');
    }
  });

  const onRemoveTeacherHandler = (teacherId: number[]) => {
    if (teacherId?.length > 0) {
      removeTeacher({
        school_id: id || branchData?.school_id,
        branch_id: branchId,
        class_id: classDetail?.id,
        teachers_list: teacherId
      });
    }
  };

  useEffect(() => {
    if (BranchID && branchData?.id && classDetail?.id) {
      assignRefetch();
      newAssignRefetch();
    } else if (id && classDetail?.id) {
      assignRefetch();
      newAssignRefetch();
    }
  }, [selectedBranch, searchString, selectedClass, classDetail?.id, branchData, BranchID]);

  useEffect(() => {
    if (classDetail?.id) {
      assignRefetch();
    }
  }, [order, orderBy, classDetail?.id]);

  useEffect(() => {
    if (classDetail?.id) {
      newAssignRefetch();
    }
  }, [order2, orderBy2, classDetail?.id]);

  return (
    <div className="wrapperBorder">
      <Wrapper>
        <div className="flex flex-row justify-between">
          <div className="py-5">
            <PageTitle title={`Class : ${classDetail?.name} Assigned Teachers`} />
          </div>
          <div className="flex flex-row">
            {/* <div className="mx-2">
              <Button variant="outlined" onClick={() => setdialogOpen(true)}>Transfer</Button>
            </div> */}
            <div>
              <Button onClick={() => {
                if (bulkSelect.length) {
                  setClassDeleteDialog(true);
                } else {
                  toast('error', 'Please select any teacher');
                }
              }}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

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
          deleteHandler={deleteHandler}
          bulkSelect={bulkSelect}
          setBulkSelect={setBulkSelect}
          isLoading={assignLoading || removeTeacherLoading}
          setPage={setPage}
        />

        <hr />
        <div className="flex flex-row justify-between">
          <div className="py-5">
            <PageTitle title="Non Assigned Teachers" />
          </div>
          <div className="m-3">
            <Button onClick={() => onAssignClassHandler(bulkSelectNonAssign)}>Bulk Assign</Button>
          </div>
        </div>

        <hr className="my-2" />

        <AdvanceTable
          maxHeight={580}
          tableData={newtableData}
          headerRows={nonAssignTableColumns}
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
          rowsPerPage={rowsPerPage}
          order={order2}
          setOrder={setOrder2}
          orderBy={orderBy2}
          setOrderBy={setOrderBy2}
          deleteHandler={deleteHandler}
          bulkSelect={bulkSelectNonAssign}
          setBulkSelect={setBulkSelectNonAssign}
          isLoading={newAssignLoading || assignLoadingPatch}
          setPage={setPage}
        />
      </Wrapper>
      <CustomizedDialogs
        maxwidth="sm"
        open={dialogOpen}
        setOpen={() => {
          handleDialog();
        }}
        title="Transfer Teacher"
      >
        <TransferForm
          title="Teacher"
          selectedBranch={selectedBranch}
          branchArray={branchArray}
          handleToolbarBranch={handleToolbarBranch}
        />
      </CustomizedDialogs>
      <DeletePopup
        title="Remove Teacher"
        description="Are you sure you want to remove the teacher?"
        open={classDeleteDialog}
        setOpen={setClassDeleteDialog}
        handleDelete={() => onRemoveTeacherHandler(bulkSelect)}
      />
    </div>
  );
}
