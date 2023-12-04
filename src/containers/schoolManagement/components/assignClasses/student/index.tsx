import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Button from '@component/button/button';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { COMPONENTS, TABLE_LABELS } from '@constants/constants';
import DeletePopup from '@shared/DeletePopup';
import { useGet, usePatch } from '@shared/api/useApi';
import PageTitle from '@shared/pageTitle';
import { selectSchoolData } from '@shared/store/schoolSlice';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages } from '@utility/utility';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import TransferForm from '../TransferForm';

export default function Student(props: any) {
  const { page, setPage, rowsPerPage, setRowsPerPage, setTotalDataCount, deleteHandler, selectedBranch, setSelectedBranch, searchString, selectedClass, classID, setAdminCsvData, classDetail } = props;
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [tableData, setTableData] = useState<any>([]);
  const [nonAssigntableData, setNonAssignTableData] = useState<any>([]);
  const [order, setOrder] = useState<any>('desc');
  const [order2, setOrder2] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('first_name');
  const [orderBy2, setOrderBy2] = useState<any>('first_name');
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [bulkSelectNonAssign, setBulkSelectNonAssign] = useState<any>([]);
  const { id, branchId: BranchID } = useParams();
  const [totalCount, setTableCount] = useState(0);
  const [classDeleteDialog, setClassDeleteDialog] = useState(false);
  const [dialogOpen, setdialogOpen] = useState<any>(false);
  const ALL = {
    label: 'All',
    value: 'All'
  };
  const [branchArray, setBranchArray] = useState<any>([ALL]);
  const userServiceBaseURL = import.meta.env.VITE_APP_USER_SERVICE_URL;

  const handleToolbarBranch = (e: any) => {
    setSelectedBranch(e);
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
    // {
    //   label: TABLE_LABELS?.CLASSES,
    //   mapper: 'classes'
    // },
    {
      label: TABLE_LABELS?.ACTION,
      align: 'center',
      // component: 'COMPONENTS?.delete',
      mapper: 'assign_action',
      showInHeader: false
    }
  ];

  const handleDialog = () => {
    // if (isAdd) {
    //   searchParams.delete('add');
    //   setSearchParams(searchParams);
    // }
    setdialogOpen(false);
  };
  const onAssignClassHandler = (studentId: number[]) => {
    if (studentId?.length > 0) {
      mutate({
        school_id: id || branchData?.school_id,
        branch_id: branchId,
        class_id: classDetail?.id,
        students_list: studentId
      });
    } else {
      toast('error', 'Please select any Non-assigned students');
    }
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const noOfpages = getNoOfPages(tableData?.length, rowsPerPage);

  const temps: any = rowsPerPage !== 'all' ? rowsPerPage : totalCount;

  // Assign Student Api
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
  const branchId = BranchID || (selectedBranch === 'All' ? '' : selectedBranch);
  const { isLoading: assignLoading, refetch: assignRefetch } = useGet({
    baseURL: userServiceBaseURL,
    url: `users-service/students/assigned/?limit=${temps}&school_id=${id || branchData?.school_data?.id}${branchId ? `&branch_id=${branchId}` : ''}&class_id=${classDetail?.id}&search=${searchString}&ordering=${orderSign}${assignOrdering}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response?.results;
      const body: any = [];
      const newtableData = respData?.map((item: any, i: any): any => {
        body.push([
          i + 1,
          item?.first_name,
          item?.last_name,
          item?.username
        ]);
        const temp = { ...item };
        return temp;
      });
      setTableData(newtableData);
      setAdminCsvData(body);
      setTableCount(respData?.length || 0);
    },
    onError: ({ response }: any) => { },
    enabled: false
  });

  // Non Assign Student Api
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
  const { isLoading: nonassignLoading, refetch: nonassignRefetch } = useGet({
    baseURL: userServiceBaseURL,
    url: `users-service/students/non-assigned/?limit=${temps}&school_id=${id || branchData?.school_data?.id}${branchId ? `&branch_id=${branchId}` : ''}&class_id=${classDetail?.id}&search=${searchString}&ordering=${orderSign2}${assignOrdering2}`,
    onSuccess: (resp: any) => {
      const respData = (resp?.data?.response?.results || []).map((dt: any) => ({
        ...dt,
        assign_action: (
          <Button variant="outlined" onClick={() => onAssignClassHandler([dt.id])}>
            Assign
          </Button>
        )
      }));
      setNonAssignTableData(respData);
      setTableCount(respData?.length || 0);
    },
    onError: ({ response }: any) => { },
    enabled: false
  });

  const { isLoading, mutate } = usePatch({
    baseURL: userServiceBaseURL,
    url: `users-service/students/assign-class/`,
    onSuccess: (res: any) => {
      nonassignRefetch();
      assignRefetch();
      toast('success', 'Student assigned successfully');
      setBulkSelect([]);
      setBulkSelectNonAssign([]);
    },
    onError: () => {
      toast('error', 'Error');
    }
  });

  const { isLoading: removeStudentLoading, mutate: removeStudent } = usePatch({
    baseURL: userServiceBaseURL,
    url: `users-service/students/remove-class/`,
    onSuccess: (res: any) => {
      setClassDeleteDialog(false);
      nonassignRefetch();
      assignRefetch();
      setBulkSelect([]);
      setBulkSelectNonAssign([]);
      toast('success', 'Student removed successfully');
    },
    onError: () => {
      setClassDeleteDialog(false);
      toast('error', 'Error');
    }
  });

  const onRemoveStudentHandler = (studentId: number[]) => {
    if (studentId?.length > 0) {
      removeStudent({
        school_id: id || branchData?.school_id,
        branch_id: branchId,
        class_id: classDetail?.id,
        students_list: studentId
      });
    }
  };

  useEffect(() => {
    if (BranchID && branchData?.id && classDetail?.id) {
      assignRefetch();
      nonassignRefetch();
    } else if (id && classDetail?.id) {
      assignRefetch();
      nonassignRefetch();
    }
  }, [selectedBranch, searchString, selectedClass, classDetail?.id, branchData, BranchID]);

  useEffect(() => {
    if (classDetail?.id) {
      assignRefetch();
    }
  }, [order, orderBy, classDetail?.id]);

  useEffect(() => {
    if (classDetail?.id) {
      nonassignRefetch();
    }
  }, [order2, orderBy2, classDetail?.id]);

  return (
    <div className="wrapperBorder">
      <Wrapper>
        <div className="flex flex-row justify-between">
          <div className="py-5">
            <PageTitle title={`Class : ${classDetail?.name} Assigned Students`} />
          </div>
          <div className="flex flex-row">
            {/* <div className="mx-2">
              <Button variant="outlined" onClick={() => setdialogOpen(true)}>Transfer</Button>
            </div> */}
            <div>
              <Button
                onClick={() => {
                  if (bulkSelect.length) {
                    setClassDeleteDialog(true);
                  } else {
                    toast('error', 'Please select any student');
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
          setBulkSelect={setBulkSelect}
          bulkSelect={bulkSelect}
          isLoading={isLoading || removeStudentLoading}
          setPage={setPage}
        />
        <hr />
        <div className="flex flex-row justify-between">
          <div className="py-5">
            <PageTitle title="Non Assigned Students" />
          </div>
          <div className="m-3">
            <Button onClick={() => onAssignClassHandler(bulkSelectNonAssign)}>Bulk Assign</Button>
          </div>
        </div>

        <hr className="my-2" />
        <AdvanceTable
          maxHeight={580}
          tableData={nonAssigntableData}
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
          setBulkSelect={setBulkSelectNonAssign}
          bulkSelect={bulkSelectNonAssign}
          isLoading={nonassignLoading || assignLoading}
          setPage={setPage}
        />
      </Wrapper>
      <CustomizedDialogs
        maxwidth="sm"
        open={dialogOpen}
        setOpen={() => {
          handleDialog();
        }}
        title="Transfer Student"
      >
        <TransferForm
          title="Student"
          selectedBranch={selectedBranch}
          branchArray={branchArray}
          handleToolbarBranch={handleToolbarBranch}
        />
      </CustomizedDialogs>
      <DeletePopup
        title="Remove Student"
        description="Are you sure you want to remove the student?"
        open={classDeleteDialog}
        setOpen={setClassDeleteDialog}
        handleDelete={() => onRemoveStudentHandler(bulkSelect)}
      />
    </div>
  );
}
