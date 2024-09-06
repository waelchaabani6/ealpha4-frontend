import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import RouteLayout from '@layout/routeLayout';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import useScript from '@utility/Hooks/UseScript';

interface UserData {
  user_ting: string;
  role?: { name: string };
}

interface ApiResponse {
  data?: {
    assessment_ting?: boolean;
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

export default function OBE_DisplayAssessment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { obeasses_id, duration } = (location?.state || {}) as { obeasses_id?: string; duration?: string };
  const userData = useSelector((state: any) => state?.user) as UserData;
  const { aid } = useParams<{ aid: string }>();
  const [apiRes, setApiRes] = useState<ApiResponse>({});
  const [pageData, setPageData] = useState<PageData>({});
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');

  const user = useSelector((state: any) => state?.user);
  const userRole = useSelector((state: any) => state?.user?.role);

  // const status = useScript(`https://items.learnosity.com/?v2021.2.LTS`, {
  //   removeOnUnmount: false
  // });

  const { isLoading: loadSync, refetch: sync } = useGet({
    baseURL: import.meta.env.VITE_APP_OBE_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/update-assessment-status/?user_ting=${userData?.user_ting}&domain_name=${window?.location?.hostname}&obeasses_id=${obeasses_id}&assessment_id=${aid}`,
    enabled: false
  });

  const schoolName = decodeURIComponent(location.pathname.split('/')[1]);
  const schoolNameInURL = `${window?.location?.origin}/${schoolName}/obe-assessments`;



  useEffect(() => {
    if (apiRes?.data?.assessment_ting) {
      sync();
    }
  }, [apiRes?.data?.assessment_ting]);

  // useEffect(() => {
  //   if (status === 'ready' && aid && userData?.user_ting) {
  //     fetchLearnosityObj();
  //   }
  // }, [status, aid, userData]);

  useEffect(() => {
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
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    };

    setConfig();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'SUCCESS') {
        sync();
        toast.success(payload);
        navigate(`/${schoolName}/obe-assessments/completed-assessments`);
        // window.location.reload();
      } else {
        toast.error(payload);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    // Function to generate a unique query parameter
    const generateCacheBuster = () => `?cache_buster=${new Date().getTime()}`;

    // URL of the iframe source
    let baseUrl = '';

    if (userRole?.name === 'Teacher') baseUrl = `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/views/${obeasses_id}`;
    else if (userRole?.name === 'Student') baseUrl = `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/player/${obeasses_id}`;
    // Set the iframe URL with the cache buster parameter
    setIframeUrl(baseUrl + generateCacheBuster());
  }, [obeasses_id]);


  return (
    <RouteLayout navBack={true}>
      <div className="h-max py-4">
        <PageTitle title={`${pageData?.data?.assessment_name || 'Assessment'}`} />
      </div>
      <div className="mt-5 w-full overflow-auto rounded-md h-max border bg-white p-4">
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
      </div>
    </RouteLayout>
  );
}
