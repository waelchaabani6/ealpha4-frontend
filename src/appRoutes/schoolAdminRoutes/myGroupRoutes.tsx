import React from 'react';

const MyGroupList = React.lazy(() => import('@containers/myGroup'));
const AddGroup = React.lazy(() => import('@containers/myGroup/addGroup'));
const EditGroup = React.lazy(() => import('@containers/myGroup/editGroup'));

export default {
  path: 'my-group',
  children: [
    { index: true, element: <MyGroupList /> },
    {
      path: 'add',
      element: <AddGroup />
    },
    {
      path: 'edit/:groupId',
      element: <EditGroup />
    }
  ]
};
