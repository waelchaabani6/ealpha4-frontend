import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import toast from '@shared/toast';
import { Outlet } from 'react-router-dom';

const AssessmentDataLoad = () => {
  const { isLoading, isError, error } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/fetch-learnosity-status-for-all-users/?domain_name=${window?.location?.hostname}`,
    retry: false
  });

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

  return (<Outlet />);

  // return (
  //   isLoading || isError
  //     ? (
  //       <div className="h-full w-full grid place-items-center">
  //         {renderBeforeData}
  //       </div>
  //     )
  //     : <Outlet />
  // );
};

export default AssessmentDataLoad;
