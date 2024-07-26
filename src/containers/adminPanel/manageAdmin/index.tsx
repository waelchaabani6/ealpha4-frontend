/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */
import Button from '@component/button/button';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Checkbox from '@component/checkbox';
import Input from '@shared/form/Input';
import RadioGroup from '@shared/form/RadioGroup';
import Select from '@shared/form/Select';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import { ReactComponent as Download } from '@images/pageHeaderIcons/download.svg';
import { ReactComponent as Share } from '@images/pageHeaderIcons/share.svg';
import PrintIcon from '@mui/icons-material/Print';
import PageTitle from '@shared/pageTitle';
import React, { useState, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { useForm } from 'react-hook-form';
import CustomPagination from '@component/pagination/CustomPagination';
import { getNoOfPages } from '@utility/utility';
import RouteLayout from '@layout/routeLayout';
import DebounceInput from '@component/input/DebounceInput';
import Dropdown from '@component/dropdown/Dropdown';
import {
  PASSWORD_REGEX,
  PASSWORD_REGEX_MESSAGE,
  PHONE_NUMBER_REGEX,
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  TOOLBAR_LABELS,
} from '@constants/constants';
import toast from '@shared/toast';
import { usePatch, usePost } from '@shared/api/useApi';
import Loader from '@shared/loader';
import Tabs from '@shared/newTab/Tab';
import { yupResolver } from '@hookform/resolvers/yup';
import { backdropClasses, FormControlLabel } from '@mui/material';
import { CSVLink } from 'react-csv';
import * as yup from 'yup';
import { textTransform } from '@mui/system';

type FormInputTypes = {
  user_name: any;
  password?: any;
  first_name: boolean;
  last_name: string;
  email: string;
  phone_number: number;
  nationality?: any;
  region: any;
  admin_user?: any;
  gender?: any;
  flag?: any;
};

const printButton = () => <PrintIcon />;

export default function Index(props: any) {
  const [editMode, setEditMode] = useState<boolean>(false);
  let shape = {
    user_name: yup.string().required('Username is required.'),
    password: yup.string().matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
    first_name: yup.string().required('First name is required.'),
    last_name: yup.string().required('Last name is required.'),
    email: yup
      .string()
      .email('Invalid email address.')
      .required('Email is required.'),
    phone_number: yup
      .string()
      .min(1, 'Phone number is required.')
      .max(12, 'Phone number cannot be more than 12 ')
      .matches(PHONE_NUMBER_REGEX, 'Invalid phone number.'),
    nationality: yup.string().required('Nationality is required.').nullable(),
    gender: yup.string().required('Gender is required.').nullable(),
    region: yup.string().when('flag', {
      is: false,
      then: yup.string().required('Region is required'),
      otherwise: yup.string().optional(),
    }),
    flag: yup.boolean(),
  };
  if (editMode) {
    shape = {
      ...shape,
      password: yup.string().when('password', {
        is: (val: any) => val?.length,
        then: yup.string().matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
        otherwise: yup.string().optional(),
      }),
    };
  }

  const [dialogOpen, setdialogOpen] = useState<boolean>(false);
  const [buttonOpenForm, setButtonOpenForm] = useState<boolean>(false);
  const [subAdminTing, setSubAdminTing] = useState<any>();
  const [page, setPage] = useState(1);
  const [curTotalPages, setCurTotalPages] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const noOfpages = getNoOfPages(curTotalPages, rowsPerPage);
  const [searchString, setSearchString] = useState<any>('');
  const [triggerExport, setTriggerExport] = useState<any>(false);
  const [adminCsvData, setAdminCsvData] = useState<any>([]);
  const [selectedRegion, setSelectedRegion] = useState<any>('');
  const header = [
    TABLE_LABELS?.ID,
    TABLE_LABELS?.USER_NAME,
    TABLE_LABELS?.FIRST_NAME,
    TABLE_LABELS?.LAST_NAME,
    TABLE_LABELS?.REGION,
    TABLE_LABELS?.STATUS,
  ];
  const componentRef = useRef(null);
  const userServicesBaseURL = import.meta.env.VITE_APP_USER_SERVICE_URL;
  const masterServicesBaseURL = import.meta.env.VITE_APP_MASTER_SERVICE_URL;

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.ADD,
      icon: <AddIcon />,
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
          filename="Admin Management List.csv"
          data={adminCsvData}
          headers={header}
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

  const tabList = [{ title: 'Global' }, { title: 'Region' }];

  const addSubAdminSchema = yup
    .object()
    .shape(shape, [['password', 'password']]);

  const {
    handleSubmit,
    control,
    setError,
    reset,
    clearErrors,
    setValue,
    watch,
  } = useForm<FormInputTypes>({
    resolver: yupResolver(addSubAdminSchema),
    defaultValues: {
      flag: false,
    },
  });

  const onSubmit = (values: any) => {
    const updatedDetails = { ...values };
    delete updatedDetails.user_name;
    editMode
      ? updatedDetails.password
        ? updatedDetails.password
        : delete updatedDetails.password
      : null;
    editMode ? update(updatedDetails) : mutate(values);
  };

  /// add/////
  const { isLoading, mutate } = usePost({
    baseURL: userServicesBaseURL,
    url: 'users-service/create-sub-admin/',
    onSuccess: ({
      data: {
        response: { data },
      },
    }: any) => {
      !buttonOpenForm ? setdialogOpen(false) : setdialogOpen(true);
      reset();
      toast('success', 'Successfully Created');
    },
    onError: ({ response }: any) => {
      toast('error', 'Error');
      handleErrorResponse(response?.data?.errors);
    },
  });

  /// update/////
  const { isLoading: updateLoading, mutate: update } = usePatch({
    baseURL: userServicesBaseURL,
    url: `${'users-service/edit-sub-admin-details/'}${subAdminTing}/`,
    onSuccess: ({
      data: {
        response: { data },
      },
    }: any) => {
      reset();
      setdialogOpen(false);
      setEditMode(false);
      toast('success', 'Successfully Updated');
    },
    onError: ({ response }: any) => {
      toast('error', 'Error');
      handleErrorResponse(response?.data?.errors);
    },
    handleErrorResponse: (errorObj: any) => {
      Object.keys(errorObj).forEach((key1: any) => {
        setError(key1, { type: 'manual', message: errorObj[key1][0] });
      });
    },
  });
  // setValue in editForm///
  const handleEditPopup = (val: any) => {
    const flagValue = val?.region === 'global';
    setdialogOpen(true);
    setEditMode(true);
    setSubAdminTing(val?.id);
    setValue('user_name', val?.username);
    setValue('first_name', val?.first_name);
    setValue('last_name', val?.last_name);
    setValue('email', val?.email);
    setValue('phone_number', val?.phone_number);
    setValue('nationality', val?.nationality);
    setValue('gender', val?.gender);
    setValue('region', val?.region);
    setValue('flag', flagValue);
  };

  const handleErrorResponse = (errorObj: any) => {
    Object.keys(errorObj).forEach((key1: any) => {
      setError(key1, { type: 'manual', message: errorObj[key1][0] });
    });
  };

  const handleToolbarAction = (title: string) => {
    if (title === TOOLBAR_LABELS.ADD) {
      setdialogOpen(true);
      reset();
    } else if (title === TOOLBAR_LABELS.EXPORT) {
      setTriggerExport(true);
    } else if (title === TOOLBAR_LABELS.IMPORT) {
      importData();
    } else if (title === TOOLBAR_LABELS.EMAIL) {
      handelSendEmail();
    }
    setEditMode(false);
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
        mutateImport(documentFormData);
      } else {
        toast('error', 'Please upload CSV filetype only');
      }
    };
    input.click();
  };

  const handelSendEmail = () => {
    const payload = {
      list_type: 'admin-list',
      region: selectedRegion?.title?.toLowerCase(),
    };
    mutateEmail(payload);
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
  };

  const handlePerPage = (e: any) => {
    setPage(1);
    setRowsPerPage(e);
  };

  // Import CSV
  const { isLoading: importLoaded, mutate: mutateImport } = usePost({
    baseURL: masterServicesBaseURL,
    url: `master-service/admins/csv-upload`,
    onSuccess: (response: any) => {
      const res = response?.data?.response;
      const text = (
        <div className="font-semibold">
          <p>Manage Admin CSV Import </p>
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
      setTriggerExport(true);
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    },
  });

  // Toolbar Email
  const { isLoading: emailLoaded, mutate: mutateEmail } = usePost({
    baseURL: userServicesBaseURL,
    url: `users-service/sub-admins/pdf-download?region=${selectedRegion?.title?.toLowerCase()}`,
    onSuccess: (response: any) => {
      toast('success', 'Email sent successfully');
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    },
  });
  const onCheckHandler = (checked: boolean) => {
    clearErrors('region');
    setValue('flag', checked);
    !checked ? setValue('region', '') : setValue('region', 'global');
  };
  if (importLoaded || emailLoaded) {
    return <Loader />;
  }

  return (
    <>
      <RouteLayout navBack={true}>
        <HeaderMenus
          title="Manage Admin"
          menuArray={ADMIN_TOOLBAR_MENU}
          handleToolbarAction={handleToolbarAction}
        />
        <div className="flex gap-2 mt-7 lg:items-end items-center lg:flex-row flex-col mb-5">
          <div className="flex flex-wrap md:justify-start justify-center gap-2 lg:grow grow-0">
            <div className="pt-[30px]">
              <DebounceInput onChange={(val) => setSearchString(val)} />
            </div>
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
        {/* searchString={searchString} */}
        <Tabs
          ref={componentRef}
          setSelectedRegion={setSelectedRegion}
          triggerExport={triggerExport}
          setTriggerExport={setTriggerExport}
          setPage={setPage}
          setRowsPerPage={setRowsPerPage}
          tabs={tabList}
          searchString={searchString}
          setCurTotalPages={setCurTotalPages}
          paginateHandler={setPage}
          currentPage={page}
          noOfpages={noOfpages}
          curTotalPages={curTotalPages}
          rowsPerPage={rowsPerPage}
          handleEditPopup={handleEditPopup}
          setAdminCsvData={setAdminCsvData}
          editMode={editMode}
        />
        <CustomizedDialogs
          onclose={() => reset()}
          open={dialogOpen}
          setOpen={() => setdialogOpen(false)}
          title={editMode ? 'Edit Admin' : 'Add Admin'}
        >
          <form
            className="h-full pb-6"
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex justify-between items-center pb-4">
              <PageTitle title="Login Information" />
              <p className="text-sm text-red-500 opacity-80">
                All (*) marked fields are mandatory
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 content-center gap-y-3 md:gap-x-6">
              <Input
                required={true}
                control={control}
                name="user_name"
                label="Username"
                disabled={!!editMode}
                sxClass={{
                  'input[type="text"]': {
                    textTransform: 'lowercase',
                  },
                }}
                tolowercase={true}
              />
              <Input
                required={true}
                control={control}
                name="password"
                type="password"
                label="Password"
                autoComplete="new-password"
              />
            </div>
            <div className="py-4">
              <PageTitle title="Basic Information" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 content-center gap-y-3 md:gap-x-6">
              <Input
                required={true}
                control={control}
                name="first_name"
                label="First Name"
              />
              <Input
                required={true}
                control={control}
                name="last_name"
                label="Last Name"
              />
              <Input
                required={true}
                control={control}
                name="email"
                label="Email Id"
              />
              <Input
                required={true}
                control={control}
                name="phone_number"
                label="Phone Number"
              />
              <Input
                required={true}
                control={control}
                name="nationality"
                label="Nationality"
              />
              <RadioGroup
                required={true}
                control={control}
                name="gender"
                label="Gender"
                dataArray={[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                ]}
              />
              {!watch('flag') ? (
                <Select
                  required={true}
                  control={control}
                  name="region"
                  label="Region"
                  dataArray={[
                    { label: 'KSA', value: 'KSA' },
                    { label: 'Jordan', value: 'Jordan' },
                    { label: 'Lebanon', value: 'Lebanon' },
                    { label: 'Egypt', value: 'Egypt' },
                    { label: 'Syria', value: 'Syria' },
                    { label: 'Bahrain', value: 'Bahrain' },
                    { label: 'UAE', value: 'UAE' },
                    { label: 'Kuwait', value: 'Kuwait' },
                    { label: 'Ecuador', value: 'Ecuador' },
                    { label: 'Panama', value: 'Panama' },
                    { label: 'Turkey', value: 'Turkey' },
                    { label: 'Smart', value: 'Smart' },
                    { label: 'Russia', value: 'Russia' },
                    { label: 'Kazak', value: 'Kazak' },
                    { label: 'Korea', value: 'Korea' },
                    { label: 'Europe', value: 'Europe' },
                    { label: 'Africa', value: 'Africa' },
                    { label: 'Tunis', value: 'Tunis' },
                    { label: 'Spain', value: 'Spain' },
                    { label: 'Yamen', value: 'Yamen' },
                    { label: 'Brazil', value: 'Brazil' },
                    { label: 'USA', value: 'USA' },
                    { label: 'Canada', value: 'Canada' },
                    { label: 'China', value: 'China' },
                    { label: 'France', value: 'France' },
                    { label: 'Trail', value: 'Trail' },
                    { label: 'FIN', value: 'FIN' },
                  ]}
                />
              ) : null}
              <div className="flex -ml-2.5 lg:items-end">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch('flag')}
                      onChange={(_, checked) => onCheckHandler(checked)}
                    />
                  }
                  label="Mark as Global"
                />
              </div>
            </div>
            <div className="py-8 float-right space-x-5">
              {!editMode && (
                <Button
                  variant="outlined"
                  disabled={isLoading}
                  loading={isLoading}
                  onClick={() => setButtonOpenForm(true)}
                >
                  Save and Add New
                </Button>
              )}

              <Button
                disabled={updateLoading}
                loading={updateLoading}
                onClick={() => setButtonOpenForm(false)}
              >
                {editMode ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </CustomizedDialogs>
      </RouteLayout>
    </>
  );
}
