import { USER_TYPE } from '@constants/constants';
import { selectUser } from '@shared/store/userSlice';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useMatches } from 'react-router-dom';

type allRoles = USER_TYPE.SUPER_ADMIN | USER_TYPE.SUB_ADMIN | USER_TYPE.TEACHER | USER_TYPE.STUDENT | USER_TYPE.PARENTS

type Props = {
  children: React.ReactNode;
  requiredRoles: allRoles[];
}

export default function AuthorizedRoute(props: Props) {
  const { role } = useSelector(selectUser);
  const isAuthorized = props.requiredRoles.includes(role.name);
  const match = useMatches();
  if (!isAuthorized && role.name === USER_TYPE.SUPER_ADMIN) {
    return <Navigate to={match[0].pathname} />;
  }
  if (isAuthorized) {
    return props.children as JSX.Element;
  }
  return (
    <div className="h-full w-full grid place-items-center">
      <p>UnAuthorize Access</p>
    </div>
  );
}
