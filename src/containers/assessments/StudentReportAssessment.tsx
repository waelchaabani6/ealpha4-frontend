import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import useScript from '@utility/Hooks/UseScript';
import { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RouteLayout from '../layout/routeLayout';

export default function SingleReportAssessment() {
  const { aid } = useParams();
  const userRole = useSelector((state: any) => state?.user?.role);
  const location = useLocation();
  const { obeasses_id } = location.state || {};
  const [searchParams] = useSearchParams();
  const [pageData, setpageData] = useState<any>({});
  const [error, setError] = useState<any>('');
  const [iframeUrl, setIframeUrl] = useState('');

  const status = useScript(`https://reports.learnosity.com/?v2021.2.LTS`, {
    removeOnUnmount: false
  });

  const { isLoading: LearnosityObjLoad, refetch: fetchLearnosityObj } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/student-assessment-report/?assessment_id=${aid}&user_ting=${searchParams.get('user')}&domain_name=${window?.location?.hostname}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      setpageData(resp);
      if (resp?.learnosity_obj?.request?.reports?.length) {
        const callbacks = {
          errorListener(e: any) {
            setError(e.msg || '');
          }
        };
        setTimeout(() => {
          (window as any)?.LearnosityReports?.init(resp?.learnosity_obj, callbacks);
        }, 1000);
      }
    },
    onError: ({ response }: any) => {
      setError(response?.data?.message || response?.statusText || '');
    },
    enabled: false
  });

  useEffect(() => {
    if (status === 'ready' && aid && searchParams.get('user')) {
      fetchLearnosityObj();
    }
  }, [status, aid, searchParams]);

  useEffect(() => {
    const generateCacheBuster = () => `?cache_buster=${new Date().getTime()}`;
    const baseUrl = `${import.meta.env.VITE_APP_IFRAME_APP_SDK}/teacher-reports/${obeasses_id}`;
    setIframeUrl(baseUrl + generateCacheBuster());
  }, [obeasses_id]);

  const colorCode = (scoreAch: number, type: string) => {
    if (scoreAch <= 60) return { bg: '#FBD4C7', color: '#000000' }[type];
    if (scoreAch > 60 && scoreAch <= 70) return { bg: '#FFF8C1', color: '#000000' }[type];
    if (scoreAch > 70 && scoreAch <= 80) return { bg: '#BFCDFD', color: '#000000 ' }[type];
    if (scoreAch > 80) return { bg: '#E5F8E2', color: '#000000' }[type];
    return { bg: '#E5F8E2', color: '#000000' }[type];
  };

  const details = pageData?.data?.[0];

  if (LearnosityObjLoad) return <Loader />;

  return (
    <RouteLayout>
      <div className="h-max py-4">
        <PageTitle title="Assessment Details" />
      </div>
      {obeasses_id ? (
        <div style={{ width: '100%', height: '100vh' }}>
          {userRole?.name === 'Teacher' && <iframe src={iframeUrl} title="External Content" width="100%" height="90%" />}
        </div>
      ) : (
        details && Object.keys(details).length ? (
          <div className="mt-5 h-max w-full rounded-md border bg-white p-4">
            <div className="flex flex-col bg-white">
              <div className="colouredBullets">
                <ul>
                  <li style={{ color: '#FBD4C7' }}>
                    <span>Does not Meet (Score: 35%-60%)</span>
                  </li>
                  <li style={{ color: '#FFF8C1' }}>
                    <span>Approaching (Score: 60%-70%)</span>
                  </li>
                  <li style={{ color: '#BFCDFD' }}>
                    <span>Meets (Score: 70%-80%)</span>
                  </li>
                  <li style={{ color: '#DAFECA' }}>
                    <span>Exceeds (Score: 80%-100%)</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col p-4 mt-5 md:flex-row">
                <div className="flex flex-col grow md:flex-row">
                  <div className="grow flex flex-col md:border-r md:border-r-gray-300">
                    <div className="mb-5">
                      <div className="font-bold">Assessment Name</div>
                      <div>{details?.assessment_name}</div>
                    </div>
                    <div>
                      <div className="font-bold">Teacher</div>
                      <div>{details?.teacher_name || '-'}</div>
                    </div>
                  </div>
                  <div className="grow md:border-r md:border-r-gray-300 md:ml-4">
                    <div className="mb-5">
                      <div className="font-bold">Status</div>
                      <div>{details?.status || '-'}</div>
                    </div>
                    <div>
                      <div className="font-bold">Assessment Status</div>
                      <div>{details?.assessment_status || '-'}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col grow md:flex-row">
                  <div className="grow md:border-r md:border-r-gray-300 md:ml-4">
                    <div className="mb-5">
                      <div className="font-bold">Start Date</div>
                      <div>{details?.start_date}</div>
                    </div>
                    <div>
                      <div className="font-bold">End Date</div>
                      <div>{details?.submission_date}</div>
                    </div>
                  </div>
                  <div className="grow box-content flex items-center h-full justify-center">
                    <div style={{ backgroundColor: colorCode(details?.percentage, 'bg') }} className="h-3/5 w-5/6 flex items-center justify-center md:text-2xl text-sm rounded">
                      Score:
                      <span className="text-blue-100" style={{ color: colorCode(details?.percentage, 'color') }}>
                  &nbsp;
                        {`${details?.percentage || 0}% (${details?.score || 0}/${details?.max_score || 0})` || '-'}
                              &nbsp;
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <span className="learnosity-report" id="lastscore-list-item" />
            <span className="learnosity-report" id="response-analysis" />
          </div>
        ) : (
          <div className="mt-5 h-max w-full rounded-md border bg-white p-4">
            {error ? <h2>{`${error}`}</h2> : 'Loading...'}
          </div>
        )
      )}
    </RouteLayout>
  );
}
