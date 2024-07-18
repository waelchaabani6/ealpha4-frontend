import {
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  TOOLBAR_LABELS,
} from '@constants/constants';
import { getNoOfPages, sortData, userRole } from '@utility/utility';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { useEffect, useState, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import Dropdown from '@component/dropdown/Dropdown';
import CustomPagination from '@component/pagination/CustomPagination';
import RouteLayout from '@layout/routeLayout';
import {
  ADD_PARENT,
  ADD_STUDENT,
  ADD_TEACHER,
  BRANCH,
  MANAGE_MEMBERS,
  SCHOOL,
  SCHOOL_MANAGEMENT,
} from '@constants/routes';
import { CSVLink } from 'react-csv';
import toast from '@shared/toast';
import DeletePopup from '@shared/DeletePopup';
import { useDelete, useGet, usePatch } from '@shared/api/useApi';
import DebounceInput from '@component/input/DebounceInput';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import Loader from '@shared/loader';
import Button from '@component/button/button';
import Parent from './parent';
import Teachers from './teachers';
import Student from './student';
import MemberTabs from './components/MemberTabs';

const printButton = () => <PrintIcon />;

export default function Index() {
  const navigate = useNavigate();
  const { id, branchId, schoolName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const componentRef = useRef(null);

  const { schoolData, branchData } = useSelector(selectSchoolData);
  const ALL = {
    label: 'All',
    value: 'All',
  };
  const TEACHER = 'Teachers';
  const STUDENT = 'Students';
  const PARENT = 'Parents';

  const [selectedTab, setSelectedTab] = useState<any>(
    searchParams.get('tabType') || TEACHER
  );
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [popupData, setpopupData] = useState<any>({});
  const [adminCsvData, setAdminCsvData] = useState<any>([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [branchArray, setBranchArray] = useState<any>([ALL]);
  const [selectedBranch, setSelectedBranch] = useState(ALL?.value);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [classArray, setClassArray] = useState<any>([ALL]);
  const [selectedClass, setSelectedClass] = useState(ALL?.value);
  const [searchString, setSearchString] = useState('');
  const [tableReload, setTableReload] = useState<boolean>(false);
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [isMultiDelete, setIsMultiDelete] = useState<boolean>(false);
  const [parentData, setParentData] = useState<any>([]);

  const Teacherheader: any = [
    TABLE_LABELS?.ID,
    TABLE_LABELS?.BRANCH_NAME,
    TABLE_LABELS?.USER_NAME,
    TABLE_LABELS?.FIRST_NAME,
    TABLE_LABELS?.LAST_NAME,
    TABLE_LABELS?.CLASSES,
  ];
  const Studentheader: any = [
    TABLE_LABELS?.ID,
    TABLE_LABELS?.USER_NAME,
    TABLE_LABELS?.FIRST_NAME,
    TABLE_LABELS?.LAST_NAME,
    TABLE_LABELS?.CLASS_NAME,
  ];
  const Parentheader: any = [
    TABLE_LABELS?.ID,
    TABLE_LABELS?.USER_ID,
    TABLE_LABELS?.BRANCH_NAME,
    TABLE_LABELS?.USER_NAME,
    TABLE_LABELS?.FIRST_NAME,
    TABLE_LABELS?.LAST_NAME,
    TABLE_LABELS?.STUDENTS,
    TABLE_LABELS?.CLASS_NAME,
  ];

  const deleteHandler = (row: any) => {
    setpopupData(row);
    setDeleteDialog(true);
    setIsMultiDelete(false);
  };

  let tabProps: any = {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    setTotalDataCount,
    totalDataCount,
    deleteHandler,
    selectedBranchId,
    selectedBranch,
    selectedClass,
    searchString,
    tableReload,
    setTableReload,
    schoolData,
    branchData,
    setBulkSelect,
    bulkSelect,
    setParentData,
  };

  const handleTabClick = (tabDetail: any) => {
    setRowsPerPage(RESULTS_PER_PAGE?.[0]);
    setPage(1);
    setSearchParams({ tabType: tabDetail?.title });
    setSelectedTab(tabDetail?.title);
    setBulkSelect([]);
  };

  const handleHeadersForCSV = () => {
    if (selectedTab === TEACHER) {
      return Teacherheader;
    }
    if (selectedTab === PARENT) {
      return Parentheader;
    }
    return Studentheader;
  };

  const getUrl = () => {
    let emailUrl = 'users-service/';
    if (selectedTab === TEACHER) {
      emailUrl += 'teachers-list/';
    }
    if (selectedTab === STUDENT) {
      emailUrl += 'students-list/';
    }
    if (selectedTab === PARENT) {
      emailUrl += 'parents-list/';
    }
    emailUrl += 'pdf-download/';

    // if we get Id in url params then school is selected and if we get
    // branchId then branch is selected.
    if (id) {
      emailUrl += `?school_id=${id}`;
    } else if (branchId) {
      emailUrl += `?branch_id=${branchId}`;
    }
    return emailUrl;
  };

  // Toolbar Email
  const {
    isLoading: emailLoaded,
    isRefetching,
    refetch: fetchEmailApi,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: getUrl(),
    onSuccess: (response: any) => {
      toast('success', response?.data?.message || 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
    },
    enabled: false,
  });

  const handelSendEmail = () => {
    fetchEmailApi();
  };

  // Toolbar Actions
  const handleToolbarAction = (title: string) => {
    if (title === `${TOOLBAR_LABELS.ADD} ${TEACHER}`) {
      if (userRole().isSchoolAdmin || userRole().isBranchAdmin) {
        navigate(
          `/${schoolName}/dashboard/${branchData?.id ? `branch/${branchData?.id}` : schoolData?.id}/manage-members/add-teacher`
        );
      } else {
        navigate(
          `${SCHOOL_MANAGEMENT}/${branchId ? BRANCH : SCHOOL}/${id || branchData?.id}/${MANAGE_MEMBERS}/${ADD_TEACHER}`
        );
      }
    } else if (title === `${TOOLBAR_LABELS.ADD} ${STUDENT}`) {
      if (userRole().isSchoolAdmin || userRole().isBranchAdmin) {
        navigate(
          `/${schoolName}/dashboard/${branchData?.id ? `branch/${branchData?.id}` : schoolData?.id}/manage-members/add-student`
        );
      } else {
        navigate(
          `${SCHOOL_MANAGEMENT}/${branchId ? BRANCH : SCHOOL}/${id || branchData?.id}/${MANAGE_MEMBERS}/${ADD_STUDENT}`
        );
      }
    } else if (title === `${TOOLBAR_LABELS.ADD} ${PARENT}`) {
      if (userRole().isSchoolAdmin || userRole().isBranchAdmin) {
        navigate(
          `/${schoolName}/dashboard/${branchData?.id ? `branch/${branchData?.id}` : schoolData?.id}/manage-members/add-parent`
        );
      } else {
        navigate(
          `${SCHOOL_MANAGEMENT}/${branchId ? BRANCH : SCHOOL}/${id || branchData?.id}/${MANAGE_MEMBERS}/${ADD_PARENT}`
        );
      }
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
        documentFormData.append('import_type', 'sub-admin');
        // mutateImport(documentFormData);
      } else {
        toast('error', 'Please upload CSV filetype only');
      }
    };
    input.click();
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handelConfirmDelete = () => {
    setDeleteDialog(false);
    if (isMultiDelete) {
      let selectedID = [...bulkSelect];
      const getKey = getKeyName();
      if (selectedTab === PARENT) {
        selectedID = parentData
          .filter((ele: { id: number }) => bulkSelect.includes(ele.id))
          .map((ele: { user_id: number }) => ele.user_id);
      }
      if (getKey) {
        const payload = {
          [getKey]: selectedID,
        };
        setBulkSelect([]);
        multipleDeleteRow(payload);
      }
    } else {
      mutateDeleteRow();
    }
  };

  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);

  // -----------------------API---------------------------------
  // get All Branches
  const { isLoading: getBranchLoading, refetch: fetchBranch } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/branch-list/?school_id=${id || branchData?.school_id}&status=Active&limit=200`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const temp2: { label: any; value: any; id: number }[] = [];
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

  // Get All Classes
  const { isLoading: classLoading, refetch: fetchClasses } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-classes/?school_id=${id || branchData?.school_id}&branch_name=${branchData?.name || ''}&limit=200&ordering=name`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response?.results;
      const temp: { label: any; value: any }[] = [];
      respData?.map((i: any) => {
        temp.push({
          label: i?.name,
          value: i?.name,
        });
        temp.sort(sortData);
        return temp;
      });
      setClassArray([ALL, ...temp]);
    },
    onError: () => {},
    enabled: false,
  });

  const reset = () => {
    setpopupData({});
    setDeleteDialog(false);
  };

  // Delete Table Row
  const { isLoading: deleteLoading, mutate: mutateDeleteRow } = useDelete({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/${selectedTab.toLowerCase().substring(0, selectedTab.length - 1) || ''}/${popupData?.id}/delete/`,
    onSuccess: () => {
      setTableReload(true);
      toast(
        'success',
        `${selectedTab.substring(0, selectedTab.length - 1)} Deleted successfully`
      );
      reset();
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
      reset();
    },
  });

  // Delete multiple Table Row
  const { isLoading: deleteMultipleLoading, mutate: multipleDeleteRow } =
    usePatch({
      baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
      url: `users-service/${`${selectedTab.toLowerCase().substring(0, selectedTab.length - 1)}s` || ''}/bulk-delete/`,
      onSuccess: () => {
        setIsMultiDelete(false);
        setTableReload(true);
        toast(
          'success',
          `${selectedTab.substring(0, selectedTab.length - 1)} Deleted successfully`
        );
        reset();
      },
      onError: ({ response }: any) => {
        setIsMultiDelete(false);
        toast('error', response?.statusText || 'Error');
        reset();
      },
    });

  // -----------------------API---------------------------------
  tabProps = {
    ...tabProps,
    deleteLoading,
    setAdminCsvData,
  };
  const tabList = [
    { title: TEACHER, component: <Teachers {...tabProps} /> },
    { title: STUDENT, component: <Student {...tabProps} /> },
    { title: PARENT, component: <Parent {...tabProps} /> },
  ];

  const ADMIN_TOOLBAR_MENU = [
    {
      title: `${TOOLBAR_LABELS.ADD} ${selectedTab}`,
      icon: <AddIcon />,
    },
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: (emailLoaded || isRefetching) ? <Loader size={20} /> : <EmailIcon />
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename={`${selectedTab} List.csv`}
          data={adminCsvData}
          headers={handleHeadersForCSV()}
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
    if (branchId && branchData && Object.keys(branchData).length) {
      fetchClasses();
    } else if (id) {
      fetchBranch();
      fetchClasses();
    }
  }, [id, branchId, branchData]);

  const getKeyName = () => {
    if (selectedTab === TEACHER) {
      return 'teachers_list';
    }
    if (selectedTab === STUDENT) {
      return 'students_list';
    }
    if (selectedTab === PARENT) {
      return 'parents_list';
    }
    return '';
  };

  const handleDelete = () => {
    setIsMultiDelete(true);
    setDeleteDialog(true);
  };

  return (
    <RouteLayout>
      <HeaderMenus
        title="Manage Members"
        subtitle={`School : ${schoolData?.school_name || branchData?.school_data?.school_name}`}
        subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ''}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />

      <div className="flex gap-2 lg:mt-7 mb-5 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="lg:pt-[30px]">
            <DebounceInput onChange={(e) => setSearchString(e)} />
          </div>
          {/* !userRole().isSchoolAdmin &&  */}
          {id && (
            <Dropdown
              title="Select Branch"
              value={selectedBranch}
              dataArray={branchArray}
              loading={getBranchLoading}
              onChangeHandler={(e) => {
                setSelectedBranchId(
                  branchArray.find(
                    (ele: { value: string; id: string }) => ele.value === e
                  )?.id
                );
                setSelectedBranch(e);
              }}
            />
          )}
          <Dropdown
            title="Select Class"
            value={selectedClass}
            dataArray={classArray}
            loading={classLoading}
            onChangeHandler={(e) => setSelectedClass(e)}
          />
          <Dropdown
            title="Result Of Pages"
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
      <div className="relative">
        <div className="relative right-0 float-right xl:top-0 xl:absolute">
          <Button disabled={!bulkSelect.length} onClick={handleDelete}>
            {' '}
            Delete{' '}
          </Button>
        </div>
        <MemberTabs
          ref={componentRef}
          handleTabClick={handleTabClick}
          tabs={tabList}
          paginateHandler={setPage}
          selectedTab={searchParams.get('tabType') || selectedTab}
        />
      </div>
      {/* Delete Popup */}
      <DeletePopup
        title={`Remove ${selectedTab}`}
        description={`Are you sure you want to remove the ${selectedTab.substring(0, selectedTab.length - 1)}${isMultiDelete ? 's' : ''}?`}
        open={deleteDialog}
        setOpen={setDeleteDialog}
        handleDelete={handelConfirmDelete}
        onclose={() => setpopupData({})}
      />
    </RouteLayout>
  );
}
