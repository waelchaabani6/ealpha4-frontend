/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import { toast } from 'react-toastify';
import RouteLayout from '@layout/routeLayout';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import useScript from '@utility/Hooks/UseScript';
import axios from 'axios';

interface UserData {
  user_ting: string;
  role?: { name: string };
}

interface ApiResponse {
  data?: {
    assessment_ting?: string;
    response?: any;
  };
}

interface PageData {
  data?: {
    assessment_name?: string;
    assessment_items?: any[];
    [key: string]: any;
  };
}

export default function DisplayAssessmentLearnosity() {
  const location = useLocation();
  const navigate = useNavigate();
  const { obeasses_id, duration } = (location?.state || {}) as {
    obeasses_id?: string;
    duration?: string;
  };
  const userData = useSelector((state: any) => state?.user) as UserData;
  const { aid } = useParams<{ aid: string }>();
  const [apiRes, setApiRes] = useState<ApiResponse>({});
  const [pageData, setPageData] = useState<PageData>({});
  const [error, setError] = useState<string>('');
  const [count, setCount] = useState(0);
  // const [isLoading, setIsLoading] = useState(false);
  // const [iframeUrl, setIframeUrl] = useState('');

  // const user = useSelector((state: any) => state?.user);
  // const userRole = useSelector((state: any) => state?.user?.role);

  // console.log('api res =', apiRes)

  const status = useScript(`https://items.learnosity.com/?v2023.1.LTS`, {
    removeOnUnmount: false,
  });

  // console.log("window location hostname =", window.location.hostname)

  // const { isLoading: loadSync, refetch: sync } = useGet({
  //   baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
  //   url: `assessments-service/update-assessment-status/?user_ting=${userData?.user_ting}&domain_name=${window?.location?.hostname}&assessment_ting=${apiRes?.data?.assessment_ting}&assessment_id=${aid}&my_name=hello_world`,
  //   enabled: false,
  // });

  const getAssessStatus = (assessment_ting?: string) =>{
    let assessmentTing = assessment_ting ? assessment_ting : apiRes?.data?.assessment_ting;
    let url = `${import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL}assessments-service/update-assessment-status/?user_ting=${userData?.user_ting}&domain_name=${window?.location?.hostname}&assessment_ting=${assessmentTing}&assessment_id=${aid}`;
    axios.get(url).then(res => {}).catch(e => console.log('[getAssessStatus ()] e ->', e))
  }

  const schoolName = decodeURIComponent(location.pathname.split('/')[1]);
  const schoolNameInURL = `${window?.location?.origin}/${schoolName}/assessments`;

  const { isRefetching: LearnosityObjLoad, refetch: fetchLearnosityObj } =
    useGet({
      baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
      url: `assessments-service/assign_assessment/${aid}/?user_ting=${userData?.user_ting}&redirect_url=${schoolNameInURL}&domain_name=${window?.location?.hostname}`,
      onSuccess: (res: any) => {
        const resp = res?.data?.response;
        setPageData(resp);
        const callbacks = {
          errorListener(e: any) {
            setError(e.msg || '');
          },
        };
        const obj = (window as any)?.LearnosityItems?.init(
          resp?.learnosity_obj,
          callbacks
        );
        obj?.on('test:submit:success', function () {
          setApiRes(res?.data?.response);
          getAssessStatus(res?.data?.response.data?.assessment_ting);
        });
        obj?.on('test:finished:submit', () => {
          setApiRes(res?.data?.response);
        });
      },
      onError: () => {},
      enabled: false,
    });

  // useEffect(() => {
  //   if (apiRes?.data?.assessment_ting && count < 1) {
  //     // sync();
  //     getAssessStatus(apiRes?.data?.assessment_ting.toString())
  //     setCount(count + 1);
  //   }
  // }, [apiRes]);

  useEffect(() => {
    if (status === 'ready' && aid && userData?.user_ting) {
      fetchLearnosityObj();
    }
  }, [status, aid, userData]);

  if (LearnosityObjLoad) {
    return <Loader />;
  }

  // useEffect(() => {
  //   const setConfig = () => {
  //     setIsLoading(true);
  //     const config = {
  //       apiKey: `${import.meta.env.VITE_APP_SDK}`,
  //       user: `${user?.first_name} ${user?.last_name}`,
  //       user_ting: userData?.user_ting,
  //       role: user?.role?.name,
  //       duration,
  //     };
  //     fetch(`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/api/config`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(config),
  //     })
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error('Network response was not ok');
  //         }
  //         return response.json();
  //       })
  //       .then(() => {
  //         setIsLoading(false);
  //       })
  //       .catch(() => {
  //         setIsLoading(false);
  //       });
  //   };

  //   setConfig();
  // }, []);

  // useEffect(() => {
  //   const handleMessage = (event: MessageEvent) => {
  //     const { type, payload } = event.data;
  //     if (type === 'SUCCESS') {
  //       sync();
  //       toast.success(payload);
  //       navigate(`/${schoolName}/assessments/completed-assessments`);
  //       // window.location.reload();
  //     } else {
  //       toast.error(payload);
  //     }
  //   };

  //   window.addEventListener('message', handleMessage);

  //   return () => {
  //     window.removeEventListener('message', handleMessage);
  //   };
  // }, []);

  // useEffect(() => {
  //   // Function to generate a unique query parameter
  //   const generateCacheBuster = () => `?cache_buster=${new Date().getTime()}`;

  //   // URL of the iframe source
  //   let baseUrl = '';

  //   if (userRole?.name === 'Teacher')
  //     baseUrl = `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/views/${obeasses_id}`;
  //   else if (userRole?.name === 'Student')
  //     baseUrl = `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/player/${obeasses_id}`;
  //   // Set the iframe URL with the cache buster parameter
  //   setIframeUrl(baseUrl + generateCacheBuster());
  // }, [obeasses_id]);

  return (
    <RouteLayout navBack={true}>
      <div className="h-max py-4">
        <PageTitle
          title={`${pageData?.data?.assessment_name || 'Assessment'}`}
        />
      </div>
      <div className="mt-5 w-full overflow-auto rounded-md h-max border bg-white p-4">
        {pageData?.data?.assessment_items?.length ? (
          <div id="learnosity_assess" />
        ) : error ? (
          <h2>{`${error}`}</h2>
        ) : (
          'Loading...'
        )}
      </div>

      {/* <div className="mt-5 w-full overflow-auto rounded-md h-max border bg-white p-4">
        <div style={{ width: '100%', height: '100vh' }}>
          {obeasses_id && userRole?.name === 'Teacher' && (
            <iframe
              src={iframeUrl}
              title="External Content"
              width="100%"
              height="90%"
            />
          )}
          {obeasses_id && userRole?.name === 'Student' && (
            <iframe
              src={iframeUrl}
              title="External Content"
              width="100%"
              height="90%"
            />
          )}
        </div>
      </div> */}
    </RouteLayout>
  );
}
