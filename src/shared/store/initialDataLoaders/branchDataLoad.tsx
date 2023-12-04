import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { AxiosError } from 'axios';
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useParams } from 'react-router-dom';
import { resetStoreBranch, setStoreBranch, setStoreSchool } from '../schoolSlice';

const schoolServiceUrl = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;

export default function BranchDataLoad() {
  const { branchId } = useParams();
  const dispatch = useDispatch();
  const { data, isLoading, isSuccess, isError, error } = useGet({
    baseURL: schoolServiceUrl,
    url: `schools-service/school-branches/branch/${branchId}/`
  });

  useEffect(() => {
    if (isSuccess) {
      dispatch(setStoreBranch(data?.data?.response));
    }
  }, [isSuccess]);

  useEffect(() => () => {
    dispatch(resetStoreBranch());
  }, []);

  const renderBeforeData = useMemo(() => {
    if (isError) {
      return (
        <div>
          <p>{(error as AxiosError)?.response?.statusText}</p>
        </div>
      );
    }
    return (<Loader />);
  }, [isLoading, isError]);

  return (
    isLoading || isError
      ? (
        <div className="h-full w-full grid place-items-center">
          {renderBeforeData}
        </div>
      )
      : <Outlet />
  );
}
