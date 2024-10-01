/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import {
  COMPONENTS,
  PASSWORD_REGEX,
  PASSWORD_REGEX_MESSAGE,
  RESULTS_PER_PAGE,
  TABLE_LABELS,
  USER_ROLE,
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
import { usePatch, usePost } from '@shared/api/useApi';
import CustomPagination from '@component/pagination/CustomPagination';
import Dropdown from '@component/dropdown/Dropdown';
import Loader from '@shared/loader';
import { handleUserProfile, TableColumns } from './utils';

type FormInputTypes = {
  user_name: any;
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

const userServiceBaseURL = import.meta.env.VITE_APP_USER_SERVICE_URL;

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

  const [userData, setUserData] = useState<any>({});
  const [apiValue, setApiValue] = useState<any>('');

  const noOfpages = getNoOfPages(totalDataCount, rowsPerPage);

  const navigate = useNavigate();
  const { schoolName } = useParams();

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
  };

  // const actionHandler = (data: any, handlername: string) => {
  //   if (handlername === 'edit') {
  //     navigate(`preview_question/${data?.id}`, {
  //       state: { page, path: `/${schoolName}/assessments` },
  //     });
  //   }
  // };

  const addSubAdminSchema = yup
    .object()
    .shape(shape, [['password', 'password']]);

  const { handleSubmit, control, setError, reset, clearErrors, setValue } =
    useForm<FormInputTypes>({
      resolver: yupResolver(addSubAdminSchema),
    });

  const onSubmit = (values: any) => {
    const updatedDetails: any = {};
    updatedDetails.user_name = values?.user_name;
    updatedDetails.password = values?.password;
    console.log(updatedDetails, 'updatedDetails');
    mutateUpdateUser(updatedDetails);
  };

  // const { isLoading, mutate } = usePost({
  //   baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
  //   url: 'users-service/password/changePassword/',
  //   onSuccess: ({ data }: any) => {
  //     toast('success', data?.message);
  //     // localStorage.removeItem('user');
  //     // localStorage.removeItem('token');
  //     // localStorage.removeItem('rememberUser');
  //     // dispatch(resetUser());
  //     // navigate(navigateLink);
  //   },
  //   onError: (error: AxiosError) => {
  //     console.log(error);
  //     // toast('error', (error?.response?.data as any)?.message || error?.message);
  //     // [
  //     //   {
  //     //     type: 'root.serverError',
  //     //     name: 'old_password',
  //     //     message: 'Invalid'
  //     //   },
  //     //   {
  //     //     type: 'root.serverError',
  //     //     name: 'new_password',
  //     //     message: 'Invalid'
  //     //   },
  //     //   {
  //     //     type: 'root.serverError',
  //     //     name: 'confirm_password',
  //     //     message: 'Invalid'
  //     //   }
  //     // ].forEach(({ name, type, message }) => (
  //     //   setError(name as any, { type, message })
  //     // )
  //     // );
  //   },
  // });

  const handlePerPage = (e: any) => {
    setPage(1);
    setRowsPerPage(e);
    // fetchUsers();
  };

  // console.log(searchData, 'searchData');

  const viewHandler = (data: any, handlername: string) => {
    setdialogOpen(true);
    setValue('user_name', data?.user_name);
    setUserData(data);

    const apiUrl = handleUserProfile(data?.role_id, data);
    console.log('api value', apiUrl);
    console.log('userData', data);
    setApiValue(apiUrl);
  };

  // Update Parent
  const { isLoading: loadingUpdateUser, mutate: mutateUpdateUser } = usePatch({
    baseURL: userServiceBaseURL,
    url: apiValue,
    onSuccess: (response: any) => {
      toast('success', 'User Updated successfully');
    },
    onError: ({ response }: any) => {
      toast(
        'error',
        response?.status === 400
          ? 'User already exists'
          : response?.statusText || 'Error'
      );
      //  handleErrorResponse(response?.data?.errors);
    },
  });

  // ----------------------------------------------END API---------------------------------

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
        </div>
        {LogListLoading ? (
          <Loader />
        ) : (
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
              setPage={setPage}
              viewHandler={viewHandler}
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
              disabled={true}
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
            {/* {!editMode && (
              <Button
                variant="outlined"
                disabled={isLoading}
                loading={isLoading}
                onClick={() => setButtonOpenForm(true)}
              >
                Save and Add New
              </Button>
            )} */}

            <Button
              disabled={loadingUpdateUser}
              loading={loadingUpdateUser}
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
