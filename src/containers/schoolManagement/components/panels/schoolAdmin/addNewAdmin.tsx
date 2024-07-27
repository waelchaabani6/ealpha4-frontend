/* eslint-disable comma-dangle */
import RadioGroup from '@shared/form/RadioGroup';
import Select from '@shared/form/Select';
import CheckBox from '@shared/form/Checkbox';
import { MaterialAutoCompleteFormControl } from '@shared/form/AutocompleteHookField';
import { SubmitHandler, useForm } from 'react-hook-form';
import Input from '@shared/form/Input';
import Button from '@component/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGet, usePatch, usePost } from '@shared/api/useApi';
import toast from '@shared/toast';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  PASSWORD_REGEX,
  PASSWORD_REGEX_MESSAGE,
  PHONE_NUMBER_REGEX,
  ROLES,
  USERNAME_REGEX,
  USERNAME_REGEX_MESSAGE,
} from '@constants/constants';
import * as yup from 'yup';

type FormInputTypes = {
  admin_type: any;
  branch_id: string;
  exisitng_user: boolean;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  phone_number: number;
  password?: any;
  teacher: any;
  setAdminData?: any;
  admin_user?: any;
};
export default function AddNewAdmin(props: any) {
  const {
    refetch,
    setAddDialog,
    adminData = {},
    branchArray,
    setAdminData,
  } = props;
  let shape = {
    admin_type: yup.string().required('Admin type is required'),
    branch_id: yup.string().when('admin_type', {
      is: '4',
      then: yup.string().required('Branch is required').nullable(),
      otherwise: yup.string().optional(),
    }),
    exisitng_user: yup.bool().oneOf([true, false]).default(false),
    first_name: yup.string().when('exisitng_user', {
      is: false,
      then: yup.string().required('First name is required'),
      otherwise: yup.string().optional(),
    }),
    last_name: yup.string().when('exisitng_user', {
      is: false,
      then: yup.string().required('Last name is required'),
      otherwise: yup.string().optional(),
    }),
    user_name: yup.string().when('exisitng_user', {
      is: false,
      then: yup
        .string()
        .required('Username is required')
        .max(100, 'Too long')
        .matches(USERNAME_REGEX, USERNAME_REGEX_MESSAGE),
      otherwise: yup.string().optional(),
    }),
    email: yup.string().when('exisitng_user', {
      is: false,
      then: yup.string().email().required('Email is required'),
      otherwise: yup.string().email().optional(),
    }),
    phone_number: yup.mixed().when('exisitng_user', {
      is: false,
      then: yup
        .string()
        .min(1, 'Phone number is required.')
        .max(12, 'Phone number cannot be more than 12 ')
        .matches(PHONE_NUMBER_REGEX, 'Invalid phone number.'),
      otherwise: yup.string().optional(),
    }),
    password: yup.string().when('exisitng_user', {
      is: false,
      then: yup.string().matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
      otherwise: yup.string().optional(),
    }),
    admin_user: yup.string().when('exisitng_user', {
      is: true,
      then: yup.string().required('User is required'),
      otherwise: yup.string().optional(),
    }),
  };
  if (adminData && Object.keys(adminData).length) {
    shape = {
      ...shape,
      password: yup.string().when('password', {
        is: (val: any) => val?.length,
        then: yup.string().matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
        otherwise: yup.string().optional(),
      }),
      user_name: yup.string().optional(),
    };
  }

  const addNewAdminSchema = yup
    .object()
    .shape(shape, [['password', 'password']]);

  const { id } = useParams();
  const [searchUser, setSearchUser] = useState('');
  const [userArray, setUserArray] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>({});
  const [playloadData, setPlayloadData] = useState<any | undefined>({});
  const [userIsDisabled, setUserIsDisabled] = useState(true);

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setError,
    setValue,
  } = useForm<FormInputTypes>({
    resolver: yupResolver(addNewAdminSchema),
  });
  const wAdminType = Number(watch('admin_type'));
  const wExisitngUser = watch('exisitng_user');
  const wBranchId = watch('branch_id');

  const onSubmit: SubmitHandler<FormInputTypes> = (values: any) => {
    let payload: any = {};
    if (adminData && Object.keys('adminData').length) {
      payload = {
        admin_type: values?.admin_type,
        branch_id: adminData?.branch_id,
        first_name: values?.first_name,
        last_name: values?.last_name,
        user_name: adminData?.user_name,
        email_id: values?.email,
        phone_number: values?.phone_number,
        school_id: id,
      };
      if (values?.password) {
        payload = {
          ...payload,
          password: values?.password,
        };
      }
      if (Number(values?.admin_type) === 3) {
        delete payload.branch_id;
      }
      setPlayloadData({
        apicall: 'updateAdmin',
        id: adminData?.user_id_id,
        payload,
      });
    } else {
      if (Number(values?.admin_type) === 3) {
        delete values.branch_id;
      }
      payload = {
        admin_type: values?.admin_type,
        exisitng_user: values?.exisitng_user,
        first_name: values?.exisitng_user
          ? selectedUser?.first_name
          : values?.first_name,
        last_name: values?.exisitng_user
          ? selectedUser?.last_name
          : values?.last_name,
        user_name: values?.exisitng_user
          ? selectedUser?.user_name
          : values?.user_name,
        email_id: values?.exisitng_user ? selectedUser?.email : values?.email,
        phone_number: values?.exisitng_user
          ? selectedUser?.phone_number || ''
          : values?.phone_number,
        user_id: values?.exisitng_user ? selectedUser?.id : '',
        existing_users_role: values?.exisitng_user ? selectedUser?.role_id : '',
        school_id: id,
      };
      if (Number(values?.admin_type) === 4) {
        payload = {
          ...payload,
          branch_id: values?.branch_id || '',
        };
      }
      if (values?.password) {
        payload = {
          ...payload,
          password: values?.password,
        };
      }
      mutatePostNewAdmin(payload);
    }
  };

  function handleSelectUser(value: any) {
    setSelectedUser(value);
  }
  const handleErrorResponse = (errorObj: any) => {
    Object.keys(errorObj).forEach((key1: any) => {
      if (key1 === 'user_id') {
        setError('admin_user', {
          type: 'manual',
          message: 'User is required.',
        });
      } else if (key1 === 'username') {
        setError('user_name', { type: 'manual', message: errorObj[key1][0] });
      } else if (key1 === 'email_id') {
        setError('email', { type: 'manual', message: errorObj[key1][0] });
      }
      setError(key1, { type: 'manual', message: errorObj[key1][0] });
    });
  };

  // --------------------------------------------------API-------
  // Post New Admin
  const { isLoading: postNewAdminLoader, mutate: mutatePostNewAdmin } = usePost(
    {
      baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
      url: `users-service/create-new-school-admin/`,
      onSuccess: (response: any) => {
        setAddDialog(false);
        setPlayloadData({});
        setAdminData('');
        toast('success', 'Admin added successfully');
        refetch();
      },
      onError: ({ response }: any) => {
        toast('error', response?.statusText || 'Error');
        handleErrorResponse(response?.data?.errors);
      },
    }
  );

  // Update Admin Panel
  const { isLoading: loadingUpdateAdmin, mutate: mutateUpdateAdmin } = usePatch(
    {
      baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
      url: `users-service/school-admin/${playloadData?.id}/edit/`,
      onSuccess: (response: any) => {
        setPlayloadData({});
        setAdminData('');
        setAddDialog(false);
        refetch();
        toast('success', 'Status Updated successfully');
      },
      onError: ({ response }: any) => {
        handleErrorResponse(response?.data?.errors);
        toast('error', response?.statusText || 'Error');
        refetch();
      },
    }
  );

  // Get User
  const bID = wAdminType === 4 ? wBranchId : '';
  const { isLoading: loadUsers, refetch: fetchUsers } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/school-branch-teachers-list/?school_id=${id || ''}&branch_id=${bID}&limit=5&search=${searchUser}&limit=50`,
    onSuccess: (resp: any) => {
      const datas = resp?.data?.results;
      setUserArray(datas);
    },
    onError: ({ resp }: any) => {},
    enabled: false,
  });
  // --------------------------------------------------END-API-------

  useEffect(() => {
    if (wAdminType && wExisitngUser) {
      fetchUsers();
    }
  }, [searchUser]);

  useEffect(() => {
    if (playloadData && Object.keys(playloadData).length) {
      mutateUpdateAdmin(playloadData?.payload);
    }
  }, [playloadData]);

  useEffect(() => {
    if (adminData && Object.keys(adminData).length) {
      setValue('admin_type', adminData?.role_id);
      setValue('user_name', adminData?.user_name);
      setValue('first_name', adminData?.first_name);
      setValue('last_name', adminData?.last_name);
      setValue('email', adminData?.email);
      setValue('phone_number', adminData?.phone_number);
      setValue('branch_id', adminData?.branch_id);
    }
  }, [adminData]);

  useEffect(() => {
    if (wExisitngUser && wBranchId && wAdminType === 4) {
      setUserIsDisabled(false);
    } else if (wExisitngUser && wAdminType === 3) {
      setUserIsDisabled(false);
    } else {
      setUserIsDisabled(true);
    }
    setSearchUser('');
    setUserArray([]);
    if (wExisitngUser && wAdminType) {
      if (wAdminType === 4 && wBranchId) {
        fetchUsers();
      }
      if (wAdminType === 3) {
        fetchUsers();
      }
    }
  }, [wAdminType, wExisitngUser, wBranchId]);

  return (
    <form className="h-full pb-6" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-xs font-light text-right relative text-red-500">
        All (*) marked fields are mandatory
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 content-center gap-y-3 md:gap-x-6">
        <RadioGroup
          required={true}
          control={control}
          name="admin_type"
          label="Select Admin"
          dataArray={ROLES}
        />
        <div />
        {Number(watch('admin_type')) !== 3 ? (
          <Select
            required={true}
            disabledAll={true}
            control={control}
            name="branch_id"
            label="Select Branch"
            dataArray={branchArray}
          />
        ) : null}
        <div className="flex -ml-2.5 lg:items-end">
          <CheckBox
            control={control}
            name="exisitng_user"
            label="Add from Existing User"
          />
        </div>
      </div>
      <br />
      <hr />
      <br />
      {!watch('exisitng_user') ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 content-center gap-y-3 md:gap-x-6">
          {/* <Input control={control} name="user_name" label="Username" required={true} disabled={!!adminData} /> */}
          <Input
            required={true}
            control={control}
            name="user_name"
            label="Username"
            disabled={!!adminData}
            sxClass={{
              'input[type="text"]': {
                textTransform: 'lowercase',
              },
            }}
            tolowercase={true}
          />

          <Input
            control={control}
            name="password"
            label="Password"
            type="password"
            required={true}
            autoComplete="new-password"
          />
          <Input
            control={control}
            name="first_name"
            label="First Name"
            required={true}
          />
          <Input
            control={control}
            name="last_name"
            label="Last Name"
            required={true}
          />
          <Input control={control} name="email" label="Email" required={true} />
          <Input
            control={control}
            name="phone_number"
            label="Phone Number"
            required={true}
          />
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 content-center gap-y-3 md:gap-x-6">
            <MaterialAutoCompleteFormControl
              disabled={userIsDisabled}
              control={control}
              label="Add Admin from Existing User"
              targetKey="user_name"
              name="admin_user"
              list={userArray}
              onSelect={(val: any) => handleSelectUser(val)}
              isLoading={loadUsers}
              setDebounceValue={setSearchUser}
            />
          </div>
          <small className="text-black-500">
            <i>
              Note : Need to select Admin type and Branch for selecting existing
              user{' '}
            </i>
          </small>
        </div>
      )}

      <div className="mt-3 text-end">
        <Button loading={postNewAdminLoader || loadingUpdateAdmin}>
          {adminData ? 'Update' : 'Add'}
        </Button>
      </div>
    </form>
  );
}
