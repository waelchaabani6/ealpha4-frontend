import { Navigate, createBrowserRouter } from 'react-router-dom';
import AuthLayout from '@layout/authLayout';
import ForgotPassword from '@containers/auth/forgotPassword';
import Login from '@containers/auth/login';
import Register from '@containers/auth/register';
import publicRoutes from '@routes/publicRoutes';
import React from 'react';

const Home = React.lazy(() => import('@containers/staticPages/staticHome'));

export default createBrowserRouter([
  {
    path: '/',
    children: [
      ...publicRoutes,
      { index: true, element: <Home /> },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          { index: true, element: <Login /> },
          { path: 'forgot-password', element: <ForgotPassword /> },
          { path: 'register', element: <Register /> },
          { path: '*', element: <Navigate to="/auth" /> }
        ]
      },
      { path: '*', element: <Navigate to="/" /> }
    ]
  }
]);
