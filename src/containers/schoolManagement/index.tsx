/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-shadow */
/* eslint-disable linebreak-style */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable implicit-arrow-linebreak */
import React, { useState, useEffect, useRef, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import { ReactComponent as Share } from "@images/pageHeaderIcons/share.svg";
import PrintIcon from "@mui/icons-material/Print";

import { useNavigate, Link } from "react-router-dom";
import routes, {
  PANEL,
  SCHOOL,
  SCHOOL_MANAGEMENT,
  BRANCH,
  EDIT,
  NEW_BRANCH,
  BRANCHES,
} from "@constants/routes";
import { CSVLink } from "react-csv";
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactToPrint from "react-to-print";
import { HeaderMenus } from "@shared/pageHeaderMenu/HeaderMenus";
import Dropdown from "@component/dropdown/Dropdown";
import AdvanceTable from "@component/AdvancedTable/AdvanceTable";
import { useDelete, useGet, usePatch, usePost } from "@shared/api/useApi";
import toast from "@shared/toast";
import DeletePopup from "@shared/DeletePopup";
import Loader from "@shared/loader";
import moment from "moment";
import DebounceInput from "@component/input/DebounceInput";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DatePicker from "@component/datepicker";

// import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import {
  STATUS_ITEMS,
  RESULTS_PER_PAGE,
  TOOLBAR_LABELS,
} from "../../constants/constants";
import CustomPagination from "../../components/pagination/CustomPagination";
import { getNoOfPages } from "../../utilities/utility";
import Wrapper from "../../shared/wrapper/Wrapper";
import ExtendLicensePopupForm from "./components/ExtendLicensePopupForm";
import RemoveBranchPopup from "./components/RemoveBranchPopup";
import MigrateUser from "./components/MigrateUser";
import PermanentlyRemoveBranch from "./components/PermanentlyRemoveBranch";
import RouteLayout from "../layout/routeLayout";

import {
  ALL,
  csvSubHeaders,
  headers,
  moreMenuOptions,
  subTableHeader,
  TableColumns,
} from "./utils";

const printButton = () => <PrintIcon />;
const masterServiceBaseURL = import.meta.env.VITE_APP_MASTER_SERVICE_URL;
const SELECT = "Select";

type removedBranchObjectType = {
  school_id: string;
  current_branch_id: string;
};

const SchoolManagmentList = (): JSX.Element => {
  let noOfpages = 1;
  const navigate = useNavigate();

  const [tempCSVData, setTempCSVData] = useState<[]>([]);
  const [csvData, setCsvData] = useState<[]>([]);

  const [tableData, setTableData] = useState<any>([]);
  const [bulkSelect, setBulkSelect] = useState<any>([]);
  const [removedBranchObject, setRemovedBranchObject] =
    useState<removedBranchObjectType | null>(null);

  useEffect(() => {
    let finalData = [];
    if (bulkSelect?.length) {
      let tempArr: any = [];
      tableData?.map((i: any) => {
        const getBranchDatas = i.subData?.filter((i2: any) =>
          bulkSelect.includes(i2.id)
        );
        tempArr = [...tempArr, ...getBranchDatas];
        return tempArr;
      });
      const body: any = [];
      if (tempArr.length) {
        tempArr.map((item1: any) => {
          body.push([
            item1?.school_id,
            item1?.school_name,
            item1?.id,
            item1?.branch_name,
            item1?.branch_type,
            moment(item1?.created_at).format("DD-MM-YYYY"),
            item1?.activation_end_date,
            item1?.expiration_days,
            item1?.status,
          ]);
          return body;
        });
      }
      finalData = body;
    } else {
      finalData = tempCSVData;
    }
    // @ts-ignore
    setCsvData(finalData);
  }, [bulkSelect]);

  const [selectData, setSelectData] = useState<any>(ALL?.value);
  const [selectedAcademicYear, setselectedAcademicYear] = useState(ALL?.value);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [page, setPage] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  // const [academicYearArray, setAcademicYearArray] = useState<any>([ALL]);

  const [licenseDialog, setLicenseDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [migrateDialog, setMigrateDialog] = useState(false);
  const [permanentyRemoveDialog, setPermanentyRemoveDialog] = useState(false);
  const [schoolDeleteDialog, setSchoolDeleteDialog] = useState(false);
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [popupData, setpopupData] = useState<any>({});
  const [selectedCountry, setCountry] = useState<string>("Select");

  const [migrateTo, setMigrateTo] = useState("");
  const [order, setOrder] = useState<any>("desc");
  const [orderBy, setOrderBy] = useState<any>("created_at");

  const [searchString, setSearchString] = useState("");

  const [date, setDate] = useState<any>("");

  /*
  IMPORTANT:: Please do not remove this code. as it will be required in future.
  const [selectRegion, setSelectRegion] = useState<any>(ALL?.value);

  const handleSelectRegion = (e: any) => {
    setSelectRegion(e);
  };

  TODO:: Please append below url with main url
  ${selectRegion !== 'All' ? `&region=${selectRegion}`: '' }${searchString ? `&search=${searchString}`: ''}

  TODO:: Add below variables in useEffect.
  searchString, selectRegion,
  */
  const handleStatus = (e: any) => {
    setSelectData(e);
  };

  // const handleAcademic = (e: any) => {
  //   setselectedAcademicYear(e);
  // };

  const handlePerPage = (e: any) => {
    setPage(1);
    setRowsPerPage(e);
  };

  const countryChangeHandler = (val: string) => {
    setCountry(val);
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD_NEW_SCHOOL) {
      navigate(routes?.SCHOOL_MANAGEMENT__ADD);
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      importData();
    }
  };

  const importData = async () => {
    const input: any = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = () => {
      const file = input?.files?.[0];
      const fileType = file.name.split(".").pop();
      if (fileType === "csv") {
        const documentFormData = new FormData();
        documentFormData.append("csv_file", file);
        mutateImport(documentFormData);
      } else {
        toast("error", "Please upload CSV filetype only");
      }
    };
    input.click();
  };

  const handelSendEmail = () => {
    const payload = {
      list_type: "school-list",
    };
    setPlayloadData({
      apicall: "sendEmail",
      payload,
    });
  };

  const handleMoreOption = (id: any, rowData: any) => {
    if (id === "editSchoolDetails") {
      console.log(`${SCHOOL_MANAGEMENT}/${SCHOOL}/${rowData.id}/${EDIT}`);
      navigate(`${SCHOOL_MANAGEMENT}/${SCHOOL}/${rowData.id}/${EDIT}`);
    } else if (id === "addNewBranch") {
      navigate(`${SCHOOL_MANAGEMENT}/${SCHOOL}/${rowData.id}/${NEW_BRANCH}`);
    } else {
      setpopupData(rowData);
      if (id === moreMenuOptions[2]?.value) {
        setLicenseDialog(true);
      } else if (id === moreMenuOptions[3]?.value) {
        if ("branch_ting" in rowData) {
          setDeleteDialog(true);
        } else {
          setSchoolDeleteDialog(true);
        }
      }
    }
  };

  const statusHandler = (e: any, data: object | any) => {
    const payload = {
      status: e.target.checked ? "Active" : "Inactive",
    };
    if ("branch_ting" in data) {
      setPlayloadData({
        apicall: "branchStatus",
        payload,
        id: data?.id,
      });
    } else {
      setPlayloadData({
        apicall: "schoolStatus",
        payload,
        id: data?.school_id,
      });
    }
  };

  const tableReset = () => {
    setPage(1);
    setTableData([]);
    setTotalDataCount(0);
    setBulkSelect([]);
  };

  const allStateReset = () => {
    tableReset();
    tempDataReset();
  };

  const tempDataReset = () => {
    setPlayloadData({});
    setpopupData({});
  };

  const handleSchoolDelete = () => {
    setSchoolDeleteDialog(false);
    mutateDeleteSchool(popupData);
  };

  /* ---------------------------------------------------------------------------------------------------------
    Start API
   --------------------------------------------------------------------------------------------------------- */
  //  Get Academiic Year
  // const { isLoading: academicYearLoading, refetch: academicFetch } = useGet({
  //   baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
  //   url: 'master-service/academic-year/',
  //   cacheTime: 2000,
  //   onSuccess: (res: any) => {
  //     const resp = res?.data || [];
  //     setAcademicYearArray([ALL, ...resp]);
  //   },
  // });

  // Toolbar Email
  const { isLoading: emailLoaded, mutate: mutateEmail } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/school-list/pdf-download`,
    onSuccess: (response: any) => {
      tempDataReset();
      toast("success", response?.data?.message || "Email sent successfully");
    },
    onError: ({ response }: any) => {
      toast("error", response?.data?.message || "Error");
      tempDataReset();
    },
  });

  // Import CSV
  const { isLoading: importLoaded, mutate: mutateImport } = usePost({
    baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
    url: `master-service/schools/csv-upload`,
    onSuccess: (response: any) => {
      tempDataReset();
      const res = response?.data?.response;
      const text = (
        <div className="font-semibold">
          <p>School Management CSV Import </p>
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
      toast("success", text);
      refetch();
    },
    onError: ({ response }: any) => {
      toast("error", response?.statusText || "Error");
      tempDataReset();
    },
  });

  //  Delete School
  const { isLoading: loadingDeleteSchool, mutate: mutateDeleteSchool } =
    useDelete({
      baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
      url: `schools-service/schools/delete-school/${popupData?.school_id}/`,
      onSuccess: (response: any) => {
        tempDataReset();
        refetch();
        toast("success", "School deleted successfully");
      },
      onError: ({ response }: any) => {
        toast("error", response?.statusText || "Error");
      },
    });

  // Status Update : School
  const { isLoading: loadingStatus, mutate: mutateSchoolStatus } = usePatch({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/change-status/${playloadData?.id}/`,
    onSuccess: (response: any) => {
      setPlayloadData({});
      refetch();
      toast("success", "Status Updated successfully");
    },
    onError: ({ response }: any) => {
      refetch();
      toast("error", response?.statusText || "Error");
    },
  });

  // Status Update : Branch
  const { isLoading: loadingBranchStatus, mutate: mutateBranchStatus } =
    usePatch({
      baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
      url: `schools-service/school-branches/change-status/${playloadData?.id}`,
      onSuccess: (response: any) => {
        setPlayloadData({});
        refetch();
        toast("success", "Status Updated successfully");
      },
      onError: ({ response }: any) => {
        toast("error", response?.statusText || "Error");
      },
    });

  const { data: countryData, isLoading: countryLoading } = useGet({
    baseURL: masterServiceBaseURL,
    url: "master-service/country/",
  });

  // Get School Listing
  const temps = rowsPerPage === "all" ? totalDataCount : rowsPerPage;
  const ordering = order === "asc" ? orderBy : `-${orderBy}`;
  const formatDate = date !== "" ? moment(date).format("YYYY-MM-DD") : "";

  const { isLoading, isRefetching, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/get-schools/?limit=${temps}&offset=${(page - 1) * Number(temps)}&status=${selectData !== "All" ? selectData : ""}&academic_year=${selectedAcademicYear !== "All" ? selectedAcademicYear : ""}&ordering=${ordering}&search=${searchString}${selectedCountry && selectedCountry !== "Select" ? `&country=${selectedCountry}` : ``}&created_at=${formatDate}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const body: any = [];
      if (respData?.length) {
        setTotalDataCount(accData?.count);
        const newtableData = respData?.map((item: any): any => {
          body.push([
            item?.id,
            item?.name,
            item?.school_type,
            item?.branch_count,
            moment(item?.created_at).format("YYYY-MM-DD"),
            item?.activation_end_date,
            item?.expiration_days_left,
            item?.status,
          ]);
          if (
            removedBranchObject &&
            removedBranchObject.school_id === item?.id
          ) {
            item.branch_count -= 1;
          }
          let temp = {
            ...item,
            name: (
              <Link to={`${SCHOOL_MANAGEMENT}/${SCHOOL}/${item?.id}/${PANEL}`}>
                <span className="navigateLink">{item?.name}</span>
              </Link>
            ),
            branch_count: (
              <Link
                to={`${SCHOOL_MANAGEMENT}/${SCHOOL}/${item?.id}/${BRANCHES}`}
              >
                <span className="navigateLink">{item?.branch_count}</span>
              </Link>
            ),
            school_name: item?.name,
            activation_end_date: moment(item?.activation_end_date).format(
              "DD-MM-YYYY"
            ),
          };
          if (temp?.subData?.length) {
            const subData = temp?.subData
              .map((i: any) => {
                if (
                  removedBranchObject &&
                  removedBranchObject.current_branch_id === i?.id
                ) {
                  return null;
                }
                const newD = {
                  ...i,
                  name: (
                    <Link
                      to={`${SCHOOL_MANAGEMENT}/${BRANCH}/${i?.id}/${PANEL}`}
                    >
                      <span className="navigateLink">{i?.name}</span>
                    </Link>
                  ),
                  branch_name: i?.name,
                  school_name: item?.name,
                  activation_end_date: moment(item?.activation_end_date).format(
                    "DD-MM-YYYY"
                  ),
                };
                return newD;
              })
              .filter((ele: any) => ele);
            temp = { ...temp, subData };
          }
          return temp;
        });
        setTempCSVData(body);
        setCsvData(body);
        setTableData(newtableData);
      } else {
        tableReset();
      }
    },
    onError: ({ response }: any) => {
      allStateReset();
    },
    enabled: false,
  });

  const { isLoading: migrateBranchLoading, mutate: mutateMigrateBranch } =
    usePost({
      baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
      url: `users-service/branch/migrate-remove/`,
      onSuccess: (response: any) => {
        setPlayloadData({});
        setMigrateDialog(false);
        refetch();
        toast(
          "success",
          response?.data?.message || "Branch Migrated successfully"
        );
      },
      onError: ({ response }: any) => {
        toast("error", response?.data?.message || "Error");
      },
    });
  /* ---------------------------------------------------------------------------------------------------------
     * End API *
     --------------------------------------------------------------------------------------------------------- */

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.ADD_NEW_SCHOOL,
      icon: <AddIcon />,
    },
    // {
    //   title: TOOLBAR_LABELS.EMAIL,
    //   icon: emailLoaded ? <Loader size={20} /> : <EmailIcon />,
    // },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename={
            bulkSelect?.length
              ? "Branch List.csv"
              : "School Management List.csv"
          }
          data={csvData}
          headers={bulkSelect?.length ? csvSubHeaders : headers}
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
      if (playloadData?.apicall === "schoolStatus") {
        mutateSchoolStatus(playloadData?.payload);
      } else if (playloadData?.apicall === "branchStatus") {
        mutateBranchStatus(playloadData?.payload);
      } else if (playloadData?.apicall === "sendEmail") {
        mutateEmail(playloadData?.payload);
      }
    }
  }, [playloadData]);

  useEffect(() => {
    refetch();
  }, [
    rowsPerPage,
    page,
    selectData,
    selectedAcademicYear,
    orderBy,
    order,
    searchString,
    selectedCountry,
    date,
  ]);

  // useEffect(() => {
  //   academicFetch();
  // }, []);

  noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  const componentRef = useRef(null);

  const branchArr = tableData
    ?.find((item: any) => item?.id === popupData?.school_id)
    ?.subData?.filter((i: any) => i?.id !== popupData?.id);

  if (importLoaded) {
    return <Loader />;
  }

  const countryDataArray = useMemo(() => {
    if (
      countryData?.data?.results &&
      Array.isArray(countryData?.data?.results)
    ) {
      return [
        { label: SELECT, value: SELECT },
        ...(countryData.data.results.map((item: any) => ({
          label: item.name,
          value: item.name,
        })) ?? []),
      ];
    }
    return [{ label: SELECT, value: SELECT }];
  }, [countryData]);

  // const { school_name: schoolName, role } = useSelector(selectUser);
  // console.log(role.name, 'role');
  // console.log(schoolName, 'schoolName');

  const handleReset = () => {
    setDate("");
  };

  return (
    <RouteLayout>
      <HeaderMenus
        title="School Managementt"
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div className="max-w-xs">
            <DebounceInput
              onChange={(value: string) => setSearchString(value)}
              loading={isLoading}
            />
          </div>
          {/*
          IMPORTANT:: Please do not remove this code. as it will be required in future.
          <Dropdown
            title="Select : Region"
            value={selectRegion}
            dataArray={STATUS_ITEMS}
            onChangeHandler={handleSelectRegion}
          />
          */}
          <Dropdown
            title="Select : Status"
            value={selectData}
            dataArray={STATUS_ITEMS}
            onChangeHandler={handleStatus}
          />
          {/* <Dropdown
            title="Academic Year"
            value={selectedAcademicYear}
            dataArray={academicYearArray}
            onChangeHandler={handleAcademic}
            loading={academicYearLoading}
          /> */}
          <Dropdown
            title="Result Of Pages"
            value={rowsPerPage}
            dataArray={RESULTS_PER_PAGE}
            onChangeHandler={handlePerPage}
          />

          <Dropdown
            title="country"
            displayEmpty={false}
            value={selectedCountry}
            loading={countryLoading}
            dataArray={countryDataArray}
            onChangeHandler={countryChangeHandler}
            sxClass={{ width: "100%" }}
          />

          <div className="flex gap-x-4 items-end">
            <DatePicker
              value={date}
              label="Created On"
              handlePickerChange={(date: string) => setDate(date)}
              sxType={4}
              defaultStyle={true}
              format="YYYY-MM-DD"
              disablePast={false}
            />
            <span
              className="mb-1"
              tabIndex={0}
              title="Clear Date"
              onClick={handleReset}
              role="button"
            >
              <RestartAltIcon />
            </span>
          </div>
        </div>

        <CustomPagination
          totalPages={noOfpages}
          paginateHandler={handlePagination}
          currentPage={page}
        />
      </div>

      {/* Table Section */}
      <div className="wrapperBorder mt-3" ref={componentRef}>
        <Wrapper>
          <AdvanceTable
            tableData={tableData}
            headerRows={TableColumns}
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            handleMoreOption={handleMoreOption}
            moreMenuOptions={moreMenuOptions}
            subTableHeader={subTableHeader}
            setBulkSelect={setBulkSelect}
            bulkSelect={bulkSelect}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            statusHandler={statusHandler}
            isLoading={
              loadingDeleteSchool || isLoading || loadingStatus || isRefetching
            }
          />
        </Wrapper>
      </div>

      {/* Extend License Dialog */}
      <ExtendLicensePopupForm
        propDatas={popupData}
        title={moreMenuOptions[2].label}
        licenseDialog={licenseDialog}
        setLicenseDialog={setLicenseDialog}
        refetch={refetch}
      />

      {/* Remove Branch */}
      <RemoveBranchPopup
        title="Remove Branch"
        propDatas={popupData}
        refetch={refetch}
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
        setMigrateDialog={setMigrateDialog}
        setRemovedBranchObject={setRemovedBranchObject}
      />

      {/* Migrate User */}
      <MigrateUser
        title="Migrate Branch"
        propDatas={popupData}
        migrateDialog={migrateDialog}
        setMigrateDialog={setMigrateDialog}
        migrateTo={migrateTo}
        setMigrateTo={setMigrateTo}
        migraToData={branchArr}
        mutateMigrateBranch={mutateMigrateBranch}
        loading={migrateBranchLoading}
      />

      {/* Permanently Remove Branch */}
      <PermanentlyRemoveBranch
        title="Remove Branch"
        permanentyRemoveDialog={permanentyRemoveDialog}
        setPermanentyRemoveDialog={setPermanentyRemoveDialog}
      />

      {/* Delete School */}
      <DeletePopup
        title="Remove School"
        description="Are you sure you want to remove the school?"
        remark="Please note that this action Will take some time to take effect."
        open={schoolDeleteDialog}
        setOpen={setSchoolDeleteDialog}
        handleDelete={handleSchoolDelete}
      />
    </RouteLayout>
  );
};

export default SchoolManagmentList;
