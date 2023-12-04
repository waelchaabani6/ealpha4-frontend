import Dropdown from '@component/dropdown/Dropdown';
import DebounceInput from '@component/input/DebounceInput';
import { TABLE_LABELS, TOOLBAR_LABELS } from '@constants/constants';
import { ADD_STUDENT, ADD_TEACHER, BRANCH, MANAGE_MEMBERS, SCHOOL, SCHOOL_MANAGEMENT } from '@constants/routes';
import MemberTabs from '@containers/schoolManagement/school/manageMembers/components/MemberTabs';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import RouteLayout from '@layout/routeLayout';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import DeletePopup from '@shared/DeletePopup';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectSchoolData } from '@shared/store/schoolSlice';
import toast from '@shared/toast';
import { userRole } from '@utility/utility';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import Student from './student';
import Teacher from './teacher';

const printButton = () => <PrintIcon />;

export default function AssignClasses() {
  const navigate = useNavigate();
  const componentRef = useRef(null);
  const { id, classID, branchId, schoolName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const ALL = {
    label: 'All',
    value: 'All'
  };
  const TEACHER = 'Teachers';
  const STUDENT = 'Students';
  const PARENT = 'Parents';
  // Pagination States
  const [selectedTab, setSelectedTab] = useState<any>(searchParams.get('tabType') || STUDENT);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<any>(100);
  const [popupData, setpopupData] = useState({});
  const [adminCsvData, setAdminCsvData] = useState<any>([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [branchArray, setBranchArray] = useState<any>([ALL]);
  const [selectedBranch, setSelectedBranch] = useState(ALL?.value);
  const [classArray, setClassArray] = useState<any>([ALL]);
  const [selectedClass, setSelectedClass] = useState(ALL?.value);
  const [searchString, setSearchString] = useState('');
  const [classDetail, setClassDetail] = useState<any>({});
  const schoolServiceBaseURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;

  const Teacherheader: any = [
    TABLE_LABELS?.ID,
    TABLE_LABELS?.USER_NAME,
    TABLE_LABELS?.FIRST_NAME,
    TABLE_LABELS?.LAST_NAME
  ];
  const Studentheader: any = [
    TABLE_LABELS?.ID,
    TABLE_LABELS?.USER_NAME,
    TABLE_LABELS?.FIRST_NAME,
    TABLE_LABELS?.LAST_NAME
  ];
  const Parentheader: any = [
    TABLE_LABELS?.ID,
    TABLE_LABELS?.USER_NAME,
    TABLE_LABELS?.FIRST_NAME,
    TABLE_LABELS?.LAST_NAME,
    TABLE_LABELS?.REGION,
    TABLE_LABELS?.STATUS
  ];

  const deleteHandler = (row: any) => {
    setpopupData(row);
    setDeleteDialog(true);
  };

  const tabProps = {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    setTotalDataCount,
    totalDataCount,
    deleteHandler,
    selectedBranch,
    selectedClass,
    searchString,
    schoolData,
    classID,
    schoolId: id,
    setSelectedBranch,
    setAdminCsvData,
    classDetail
  };

  const tabList = [
    { title: STUDENT, component: <Student {...tabProps} /> },
    { title: TEACHER, component: <Teacher {...tabProps} /> }
  ];

  const handleTabClick = (tabDetail: any) => {
    setRowsPerPage(100);
    setPage(1);
    setSearchParams({ tabType: tabDetail?.title });
    setSelectedTab(tabDetail?.title);
  };

  const handleHeadersForCSV = () => {
    if (selectedTab === TEACHER) {
      return Teacherheader;
    } if (selectedTab === PARENT) {
      return Parentheader;
    }
    return Studentheader;
  };

  const ADMIN_TOOLBAR_MENU = [
    {
      title: `${TOOLBAR_LABELS.ADD} ${selectedTab}`,
      icon: <AddIcon />
    },
    // {
    //   title: TOOLBAR_LABELS.IMPORT,
    //   icon: <DriveFolderUploadIcon />
    // },
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: <EmailIcon />
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

  // Toolbar Actions
  const handleToolbarAction = (title: string) => {
    if (title === `${TOOLBAR_LABELS.ADD} ${TEACHER}`) {
      // navigate(`${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/${MANAGE_MEMBERS}/${ADD_TEACHER}`);
      if (userRole().isSchoolAdmin || userRole().isBranchAdmin) {
        navigate(`/${schoolName}/dashboard/${branchData?.id ? `branch/${branchData?.id}` : schoolData?.id}/manage-members/add-teacher`);
      } else {
        navigate(`${SCHOOL_MANAGEMENT}/${branchId ? BRANCH : SCHOOL}/${id || branchData?.id}/${MANAGE_MEMBERS}/${ADD_TEACHER}`);
      }
    } else if (title === `${TOOLBAR_LABELS.ADD} ${STUDENT}`) {
      if (userRole().isSchoolAdmin || userRole().isBranchAdmin) {
        navigate(`/${schoolName}/dashboard/${branchData?.id ? `branch/${branchData?.id}` : schoolData?.id}/manage-members/add-student`);
      } else {
        navigate(`${SCHOOL_MANAGEMENT}/${branchId ? BRANCH : SCHOOL}/${id || branchData?.id}/${MANAGE_MEMBERS}/${ADD_STUDENT}`);
      }
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      importData();
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
    // mutateAdminDelete(popupData);
  };

  // -----------------------API---------------------------------
  // get All Branches
  const { isLoading: getBranchLoading, refetch: fetchBranch } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/school-branches/branch-list/?school_id=${id}&status=Active&limit=200`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      const temp2: { label: any; value: any }[] = [];
      respData?.map((i: any) => {
        temp2.push(
          {
            label: i?.name,
            value: i?.id
          }
        );
        return temp2;
      });
      setBranchArray([ALL, ...temp2]);
    },
    onError: ({ response }: any) => { },
    enabled: false
  });

  // Get All Classes
  const { isLoading: classLoading, refetch: fetchClasses } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/school-classes/?school_id=${id}&limit=200`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response?.results;
      const temp: { label: any; value: any }[] = [];
      respData?.map((i: any) => {
        temp.push(
          {
            label: i?.name,
            value: i?.id
          }
        );
        return temp;
      });
      setClassArray([ALL, ...temp]);
    },
    onError: () => { },
    enabled: false
  });

  // Get Class Detail
  const { isLoading: classDetailLoading, refetch: fetchDetailClasses } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/school-classes/${classID}/details/`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      setClassDetail(respData);
    },
    onError: () => { },
    enabled: false
  });
  // -----------------------End API---------------------------------
  useEffect(() => {
    if (id) {
      fetchBranch();
    }
    if (id || branchId) {
      fetchDetailClasses();
    }
  }, [id, branchId]);

  if (classDetailLoading) {
    return (<Loader />);
  }
  return (
    <RouteLayout>
      <HeaderMenus
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
        title={`${searchParams.get('tabType') || STUDENT} List`}
        subtitle={`School : ${schoolData?.school_name || branchData?.school_data?.school_name}`}
        subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ''}
      />
      <div className="flex gap-2 lg:mt-3 mb-5 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0">
          <div className="lg:pt-[30px]">
            <DebounceInput
              onChange={(e) => setSearchString(e)}
            />
          </div>
          {
            id
              ? (
                <Dropdown
                  title="Select Branch"
                  value={selectedBranch}
                  dataArray={branchArray}
                  loading={getBranchLoading}
                  onChangeHandler={(e) => setSelectedBranch(e)}
                />
              ) : null
          }
          {/* <Dropdown
            title="Select Class"
            value={selectedClass}
            dataArray={classArray}
            loading={classLoading}
            onChangeHandler={(e) => setSelectedClass(e)}
          /> */}
        </div>
        {/* <CustomPagination
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
        /> */}
      </div>
      <MemberTabs
        selectedTab={searchParams.get('tabType') === TEACHER ? TEACHER : STUDENT}
        handleTabClick={handleTabClick}
        tabs={tabList}
        paginateHandler={setPage}
        ref={componentRef}
      />
      {/* Delete Popup */}
      <DeletePopup
        title={`Remove ${selectedTab}`}
        description={`Are you sure you want to remove the ${selectedTab}?`}
        open={deleteDialog}
        setOpen={setDeleteDialog}
        handleDelete={handelConfirmDelete}
      />
    </RouteLayout>
  );
}
