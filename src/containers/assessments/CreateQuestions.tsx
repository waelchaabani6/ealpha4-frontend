import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useScript from '@utility/Hooks/UseScript';
import { useGet } from '@shared/api/useApi';
import { useSelector } from 'react-redux';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import RouteLayout from '../layout/routeLayout';

export default function CreateQuestions() {
  const userData = useSelector((state: any) => state?.user);
  const { LID, schoolName } = useParams();
  const [pageData, setpageData] = useState<any>({});
  const [error, setError] = useState<any>('');

  const status = useScript(`https://authorapi.learnosity.com/?v2023.1.LTS`, {
    removeOnUnmount: false
  });

  const userRole = useSelector((state: any) => state?.user?.role);

  const { isLoading: LearnosityObjLoad, refetch: fetchLearnosityObj } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/create-question-for-assessment/${LID}/?user_ting=${userData?.user_ting}&domain_name=${window?.location?.hostname}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      setpageData(resp);
      const callbacks = {
        errorListener(e: any) {
          setError(e.msg || '');
        }
      };
      setTimeout(() => {
        const obj = (window as any)?.LearnosityAuthor?.init(resp?.learnosity_object, callbacks);
        // Old working code. Commented because it's not working anymore.
        // obj?.on('save:success', () => {
        //   console.log('save:success -->');
        //   sync();
        // });
        obj?.on('save:activity:success', () => {
          sync();
        });
      }, 1000);
    },
    onError: ({ response }: any) => {
      setError(response?.data?.message || response?.statusText || '');
    },
    enabled: false
  });

  const { isLoading: loadSync, refetch: sync } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/fetch-created-assessment-from-learnosity/?user_id=${userData?.userId}&domain_name=${window?.location?.hostname}&assessment_name=${pageData?.data?.assessment_name || ''}`,
    enabled: false
  });

  useEffect(() => {
    if (status === 'ready' && LID && userData?.user_ting) {
      fetchLearnosityObj();
    }
  }, [status, LID, userData]);

  if (LearnosityObjLoad) {
    return (<Loader />);
  }
  return (
    <RouteLayout navBack={true} path={`/${schoolName}/assessments/my-assessments`}>
      <div className="w-full overflow-auto rounded-md h-max border bg-white p-4 mt-4">
        <HeaderMenus
          title="Create Assessments"
        />
        {
          error
            ? (
              <div className="mt-5 h-max w-full rounded-md border bg-white p-4">
                <h2>{`${error}`}</h2>
              </div>
            )
            : (
              <>
                {/* <div id="learnosity-author" /> */}
                {userRole?.name === 'Teacher' && (
                <iframe
                  src={`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/create-assessments`}
                  title="External Content"
                  width="100%"
                  height="100%"
                  style={{ height: '100vh' }}
                />
                )}
              </>
            )
        }
      </div>
    </RouteLayout>
  );
}
