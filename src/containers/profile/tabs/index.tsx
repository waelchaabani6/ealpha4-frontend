import React, { useMemo } from 'react';
import Tabs from '@component/tab/Tabs';

const ProfileDetails = React.lazy(() => import('./profileDetails'));
const ChangePassword = React.lazy(() => import('./changePassword'));

export default function Index() {
  const tabList = useMemo(() => (
    [
      { title: 'Profile Details', component: <ProfileDetails /> },
      { title: 'Change Password', component: <ChangePassword /> }
    ]
  ), []);
  return (
    <Tabs tabs={tabList} transparent={!true} border={true} />
  );
}
