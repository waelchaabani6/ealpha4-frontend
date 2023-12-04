/* eslint-disable no-console */
import React from 'react';
import PageTitle from '@shared/pageTitle';
import Input from '@shared/form/Input';
import Button from '@component/button/button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { usePost } from '@shared/api/useApi';

import { AxiosError } from 'axios';
import toast from '@shared/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { userRole } from '@utility/utility';
import { useDispatch } from 'react-redux';
import { resetUser } from '@shared/store/userSlice';
import { changePasswordSchema } from '../schema';

type Inputs = {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const { schoolName } = useParams();
  const dispatch = useDispatch();
  const navigateLink = userRole().isSuperAdmin ? '/auth' : `/${schoolName}/auth`;
  const {
    handleSubmit,
    control,
    setError,
    reset
  } = useForm<Inputs>({
    mode: 'onChange',
    resolver: yupResolver(changePasswordSchema)
  });
  console.log(navigateLink);

  const { isLoading, mutate } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: 'users-service/password/changePassword/',
    onSuccess: ({ data }: any) => {
      toast('success', data?.message);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('rememberUser');
      dispatch(resetUser());
      navigate(navigateLink);
    },
    onError: (error: AxiosError) => {
      // console.log(error);
      toast('error', (error?.response?.data as any)?.message || error?.message);
      [
        {
          type: 'root.serverError',
          name: 'old_password',
          message: 'Invalid'
        },
        {
          type: 'root.serverError',
          name: 'new_password',
          message: 'Invalid'
        },
        {
          type: 'root.serverError',
          name: 'confirm_password',
          message: 'Invalid'
        }
      ].forEach(({ name, type, message }) => (
        setError(name as any, { type, message })
      )
      );
    }
  });

  const onSubmit: SubmitHandler<Inputs> = (values) => (
    mutate({ ...values, access_token: localStorage.getItem('token')?.split(' ')[1] })
  );
  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden">
      <div className="flex justify-between items-center px-5 pt-4">
        <PageTitle title="Reset Password" />
      </div>
      <form className="flex-1 p-6 overflow-auto" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 content-center gap-y-3 md:gap-x-6">
          <Input control={control} type="password" name="old_password" label="Old Password" />
          <Input control={control} type="password" name="new_password" label="New Password" />
          <Input control={control} type="password" name="confirm_password" label="Confirm Password" />
        </div>
        <br />
        <div className="div float-right space-x-5">
          <Button loading={isLoading}>Save</Button>
        </div>
      </form>
    </div>
  );
}
