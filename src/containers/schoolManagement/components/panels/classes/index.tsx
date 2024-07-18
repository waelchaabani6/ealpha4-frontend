import CustomizedDialogs from '@component/dialog/CustomDialog';
import Dropdown from '@component/dropdown/Dropdown';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { useEffect, useRef, useState } from 'react';
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import DebounceInput from '@component/input/DebounceInput';
import CustomPagination from '@component/pagination/CustomPagination';
import {
  COMPONENTS,
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  TOOLBAR_LABELS,
} from '@constants/constants';
import { ASSIGN_CLASSES } from '@constants/routes';
import RouteLayout from '@layout/routeLayout';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import DeletePopup from '@shared/DeletePopup';
import { useDelete, useGet, usePost } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { selectSchoolData } from '@shared/store/schoolSlice';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages, userRole } from '@utility/utility';
import { CSVLink } from 'react-csv';
import { useSelector } from 'react-redux';
import ReactToPrint from 'react-to-print';
import AddNewClass from './addNewClass';

const printButton = () => <PrintIcon />;

export default function Index() {
  const { id, branchId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdd = searchParams.get('add');
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const location = useLocation();
  const componentRef = useRef(null);
  const TableColumns = [
    {
      align: 'center',
      component: COMPONENTS?.checkbox,
      selector: 'id',
      showInHeader: true,
    },
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
    },
    {
      label: TABLE_LABELS?.CLASS_NAME,
      isSort: true,
      mapper: 'name',
    },
    {
      label: TABLE_LABELS?.TEACHERS,
      isSort: true,
      mapper: 'teachers',
      align: 'center',
    },
    {
      label: TABLE_LABELS?.STUDENTS,
      isSort: true,
      mapper: 'students',
      align: 'center',
    },
    {
      label: TABLE_LABELS?.BRANCH_NAME,
      isSort: true,
      mapper: 'branch_name',
    },
    {
      label: TABLE_LABELS?.CREATED_ON,
      isSort: true,
      mapper: 'created_at',
    },
    {
      label: TABLE_LABELS?.ACTION,
      align: 'center',
      component: COMPONENTS?.delete,
    },
  ];

  const [csvData, setCsvData] = useState<any>([]);
  const onCsvClick = () => {
    const newCsv: any[] = [];
    if (bulkSelect?.length > 0) {
      nonModifiedTableData.forEach((param: any) => {
        const obj = bulkSelect.find((bid: any) => param?.id === bid);
        if (obj) {
          newCsv.push([
            param.id,
            param.name,
            param.teachers,
            param.students,
            param.branch_name,
            param.created_at,
          ]);
        }
      });
      setCsvData(newCsv);
    }
    if (bulkSelect.length === 0) {
      nonModifiedTableData.forEach((param: any) => {
        newCsv.push([
          param.id,
          param.name,
          param.teachers,
          param.students,
          param.branch_name,
          param.created_at,
        ]);
      });
      setCsvData(newCsv);
    }
    return true;
  };

  const headers = [
    TABLE_LABELS?.ID,
    TABLE_LABELS?.CLASS_NAME,
    TABLE_LABELS?.TEACHERS,
    TABLE_LABELS?.STUDENTS,
    TABLE_LABELS?.BRANCH_NAME,
    TABLE_LABELS?.CREATED_ON,
  ];

  const SORT_BY: Array<any> = [
    {
      label: 'All',
      value: 'All',
    },
    {
      label: 'Classes',
      value: 'name',
    },
    {
      label: 'Created Date',
      value: 'created_at',
    },
  ];

  const ALL = {
    label: 'Select',
    value: 'All',
  };
  const [dialogOpen, setdialogOpen] = useState<any>(isAdd || false);
  const [editClassData, setEditClass] = useState<any>(false);
  const [tableData, setTableData] = useState<any>([]);
  const [nonModifiedTableData, setNonModifiedTableData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTableCount] = useState(0);
  const [selectedSortBy, setSelectedSortBy] = useState('All');
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [searchString, setSearchString] = useState('');
  const [classDeleteDialog, setClassDeleteDialog] = useState(false);
  const [branchArray, setBranchArray] = useState<any>([ALL]);
  const [selectedBranch, setSelectedBranch] = useState(
    branchData?.name || ALL?.value
  );

  const handleDialog = () => {
    if (isAdd) {
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
    setdialogOpen(false);
  };

  const handleToolbarAction = (title: string) => {
    if (title === TOOLBAR_LABELS.ADD) {
      setdialogOpen(true);
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      importData();
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };

  const importData = async () => {
    const input: any = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = () => {
      const file = input?.files?.[0];
      const fileType = file.name.split('.').pop();
      if (fileType === 'csv') {
        const documentFormData: any = new FormData();
        documentFormData.append('csv_file', file);
        mutateImport(documentFormData);
      } else {
        toast('error', 'Please upload CSV filetype only');
      }
    };
    input.click();
  };

  const handelSendEmail = () => {
    const payload = {
      list_type: 'class-list',
      school_id: id || branchData?.school_data?.id,
      branch_id: branchData?.id || undefined,
    };
    setPlayloadData({
      apicall: 'sendEmail',
      payload,
    });
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const handleSortBy = (e: any) => {
    setOrderBy(e);
    setSelectedSortBy(e);
  };
  const handleToolbarBranch = (e: any) => {
    setSelectedBranch(e);
  };
  const handlePerPage = (e: any) => {
    setRowsPerPage(e);
  };
  const handleSearch = (value: any) => {
    setSearchString(value);
  };

  const handleClassDelete = () => {
    setClassDeleteDialog(false);
    mutateDeleteClass();
  };

  const deleteHandler = (row: any) => {
    const payload = {
      id: row?.school_class_ting,
    };
    setPlayloadData({
      apiCall: 'deleteClass',
      payload,
    });
    setClassDeleteDialog(true);
  };
  const tableReset = () => {
    setPage(1);
    setTableData([]);
    setTableCount(0);
    setBulkSelect([]);
  };
  const allStateReset = () => {
    tableReset();
    tempDataReset();
  };
  const tempDataReset = () => {
    setPlayloadData({});
  };

  const temps: any = rowsPerPage !== 'all' ? rowsPerPage : totalCount;
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;

  const onEditClick = (row: any) => {
    setEditClass(row);
    setdialogOpen(true);
  };

  // Get All Classes
  const { isLoading, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?school_id=${id || branchData?.school_data?.id}&limit=${temps}&search=${searchString}&offset=${(page - 1) * temps}&ordering=${ordering}&branch_name=${selectedBranch !== 'All' ? selectedBranch : ''}`,
    onSuccess: (res: any) => {
      const accData = res?.data?.response;
      const respData = accData?.results;
      if (respData?.length) {
        const body: any = [];
        const newTableData = respData?.map((i: any) => {
          body.push(i);
          return {
            ...i,
            name: (
              <span
                role="presentation"
                className="navigateLink"
                onClick={() => onEditClick(i)}
              >
                {i?.name}
              </span>
            ),
            teachers: (
              <Link
                to={`${location?.pathname}/${ASSIGN_CLASSES}/${i?.school_class_ting}?tabType=Teachers`}
              >
                <span className="navigateLink">{i?.teachers}</span>
              </Link>
            ),
            students: (
              <Link
                to={`${location?.pathname}/${ASSIGN_CLASSES}/${i?.school_class_ting}`}
              >
                <span className="navigateLink">{i?.students}</span>
              </Link>
            ),
            className: i?.name,
          };
        });
        setTableData(newTableData);
        setNonModifiedTableData(body);
        setTableCount(accData?.count || 0);
      } else {
        tableReset();
      }
    },
    onError: () => {
      allStateReset();
    },
    refetchOnWindowFocus: true,
    enabled: false,
  });

  // Import CSV
  const { isLoading: importLoaded, mutate: mutateImport } = usePost({
    baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
    url: `master-service/school-classes/csv-upload`,
    onSuccess: (response: any) => {
      tempDataReset();
      const res = response?.data?.response;
      const text = (
        <div className="font-semibold">
          <p>Manage Classes CSV Import </p>
          <p>
            <span className="mr-2">Total Records :</span>
            {res?.import_process_status?.total}
          </p>
          <p>
            <span className="mr-2">Success :</span>
            {res?.import_process_status?.passed_count}
          </p>
          <p>
            <span className="mr-2">Failure :</span>
            {res?.import_process_status?.failed_count}
          </p>
        </div>
      );
      toast('success', text);
      refetch();
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
      tempDataReset();
    },
  });

  // Delete Table Row
  const { isLoading: deleteLoading, mutate: mutateDeleteClass } = useDelete({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/${playloadData?.payload?.id}/delete`,
    onSuccess: () => {
      toast('success', 'Class Deleted successfully');
      setClassDeleteDialog(false);
      refetch();
      tempDataReset();
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    },
  });

  // get Branches
  const { isLoading: getBranchLoading, refetch: fetchBranch } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/branch-list/?school_id=${id || branchId}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const temp2: { label: any; value: any; id: any }[] = [];
      respData?.map((i: any) => {
        temp2.push({
          label: i?.name,
          value: i?.name,
          id: i?.id,
        });
        return temp2;
      });
      setBranchArray([ALL, ...temp2]);
    },
    onError: ({ response }: any) => {},
    enabled: false,
  });
  // Toolbar Email
  const { isLoading: emailLoaded, mutate: mutateEmail } = usePost({
    url: `users-service/class-list/pdf-download`,
    onSuccess: (response: any) => {
      tempDataReset();
      toast('success', response?.data?.message || 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      tempDataReset();
      toast('error', response?.data?.message || 'Error');
    },
  });

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.ADD,
      icon: <AddIcon />,
    },
    {
      title: TOOLBAR_LABELS.IMPORT,
      icon: <DriveFolderUploadIcon />,
    },
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailLoaded) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Class List.csv"
          onClick={onCsvClick}
          data={csvData}
          headers={headers}
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

  useEffect(() => {
    if (Object.keys(playloadData).length) {
      if (playloadData?.apicall === 'sendEmail') {
        mutateEmail(playloadData?.payload);
      }
    }
  }, [playloadData]);

  useEffect(() => {
    if (schoolData?.id && !branchId) {
      refetch();
    } else if (branchData?.id) {
      setSelectedBranch(branchData?.name);
      if (selectedBranch !== 'All') {
        refetch();
      }
    }
  }, [
    rowsPerPage,
    page,
    searchString,
    orderBy,
    order,
    selectedBranch,
    schoolData?.id,
    branchData?.id,
  ]);

  useEffect(() => {
    if (schoolData?.id) {
      fetchBranch();
    }
  }, [schoolData?.id, branchData?.id]);

  const handleSelection = (params: any) => {
    const newCsv: any[] = [];
    params.forEach((param: any) => {
      const obj = tableData.find((td: any) => td.name === param);
      if (obj) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, camelcase
        const { name, school_class_ting, ...rest } = obj;
        const row = { ...rest, class_name: name.props.children };
        newCsv.push([
          row.id,
          row.class_name,
          row.teachers,
          row.students,
          row.branch_name,
          row.created_at,
        ]);
      }
    });
    setCsvData(newCsv);
    setBulkSelect(params);
  };

  const noOfpages =
    rowsPerPage !== 'all' ? getNoOfPages(totalCount, rowsPerPage) : 1;

  if (importLoaded) {
    return <Loader />;
  }

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus
        title="Manage Classes"
        subtitle={`School : ${schoolData?.school_name || branchData?.school_data?.school_name}`}
        subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ''}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="max-w-xs">
            <DebounceInput onChange={handleSearch} />
          </div>
          <Dropdown
            title="Sort by:"
            value={selectedSortBy}
            dataArray={SORT_BY}
            onChangeHandler={handleSortBy}
          />
          {!userRole().isSchoolAdmin && !branchData?.id ? (
            <Dropdown
              title="Select Branch"
              value={selectedBranch}
              dataArray={branchArray}
              onChangeHandler={handleToolbarBranch}
              loading={getBranchLoading}
            />
          ) : null}

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
      <div className="wrapperBorder mt-3" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
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
            deleteHandler={deleteHandler}
            setBulkSelect={handleSelection}
            bulkSelect={bulkSelect}
            setPage={setPage}
            isLoading={isLoading || deleteLoading}
          />
        </Wrapper>
      </div>

      <CustomizedDialogs
        open={dialogOpen}
        setOpen={() => {
          handleDialog();
          setTimeout(() => {
            setEditClass(false);
          }, 500);
        }}
        title={`${editClassData ? 'Edit' : 'Add New'} Class`}
      >
        <AddNewClass
          title={editClassData?.branch_name || schoolData?.school_name}
          editData={editClassData}
          branchArray={branchArray}
          closeDialog={() => {
            setEditClass(false);
            refetch();
            handleDialog();
            setTimeout(() => {
              setEditClass(false);
            }, 500);
          }}
        />
      </CustomizedDialogs>

      {/* Delete Classes */}
      <DeletePopup
        title="Remove Class"
        description="Are you sure you want to remove the class?"
        open={classDeleteDialog}
        setOpen={setClassDeleteDialog}
        handleDelete={handleClassDelete}
      />
    </RouteLayout>
  );
}
