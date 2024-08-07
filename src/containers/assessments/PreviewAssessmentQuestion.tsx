import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import useScript from '@utility/Hooks/UseScript';
import { useSelector } from 'react-redux';
import Loader from '@shared/loader';
import { useGet } from '@shared/api/useApi';
import PageTitle from '@shared/pageTitle';
import RouteLayout from '../layout/routeLayout';

export default function PreviewMyAssessmentQuestions() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = useSelector((state: any) => state?.user);
  const { LID, schoolName } = useParams();
  const [itemsData, setitemsData] = useState<any>([]);
  const [pageData, setPageData] = useState<any>({});
  const [error, setError] = useState<any>('');
  const [iframeUrl, setIframeUrl] = useState('');
  const status = useScript(`https://items.learnosity.com/?v2021.2.LTS/`, {
    removeOnUnmount: false
  });
  const ref = useRef<HTMLIFrameElement | null>(null);
  const userRole = useSelector((state: any) => state?.user?.role);

  const { isRefetching: LearnosityObjLoad, refetch: fetchLearnosityObj } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/get_activity_before_assign/${LID}/?user_ting=${userData?.user_ting}&domain_name=${window?.location?.hostname}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      setPageData(resp);
      const callbacks = {
        errorListener(e: any) {
          setError(e.msg || '');
        }
      };
      if (resp?.learnosity_obj?.request?.items?.length) {
        setitemsData(resp?.data?.assessment_items);
        (window as any)?.LearnosityItems?.init(resp?.learnosity_obj, callbacks);
      }
    },
    onError: ({ response }: any) => {
      setError(response?.data?.message || response?.statusText || '');
    },
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

  useEffect(() => {
    setConfig();
  }, []);

  useEffect(() => {
    if (ref.current) {
      setConfig();
    }
  }, [iframeUrl]);

  const setConfig = () => {
    const user = userData;
    const config = {
      apiKey: `${import.meta.env.VITE_APP_SDK}`,
      user: `${user?.first_name} ${user?.last_name}`,
      user_ting: userData?.user_ting,
      role: user?.role?.name
    };

    if (ref.current && ref.current.contentWindow) {
      ref.current.contentWindow.postMessage({ type: 'setConfig', config }, '*');
    } else { /* empty */ }

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
      .then((data) => {
      })
      .catch((e) => {
      });
  };

  useEffect(() => {
    // Function to generate a unique query parameter
    const generateCacheBuster = () => `?cache_buster=${new Date().getTime()}`;

    // URL of the iframe source
    let baseUrl = '';

    if (userRole?.name === 'Teacher') baseUrl = `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/views/${location.state?.obeasses_id}`;
    else if (userRole?.name === 'Student') baseUrl = `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/player/${location.state?.obeasses_id}`;
    // Set the iframe URL with the cache buster parameter
    setIframeUrl(baseUrl + generateCacheBuster());
  }, [location.state?.obeasses_id]);

  return (
    <RouteLayout
      navBack={true}
    >
      <div className="py-3">
        <PageTitle title={`vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv ${pageData?.data?.assessment_name || ''}`} />
      </div>
      <div className="mt-5 w-full overflow-auto rounded-md h-max border bg-white p-4">
        {
              (!location.state?.obeasses_id && itemsData) && itemsData?.map((item: any, index: number) => (
                <div key={index}>
                  <span className="learnosity-item" data-reference={item} />
                  <hr className="assign-heading-hr" />
                </div>
              ))
          }
        {
          !location.state?.obeasses_id && itemsData && itemsData?.length ? <div id="learnosity_inline" /> : (
            <div className="mt-5 h-max w-full rounded-md border bg-white p-4">
              {
                  error
                    ? <h2>{`${error}`}</h2>
                    : 'Loading...'
                }
            </div>
          )
        }
        <div style={{ width: '100%', height: '100vh' }}>
          {(!!location.state?.obeasses_id && userRole?.name === 'Teacher') && <iframe ref={ref} src={iframeUrl} title="External Content" width="100%" height="90%" />}
          {(!!location.state?.obeasses_id && userRole?.name === 'Student') && <iframe ref={ref} src={iframeUrl} title="External Content" width="100%" height="90%" />}
        </div>

      </div>
    </RouteLayout>
  );
}
