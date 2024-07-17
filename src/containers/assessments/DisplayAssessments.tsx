import RouteLayout from '@layout/routeLayout';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import useScript from '@utility/Hooks/UseScript';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

export default function DisplayAssessment() {
  const location = useLocation();
  const userData = useSelector((state: any) => state?.user);
  const { aid, schooName } = useParams();
  const [apiRes, setApiRes] = useState<any>({});
  const [pageData, setpageData] = useState<any>({});
  const [error, setError] = useState<any>('');

  const status = useScript(`https://items.learnosity.com/?v2021.2.LTS`, {
    removeOnUnmount: false
  });

  const { isLoading: loadSync, refetch: sync } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/update-assessment-status/?user_ting=${userData?.user_ting}&domain_name=${window?.location?.hostname}&assessment_ting=${apiRes?.data?.assessment_ting}&assessment_id=${aid}`,
    enabled: false
  });

  const schoolNameInURL = `${window?.location?.origin}/${(decodeURIComponent(location.pathname.split('/')[1]))}/assessments`;
  const { isRefetching: LearnosityObjLoad, refetch: fetchLearnosityObj } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/assign_assessment/${aid}/?user_ting=${userData?.user_ting}&redirect_url=${schoolNameInURL}&domain_name=${window?.location?.hostname}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      setpageData(resp);
      const callbacks = {
        errorListener(e: any) {
          setError(e.msg || '');
        }
      };
      const obj = (window as any)?.LearnosityItems?.init(resp?.learnosity_obj, callbacks);
      obj?.on('test:submit:success', () => {
        setApiRes(res?.data?.response);
      });
    },
    onError: () => { },
    enabled: false
  });

  useEffect(() => {
    if (apiRes?.data?.assessment_ting) {
      sync();
    }
  }, [apiRes?.data?.assessment_ting]);

  useEffect(() => {
    if (status === 'ready' && aid && userData?.user_ting) {
      fetchLearnosityObj();
    }
  }, [status, aid, userData]);

  if (LearnosityObjLoad) {
    return (<Loader />);
  }

  return (
    <RouteLayout
      navBack={true}
    >
      <div className="h-max py-4">
        <PageTitle title={`${pageData?.data?.assessment_name || 'Assessment'}`} />
      </div>
      <div className="mt-5 w-full overflow-auto rounded-md h-max border bg-white p-4">
        {

          pageData?.data?.assessment_items?.length
            ? (
              <div id="learnosity_assess" />
            ) : (
              error
                ? <h2>{`${error}`}</h2>
                : 'Loading...'
            )
        }
      </div>
    </RouteLayout>
  );
}
