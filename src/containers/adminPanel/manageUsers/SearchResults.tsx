/* eslint-disable comma-dangle */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import {
  COMPONENTS,
  PASSWORD_REGEX,
  PASSWORD_REGEX_MESSAGE,
  RESULTS_PER_PAGE,
  TABLE_LABELS,
} from '@constants/constants';
import { yupResolver } from '@hookform/resolvers/yup';
import PageTitle from '@shared/pageTitle';
import Wrapper from '@shared/wrapper/Wrapper';
import { getNoOfPages } from '@utility/utility';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '@shared/form/Input';

import * as yup from 'yup';
import Button from '@component/button/button';
import toast from '@shared/toast';
import { usePost } from '@shared/api/useApi';
import CustomPagination from '@component/pagination/CustomPagination';
import Dropdown from '@component/dropdown/Dropdown';
import Loader from '@shared/loader';

type FormInputTypes = {
  // user_name: any;
  password?: any;
  // first_name: boolean;
  // last_name: string;
  // email: string;
  // phone_number: number;
  // nationality?: any;
  // region: any;
  // admin_user?: any;
  // gender?: any;
  // flag?: any;
};

const userServicesBaseURL = import.meta.env.VITE_APP_USER_SERVICE_URL;

type SearchResultsProps = {
  searchData: any;
  rowsPerPage: number;
  page: number;
  setPage: any;
  totalDataCount: number;
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
  LogListLoading: boolean;
  fetchUsers: any;
};

export default function SearchResults({
  searchData,
  rowsPerPage,
  page,
  setPage,
  totalDataCount,
  setRowsPerPage,
  LogListLoading,
  fetchUsers,
}: SearchResultsProps) {
  // const [page, setPage] = useState(1);
  const [order, setOrder] = useState<any>('desc');
  const [orderBy, setOrderBy] = useState<any>('assessment_name');
  // const [rowsPerPage, setRowsPerPage] = useState(RESULTS_PER_PAGE?.[0]);

  const [dialogOpen, setdialogOpen] = useState<boolean>(false);
  const [buttonOpenForm, setButtonOpenForm] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);

  const navigate = useNavigate();
  const { schoolName } = useParams();

  const TableColumns = [
    {
      label: TABLE_LABELS?.SR_NO,
      align: 'center',
      mapper: 'id',
    },
    {
      label: TABLE_LABELS?.USER_NAME,
      mapper: 'user_name',
      isSort: true,
    },
    {
      label: TABLE_LABELS?.FIRST_NAME,
      mapper: 'first_name',
      isSort: true,
    },
    {
      label: TABLE_LABELS?.LAST_NAME,
      mapper: 'last_name',
      isSort: true,
    },
    {
      label: TABLE_LABELS?.ACTION,
      mapper: 'Action',
      align: 'center',
      component: COMPONENTS?.view,
      showInHeader: false,
    },
  ];

  const shape = {
    password: yup.string().when('password', {
      is: (val: any) => val?.length,
      then: yup.string().matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
      otherwise: yup.string().optional(),
    }),
  };

  const handlePagination = (currPage: any) => {
    if (currPage) setPage(currPage);
    else setPage(1);
    console.log('pag');
    // fetchUsers();
  };

  const actionHandler = (data: any, handlername: string) => {
    if (handlername === 'edit') {
      navigate(`preview_question/${data?.id}`, {
        state: { page, path: `/${schoolName}/assessments` },
      });
    }
  };

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
      // flag: false,
    },
  });

  const onSubmit = (values: any) => {
    // const updatedDetails = { ...values };
    // delete updatedDetails.user_name;
    // editMode
    //   ? updatedDetails.password
    //     ? updatedDetails.password
    //     : delete updatedDetails.password
    //   : null;
    // editMode ? update(updatedDetails) : mutate(values);
  };

  const { isLoading, mutate } = usePost({
    baseURL: userServicesBaseURL,
    url: 'users-service/create-sub-admin/',
    onSuccess: ({
      data: {
        response: { data },
      },
    }: any) => {
      // !buttonOpenForm ? setdialogOpen(false) : setdialogOpen(true);
      reset();
      toast('success', 'Successfully Created');
    },
    onError: ({ response }: any) => {
      toast('error', 'Error');
      // handleErrorResponse(response?.data?.errors);
    },
  });

  const handlePerPage = (e: any) => {
    setPage(1);
    setRowsPerPage(e);
    // fetchUsers();
  };

  // console.log(searchData, 'searchData');

  return (
    <div className="w-full">
      <div className="bg-white rounded-md p-4">
        <p className="font-bold">Results</p>
        <div className="flex gap-3 justify-end">
          <Dropdown
            title="Result Of Pages"
            value={rowsPerPage}
            dataArray={RESULTS_PER_PAGE}
            onChangeHandler={handlePerPage}
          />

          {/* <CustomPagination
            totalPages={noOfpages}
            paginateHandler={handlePagination}
            currentPage={page}
          /> */}
        </div>
        {LogListLoading ? (
          <Loader />
        ) : (
          // useMemo(
          //   () => (
          //     <Wrapper>
          //       <AdvanceTable
          //         tableData={searchData}
          //         headerRows={TableColumns}
          //         totalPages={noOfpages}
          //         paginateHandler={handlePagination}
          //         currentPage={page}
          //         rowsPerPage={rowsPerPage}
          //         orderBy={orderBy}
          //         setOrderBy={setOrderBy}
          //         order={order}
          //         setOrder={setOrder}
          //         actionHandler={actionHandler}
          //         // isLoading={assignmentLoading || loadSync || loadingDelete}
          //         setPage={setPage}
          //       />
          //     </Wrapper>
          //   ),
          //   [searchData]
          // )
          <Wrapper>
            <AdvanceTable
              tableData={searchData}
              headerRows={TableColumns}
              totalPages={noOfpages}
              paginateHandler={handlePagination}
              currentPage={page}
              rowsPerPage={rowsPerPage}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              order={order}
              setOrder={setOrder}
              actionHandler={actionHandler}
              // isLoading={assignmentLoading || loadSync || loadingDelete}
              setPage={setPage}
            />
          </Wrapper>
        )}
      </div>

      <CustomizedDialogs
        onclose={() => reset()}
        open={dialogOpen}
        setOpen={() => setdialogOpen(false)}
        title={editMode ? 'Edit User' : 'Reset Password'}
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
              // disabled={updateLoading}
              // loading={updateLoading}
              onClick={() => setButtonOpenForm(false)}
            >
              {editMode ? 'Update' : 'Rest'}
            </Button>
          </div>
        </form>
      </CustomizedDialogs>
    </div>
  );
}
