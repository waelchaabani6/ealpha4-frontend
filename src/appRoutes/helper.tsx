/* eslint-disable no-console */
import { USER_TYPE } from '@constants/constants';
import { selectUser } from '@shared/store/userSlice';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';

export function PathHandler() {
  const { school_name: schoolName, role } = useSelector(selectUser);

  const navigationPath =
    role.name !== USER_TYPE.SUPER_ADMIN
      ? `/${schoolName}/dashboard`
      : '/dashboard';
  return <Navigate to={navigationPath} replace={true} />;
}

const AuthPathHandler = {
  path: 'auth',
  children: [
    { index: true, element: <PathHandler /> },
    { path: '*', element: <PathHandler /> },
  ],
};

export default AuthPathHandler;
