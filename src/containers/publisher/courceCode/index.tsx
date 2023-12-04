import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import Button from '@component/button/button';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Dropdown from '@component/dropdown/Dropdown';
import { CustomInput } from '@component/input';
import DebounceInput from '@component/input/DebounceInput';
import CustomPagination from '@component/pagination/CustomPagination';
import { CODE_TYPE_ITEMS, COMPONENTS, RESULTS_PER_PAGE, TABLE_LABELS, TOOLBAR_LABELS } from '@constants/constants';
import routes from '@constants/routes';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReactComponent as Delete } from '@images/longMenuIcons/Delete2.svg';
import { ReactComponent as ISBN } from '@images/longMenuIcons/isbnNumber.svg';
import { ReactComponent as License } from '@images/longMenuIcons/license.svg';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import RouteLayout from '@layout/routeLayout';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import DeletePopup from '@shared/DeletePopup';
import { useDelete, useGet, usePatch, usePost } from '@shared/api/useApi';
import DatePicker from '@shared/form/DatePicker';
import Input from '@shared/form/Input';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import PageTitle from '@shared/pageTitle';
import toast from '@shared/toast';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages } from '@utility/utility';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { extendExpiryDateSchema, extendLicenseSchema } from './schema';

const printButton = () => <PrintIcon />;

export default function Index() {
  const navigate = useNavigate();
  const componentRef = useRef(null);

  const moreMenuOptions = [
    {
      icon: <License />,
      label: 'Extend License',
      value: 'extendLicense'
    },
    {
      icon: <ISBN />,
      label: 'View ISBN Number',
      value: 'viewISBNnumber'
    },
    {
      icon: <Delete />,
      label: 'Delete',
      value: 'delete'
    }
  ];
  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center'
    },
    {
      label: TABLE_LABELS?.CODE_NAME,
      mapper: 'code_name'
    },
    {
      label: TABLE_LABELS?.CODE_TYPE,
      mapper: 'code_type'
    },
    {
      label: TABLE_LABELS?.COURSES,
      mapper: 'courses_name'
    },
    {
      label: TABLE_LABELS?.LICENSE,
      mapper: 'license_count'
    },
    {
      label: TABLE_LABELS?.USED_LICENSE,
      mapper: 'used_license_count'
    },
    {
      label: TABLE_LABELS?.GENERATED_BY,
      mapper: 'generated_by'
    },
    {
      label: TABLE_LABELS?.GENERATED_DATE,
      mapper: 'generated_at'
    },
    {
      label: TABLE_LABELS?.EXPIRY_AT,
      isSort: true,
      mapper: 'end_date',
      format: 'DD-MM-YYYY'
    },
    {
      label: TABLE_LABELS?.STATUS,
      mapper: 'license_status'
    },
    {
      label: TABLE_LABELS?.ACTION,
      colspan: 2,
      align: 'center',
      bodyAlign: 'right',
      component: COMPONENTS?.switch,
      showInHeader: false
    },
    {
      bodyAlign: 'left',
      component: COMPONENTS?.longmenu,
      showInHeader: false
    }
  ];

  const [selectData, setSelectData] = useState('All');
  const [page, setPage] = useState(1);
  const [tableData, setTableData] = useState<any>([]);
  const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);
  const [order, setOrder] = useState<any>('des');
  const [orderBy, setOrderBy] = useState<any>('created_at');
  const [licenseDialog, setLicenseDialog] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeInDays, setActiveInDays] = useState(0);
  const [popupData, setpopupData] = useState<any>({});
  const [dialogOpen, setdialogOpen] = useState<boolean>(false);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [tempCSVData, setTempCSVData] = useState<[]>([]);
  const [csvData, setCsvData] = useState<[]>([]);
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [searchString, setSearchString] = useState('');
  const [courseDeleteDialog, setCourseDeleteDialog] = useState(false);
  const [openViewISBN, setOpenViewISBN] = useState(false);

  const headers = [
    TABLE_LABELS?.CODE_ID,
    TABLE_LABELS?.CODE_NAME,
    TABLE_LABELS?.CODE_TYPE,
    TABLE_LABELS?.COURSES,
    TABLE_LABELS?.LICENSE,
    TABLE_LABELS?.USED_LICENSE,
    TABLE_LABELS?.GENERATED_BY,
    TABLE_LABELS?.GENERATED_DATE,
    TABLE_LABELS?.EXPIRY_AT,
    TABLE_LABELS?.STATUS
  ];

  const handelSendEmail = () => {
    const payload = {
      list_type: 'course-code-list'
    };
    setPlayloadData({
      apicall: 'sendEmail',
      payload
    });
  };

  const handleToolbarAction = async (title: string) => {
    if (title === TOOLBAR_LABELS.ADD) {
      navigate(routes?.GENERATE_COURSE_CODE);
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
  };
  const handleCodeType = (e: any) => {
    setSelectData(e);
  };
  const handlePerPage = (e: any) => {
    setRowsPerPage(e);
  };
  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };
  const statusHandler = (e: any, data: any) => {
    const payload = {
      status: (e.target.checked) ? 'Active' : 'Inactive'
    };
    setPlayloadData({
      apicall: 'courseStatus',
      payload,
      id: data?.id
    });
  };
  const handleMoreOption = (id: any, rowData: any) => {
    setpopupData(rowData);
    if (id === 'extendLicense') {
      setdialogOpen(true);
    } else if (id === 'viewISBNnumber') {
      setOpenViewISBN(true);
    } else if (id === 'delete') {
      setCourseDeleteDialog(true);
    }
  };
  const tableReset = () => {
    setPage(1);
    setTableData([]);
    setTotalDataCount(0);
  };

  const allStateReset = () => {
    tableReset();
    tempDataReset();
  };

  const tempDataReset = () => {
    setPlayloadData({});
    setpopupData({});
  };

  const handleCourseDelete = () => {
    setCourseDeleteDialog(false);
    mutateDeleteCourseCode(popupData);
  };

  const handleClosePopup = () => {
    setOpenViewISBN(false);
  };

  // Toolbar Email
  const { isLoading: emailLoaded, mutate: mutateEmail } = usePost({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/course-code/pdf-download/`,
    onSuccess: (response: any) => {
      tempDataReset();
      toast('success', response?.data?.message || 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.message || 'Error');
      tempDataReset();
    }
  });

  // Status Update : Course
  const { isLoading: loadingStatus, mutate: mutateCourseStatus } = usePatch({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/course-code/${playloadData?.id}/change-status/`,
    onSuccess: (response: any) => {
      setPlayloadData({});
      refetch();
      toast('success', 'Status Updated successfully');
    },
    onError: ({ response }: any) => {
      refetch();
      toast('error', response?.statusText || 'Error');
    }
  });

  //  Delete School
  const { isLoading: loadingDeleteCourse, mutate: mutateDeleteCourseCode } = useDelete({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/course-code/${popupData?.id}/delete/`,
    onSuccess: (response: any) => {
      tempDataReset();
      refetch();
      toast('success', 'Course deleted successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  // Extend License : course
  const { isLoading: licenseSubmitLoader, mutate: mutateExtendLicense } = usePatch({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/course-code/${popupData?.id}/extend-license/`,
    onSuccess: (response: any) => {
      setdialogOpen(false);
      refetch();
      toast('success', 'Course License extended successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  const { isLoading: licenseSubmitExpiryDateLoader, mutate: mutateExpiryDate } = usePatch({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/course-code/${popupData?.id}/extend-license/`,
    onSuccess: (response: any) => {
      setdialogOpen(false);
      refetch();
      toast('success', 'Course License extended successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);
  // Get Course code Listing
  const temps = (rowsPerPage === 'all') ? totalDataCount : rowsPerPage;
  const ordering = order === 'asc' ? orderBy : `-${orderBy}`;
  const { isLoading, isRefetching, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/course-code/?limit=${temps}${searchString ? `&search=${searchString}` : ''}&offset=${(page - 1) * Number(temps)}${selectData !== 'All' ? `&code_type=${selectData}` : ''}&ordering=${ordering}`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData?.results;
      const body: any = [];
      if (respData?.length) {
        setTotalDataCount(accData?.count);
        const newtableData = respData?.map((item: any): any => {
          const names = item.courses?.map((obj: any) => obj.name).join(', ');
          body.push([
            item?.id,
            item?.code_name,
            item?.code_type,
            names,
            item?.license_count,
            item?.used_license_count,
            item?.generated_by,
            moment(item?.created_at).format('DD-MM-YYYY'),
            item?.end_date,
            item?.license_status
          ]);
          const temp = { ...item, courses_name: names, generated_at: moment(item?.created_at).format('DD-MM-YYYY') };
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
    enabled: false
  });

  useEffect(() => {
    if (Object.keys(playloadData).length) {
      if (playloadData?.apicall === 'courseStatus') {
        mutateCourseStatus(playloadData?.payload);
      } else if (playloadData?.apicall === 'sendEmail') {
        mutateEmail(playloadData?.payload);
      }
    }
  }, [playloadData]);

  useEffect(() => {
    refetch();
  }, [rowsPerPage, page, selectData, orderBy, order, searchString]);

  const { handleSubmit: handleOnSubmitExtendLicense, control: extendLicenseControl, reset: extendLicenseReset, setValue: setDatesExtendLicense } = useForm<any>({
    resolver: yupResolver(extendLicenseSchema),
    defaultValues: {
      flag: false
    }
  });

  const { handleSubmit: handleOnExpiryDate, control: expiryDateControl, watch, reset: expiryDateReset, setValue: setDatesExpiryDate } = useForm<any>({
    resolver: yupResolver(extendExpiryDateSchema),
    defaultValues: {
      flag: false
    }
  });

  useEffect(() => {
    if (popupData && Object.keys(popupData).length) {
      setDatesExpiryDate('extend_start_date', popupData?.end_date);
      setDatesExpiryDate('extend_end_date', popupData?.end_date);
      setActiveInDays(0);
      setDatesExtendLicense('current_number_license', popupData?.license_count);
      // setDatesExtendLicense('add_edit_number_license', popupData?.license_count);
      setExpirationDate(popupData?.end_date);
    }
  }, [popupData]);

  const startDateTemp = watch('extend_start_date');
  const endDateTemp = watch('extend_end_date');
  useEffect(() => {
    if (startDateTemp && endDateTemp) {
      const date1: any = new Date(startDateTemp);
      const date2: any = new Date(endDateTemp);
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDatesExpiryDate('exten_add_edit_license', Number.isInteger(diffDays) ? diffDays : 0);
      setActiveInDays(Number.isInteger(diffDays) ? diffDays : 0);
    }
  }, [startDateTemp, endDateTemp]);

  useEffect(() => {
    if (startDateTemp && endDateTemp && typeof endDateTemp === 'string') {
      setDatesExpiryDate('extend_end_date', startDateTemp);
    }
    if (startDateTemp && (startDateTemp > endDateTemp)) {
      setDatesExpiryDate('extend_end_date', startDateTemp);
    }
  }, [startDateTemp]);

  const onLicenseExtendHandler = (values: any) => {
    const payload = {
      start_date: moment(popupData?.start_date).format('YYYY-MM-DD'),
      end_date: moment(popupData?.end_date).format('YYYY-MM-DD'),
      course_activation_in_days: popupData?.course_activation_in_days,
      license_count: values?.add_edit_number_license
    };
    mutateExtendLicense(payload);
  };

  const onExpireDateHandler = (values: any) => {
    const payload = {
      start_date: moment(values?.extend_start_date).format('YYYY-MM-DD'),
      end_date: moment(values?.extend_end_date).format('YYYY-MM-DD'),
      course_activation_in_days: values?.exten_add_edit_license
    };
    mutateExpiryDate(payload);
  };

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.ADD,
      icon: <AddIcon />
    },
    {
      title: TOOLBAR_LABELS.EMAIL,
      icon: (emailLoaded) ? <Loader size={20} /> : <EmailIcon />
    },
    {
      title: TOOLBAR_LABELS.EXPORT,
      icon: (
        <CSVLink
          filename="Course Code List.csv"
          data={csvData}
          headers={headers}
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

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus title="Course Code" menuArray={ADMIN_TOOLBAR_MENU} handleToolbarAction={handleToolbarAction} />
      <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col ">
        <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0 items-end">
          <div>
            <DebounceInput
              onChange={(e) => setSearchString(e)}
              loading={isLoading}
            />
          </div>
          <Dropdown
            title="Sort by: Code Type"
            value={selectData}
            dataArray={CODE_TYPE_ITEMS}
            onChangeHandler={handleCodeType}
          />
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
            handleMoreOption={handleMoreOption}
            moreMenuOptions={moreMenuOptions}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            orderBy={orderBy}
            statusHandler={statusHandler}
            setPage={setPage}
            isLoading={isLoading || loadingDeleteCourse || loadingStatus || isRefetching}
          />
        </Wrapper>
      </div>
      <CustomizedDialogs
        onclose={() => { extendLicenseReset(); expiryDateReset(); }}
        open={dialogOpen}
        setOpen={() => setdialogOpen(false)}
        title="Extend Course Code"
      >
        <div className="flex justify-between items-center pb-4">
          <PageTitle title="Academic year: 2022-2023" />
          <p className="text-sm text-red-500 opacity-80">All (*) marked fields are mandatory</p>
        </div>
        <div className="grid grid-cols-1 content-center gap-y-3 md:gap-x-6">
          <CustomInput size="small" icon={true} required={true} name="current_expiration_date" value={moment(expirationDate).format('DD-MM-YYYY')} label="Current License Expiration Date" disabled={true} />
          {/* <Input required={true} control={control} name="password" type="password" label="Password" /> */}
        </div>
        <div className="py-4">
          <PageTitle title="Extend License" />
        </div>

        <form className="h-full pb-6" autoComplete="off" onSubmit={handleOnSubmitExtendLicense(onLicenseExtendHandler)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 content-center gap-y-3 md:gap-x-6">
            <Input required={true} control={extendLicenseControl} name="current_number_license" label="Current Number of License" disabled={true} />
            <div className="extend-course-extend-license">
              <Input required={true} control={extendLicenseControl} name="add_edit_number_license" label="Add/Edit License" />
              <Button
                disabled={false}
                loading={licenseSubmitLoader}
              >
                Add
              </Button>
            </div>
          </div>
        </form>

        <div className="py-4">
          <PageTitle title="Extend Expiry Date" />
        </div>
        <form className="h-full pb-6" autoComplete="off" onSubmit={handleOnExpiryDate(onExpireDateHandler)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 content-center gap-y-3 md:gap-x-6">
            <DatePicker
              control={expiryDateControl}
              name="extend_start_date"
              label="Start Date"
              disablePast={expirationDate ? new Date(expirationDate) : new Date()}
            />
            <DatePicker
              control={expiryDateControl}
              name="extend_end_date"
              label="End Date"
              disablePast={watch('extend_start_date')}
            />
            <Input required={true} control={expiryDateControl} name="exten_add_edit_license" label="No. of days count" disabled={true} />
          </div>
          <div className="py-8 float-right space-x-5">
            <Button
              disabled={false}
              loading={licenseSubmitExpiryDateLoader}
            >
              Add
            </Button>
          </div>
        </form>
      </CustomizedDialogs>
      <CustomizedDialogs title="ISBN Number" open={openViewISBN} setOpen={() => setOpenViewISBN(false)} maxwidth="sm" onclose={onclose}>
        <div className="mt-5 mb-5 text-center">
          {
            openViewISBN
              ? popupData?.courses?.map((item: any): JSX.Element => (
                <div className="flex mt-5 mb-5 text-xs font-normal">
                  <div className="w-full mr-5">
                    <span className="flex mb-2">Course Name</span>
                    <div className="flex bg-gray-200 rounded-md border border-linegray items-center px-6 py-3">
                      {item.name}
                    </div>
                  </div>
                  <div className="w-full">
                    <span className="flex mb-2">ISBN Numbar</span>
                    <div className="flex bg-gray-200 rounded-md border border-linegray items-center px-6 py-3">
                      {item.isbn_number}
                    </div>
                  </div>
                </div>
              )) : ''
          }
          <Button
            onClick={handleClosePopup}
          >
            Ok
          </Button>
        </div>
      </CustomizedDialogs>
      {/* Delete School */}
      <DeletePopup
        title="Remove Course"
        description="Are you sure you want to remove the course?"
        open={courseDeleteDialog}
        setOpen={setCourseDeleteDialog}
        handleDelete={handleCourseDelete}
      />
    </RouteLayout>
  );
}
