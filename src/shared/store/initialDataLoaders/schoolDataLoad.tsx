import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { AxiosError } from 'axios';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useParams } from 'react-router-dom';
import { resetStoreSchool, setStoreSchool } from '../schoolSlice';
import { selectUser } from '../userSlice';

const schoolServiceUrl = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;

export default function SchoolDataLoad() {
  const { id } = useParams();
  const { schoolId } = useSelector(selectUser);
  const dispatch = useDispatch();

  const { data, isLoading, isSuccess, isError, error } = useGet({
    baseURL: schoolServiceUrl,
    url: `schools-service/schools/${id || schoolId}/`,
  });

  useEffect(() => {
    if (isSuccess) {
      dispatch(setStoreSchool(data?.data));
    }
  }, [isSuccess]);

  useEffect(
    () => () => {
      dispatch(resetStoreSchool());
    },
    []
  );

  const renderBeforeData = useMemo(() => {
    if (isError) {
      return (
        <div>
          <p>{(error as AxiosError)?.response?.statusText}</p>
        </div>
      );
    }
    return <Loader />;
  }, [isLoading, isError]);

  return isLoading || isError ? (
    <div className="h-full w-full grid place-items-center">
      {renderBeforeData}
    </div>
  ) : (
    <Outlet />
  );
}
