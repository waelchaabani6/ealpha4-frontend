import React from 'react';
import { Navigate } from 'react-router-dom';

const ManageEmailPushNotification = React.lazy(() => import('@containers/manageNotification/manageEmailPushNotification'));
const CreateEmailPushNotification = React.lazy(() => import('@containers/manageNotification/manageEmailPushNotification/form'));
const ManagePushNotification = React.lazy(() => import('@containers/manageNotification/managePushNotification'));
const CreatePushNotification = React.lazy(() => import('@containers/manageNotification/managePushNotification/form'));
const ManageSMSNotification = React.lazy(() => import('@containers/manageNotification/manageSMSNotification'));
const CreateSmsNotification = React.lazy(() => import('@containers/manageNotification/manageSMSNotification/form'));
const SMTPServerList = React.lazy(() => import('@containers/manageNotification/smtpServer'));
const CreateSMTPServer = React.lazy(() => import('@containers/manageNotification/smtpServer/form'));

export default {
  path: 'notification',
  children: [
    { index: true, element: <Navigate to="smtp-server" /> },
    {
      path: 'smtp-server',
      children: [
        { index: true, element: <SMTPServerList /> },
        { path: 'create', element: <CreateSMTPServer /> }
      ]
    },
    {
      path: 'push-notification',
      children: [
        { index: true, element: <ManagePushNotification /> },
        { path: 'create', element: <CreatePushNotification /> }
      ]
    },
    {
      path: 'email-notification',
      children: [
        { index: true, element: <ManageEmailPushNotification /> },
        { path: 'create', element: <CreateEmailPushNotification /> }
      ]
    },
    {
      path: 'sms-notification',
      children: [
        { index: true, element: <ManageSMSNotification /> },
        { path: 'create', element: <CreateSmsNotification /> }
      ]
    }
  ]
};
