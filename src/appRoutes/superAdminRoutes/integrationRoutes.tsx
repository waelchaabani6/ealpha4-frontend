import React from 'react';

const ManageIntegration = React.lazy(() => import('@containers/manageIntegration'));
const ManageSubscription = React.lazy(() => import('@containers/manageIntegration/manageSubscription/index'));

export default {
  path: 'integration',
  children: [
    { index: true, element: <ManageIntegration /> },
    { path: 'subscription', element: <ManageSubscription /> }
  ]
};
