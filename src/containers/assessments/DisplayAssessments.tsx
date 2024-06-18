import RouteLayout from '@layout/routeLayout';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import useScript from '@utility/Hooks/UseScript';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function DisplayAssessment() {
  const location = useLocation();
  const { obeasses_id } = location?.state || {};
  const userData = useSelector((state: any) => state?.user);
  const { aid, duration, schooName } = useParams();
  const [apiRes, setApiRes] = useState<any>({});
  const [pageData, setpageData] = useState<any>({});
  const [error, setError] = useState<any>('');
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state: any) => state?.user);
  const userRole = useSelector((state: any) => state?.user?.role);

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
      obj?.on('test:finished:submit', () => {
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

  useEffect(() => {
    setConfig();
  }, []);

  const setConfig = () => {
    setIsLoading(true);
    const config = {
      apiKey: `${import.meta.env.VITE_APP_SDK}`,
      user: `${user?.first_name} ${user?.last_name}`,
      user_ting: userData?.user_ting,
      role: user?.role?.name,
      duration
    };
    fetch(`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/api/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
      // mode: 'no-cors' // Add this line
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setIsLoading(false);
      })
      .catch((e) => {
        setIsLoading(false); // Ensure to handle loading state correctly in case of an error
      });
  };

  useEffect(() => {
    const handleMessage = (event: { data: { type: any; payload: any } }) => {
      const { type, payload } = event.data;
      if (type === 'SUCCESS') {
        sync();
        toast.success(payload);
      } else {
        toast.error(payload);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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
          !obeasses_id ? (
            pageData?.data?.assessment_items?.length ? (
              <div id="learnosity_assess" />
            ) : (
              error ? <h2>{error}</h2> : 'Loading...'
            )
          ) : null
        }
        <div style={{ width: '100%', height: '100vh' }}>
          {(obeasses_id && userRole?.name === 'Teacher') && (
          <iframe
            src={`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/views/${obeasses_id}`}
            title="External Content"
            width="100%"
            height="90%"
          />
          )}
          {(obeasses_id && userRole?.name === 'Student') && (
          <iframe
            src={`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/player/${obeasses_id}`}
            title="External Content"
            width="100%"
            height="90%"
          />
          )}
        </div>
      </div>
    </RouteLayout>
  );
}
