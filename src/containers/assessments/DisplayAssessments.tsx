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

export default function DisplayAssessment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { obeasses_id, duration } = (location?.state || {}) as { obeasses_id?: string; duration?: string };
  const userData = useSelector((state: any) => state?.user) as UserData;
  const { aid } = useParams<{ aid: string }>();
  const [apiRes, setApiRes] = useState<ApiResponse>({});
  const [pageData, setPageData] = useState<PageData>({});
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state: any) => state?.user);
  const userRole = useSelector((state: any) => state?.user?.role);

  const status = useScript(`https://items.learnosity.com/?v2021.2.LTS`, {
    removeOnUnmount: false
  });

  const { isLoading: loadSync, refetch: sync } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/update-assessment-status/?user_ting=${userData?.user_ting}&domain_name=${window?.location?.hostname}&obeasses_id=${obeasses_id}&assessment_id=${aid}`,
    enabled: false
  });

  const schoolName = decodeURIComponent(location.pathname.split('/')[1]);
  const schoolNameInURL = `${window?.location?.origin}/${schoolName}/assessments`;

  const { isRefetching: LearnosityObjLoad, refetch: fetchLearnosityObj } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/assign_assessment/${aid}/?user_ting=${userData?.user_ting}&redirect_url=${schoolNameInURL}&domain_name=${window?.location?.hostname}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      setPageData(resp);
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
    onError: () => {},
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'SUCCESS') {
        sync();
        toast.success(payload);
        navigate(`/${schoolName}/assessments`);
      } else {
        toast.error(payload);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (LearnosityObjLoad) {
    return <Loader />;
  }

  return (
    <RouteLayout navBack={true}>
      <div className="h-max py-4">
        <PageTitle title={`${pageData?.data?.assessment_name || 'Assessment'}`} />
      </div>
      <div className="mt-5 w-full overflow-auto rounded-md h-max border bg-white p-4">
        <div style={{ width: '100%', height: '100vh' }}>
          {obeasses_id && userRole?.name === 'Teacher' && (
            <iframe
              src={`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/views/${obeasses_id}`}
              title="External Content"
              width="100%"
              height="90%"
            />
          )}
          {obeasses_id && userRole?.name === 'Student' && (
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
