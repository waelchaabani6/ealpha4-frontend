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
  // const status = useScript(`https://items.learnosity.com/?v2025.1.LTS/`, {
  //   removeOnUnmount: false
  // });
  const ref = useRef<HTMLIFrameElement | null>(null);
  const userRole = useSelector((state: any) => state?.user?.role);

  useEffect(() => {
    setConfig();
  }, []);

  useEffect(() => {
    if (ref.current) {
      setConfig();
    }
  }, [iframeUrl]);
  useEffect(() => {
    // Function to generate a unique query parameter
    const generateCacheBuster = () => `?cache_buster=${new Date().getTime()}`;

    // URL of the iframe source
    let baseUrl = '';

    if (userRole?.name === 'Teacher')
      baseUrl = `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/views/${location.state?.obeasses_id}`;
    else if (userRole?.name === 'Student')
      baseUrl = `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/player/${location.state?.obeasses_id}`;
    // Set the iframe URL with the cache buster parameter
    setIframeUrl(baseUrl + generateCacheBuster());
  }, [location.state?.obeasses_id]);

  const setConfig = () => {
    const user = userData;
    const config = {
      apiKey: `${import.meta.env.VITE_APP_SDK}`,
      user: `${user?.first_name} ${user?.last_name}`,
      user_ting: userData?.user_ting,
      role: user?.role?.name,
    };

    if (ref.current && ref.current.contentWindow) {
      ref.current.contentWindow.postMessage({ type: 'setConfig', config }, '*');
    } else {
      /* empty */
    }

    fetch(`${import.meta.env.VITE_APP_IFRAME_APP_SDK}/api/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {})
      .catch((e) => {});
  };

  return (
    <RouteLayout navBack={true}>
      <div className="py-3">
        <PageTitle title={`${pageData?.data?.assessment_name || ''}`} />
      </div>
      <div className="mt-5 w-full overflow-auto rounded-md h-max border bg-white p-4">
        {/* {
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
        } */}
        <div style={{ width: '100%', height: '100vh' }}>
          {!!location.state?.obeasses_id && userRole?.name === 'Teacher' && (
            <iframe
              ref={ref}
              src={iframeUrl}
              title="External Content"
              width="100%"
              height="90%"
            />
          )}
          {!!location.state?.obeasses_id && userRole?.name === 'Student' && (
            <iframe
              ref={ref}
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
