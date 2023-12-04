import React from 'react';
import Logo from '@images/logo1.svg';
import Button from '@component/button/button';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { USER_TYPE } from '@constants/constants';

export default function StaticHeader() {
  const { role, userId, school_name: schoolName, branch_name: branchName } = useSelector(selectUser);

  return (
    <div className="h-24 px-4 flex items-center justify-between fixed z-10 top-0 left-0 w-full shadow-md bg-white">
      <Link to="/">
        <img src={Logo} alt="eAlpha" className="" />
      </Link>
      <div className="grid place-items-center">
        <Link to={userId ? role.name === USER_TYPE.SUPER_ADMIN ? '/' : `/${branchName || schoolName}` : '/auth'}>
          <Button>{userId ? 'Home' : 'Login'}</Button>
        </Link>
      </div>
    </div>
  );
}
