/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable radix */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable no-restricted-globals */
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import useScript from '@utility/Hooks/UseScript';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import RouteLayout from '../layout/routeLayout';

const ReportURL = import.meta.env.VITE_APP_REPORTS_SERVICE_URL;

export default function SingleReportAssessment() {
  const { aid } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageData, setpageData] = useState<any>({});
  const [error, setError] = useState<any>('');
  const [teacher, setTeacher] = useState('');
  const [val, setValue] = useState({
    Nmeet1: '',
    Nmeet2: '',
    exceed1: '',
    exceed2: '',
    meet1: '',
    meet2: '',
    approching1: '',
    approching2: '',
  });

  const status = useScript(`https://reports.learnosity.com/?v2021.2.LTS`, {
    removeOnUnmount: false,
  });

  // eslint-disable-next-line consistent-return
  function colorCode(score: any, type: string) {
    if (score !== null && !isNaN(score)) {
      if (score >= val.exceed1 && score <= val.exceed2) {
        // Exceeds
        return { bg: '#d9ffc8', color: '#6CA463' }[type]; // blue
      }
      if (score >= val.meet1 && score <= val.meet2) {
        /// Meets
        return { bg: '#BECCFF', color: '#132E90 ' }[type]; // green
      }
      if (score >= val.approching1 && score <= val.approching2) {
        // Approaching
        return { bg: '#FFF9BE', color: '#C7B551' }[type];
      }
      if (score >= val.Nmeet1 && score <= val.Nmeet2) {
        // Does not Meet
        return { bg: '#FCD4C6', color: '#E36B6B' }[type];
      }
    } else {
      return { bg: '#FCD4C6', color: '#E36B6B' }[type];
    }
  }

  const { isLoading: performance, refetch: GetPerformance } = useGet({
    baseURL: ReportURL,
    url: `reports-service/performance_expectation/?user_id=${teacher}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      const body: any = [];
      const fetchedRecords = resp?.slice(0, 4);
      const meetObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Meets'
      );
      const AppObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Approaching'
      );
      const DMeetObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Does Not Meet'
      );
      const ExceedsObj = fetchedRecords?.find(
        (obj: any) => obj.status === 'Exceeds'
      );
      setValue((prevState: any) => ({
        ...prevState,
        meet1: meetObj?.from_value,
        meet2: meetObj?.to_value,
        exceed1: ExceedsObj?.from_value,
        exceed2: ExceedsObj?.to_value,
        approching1: AppObj?.from_value,
        approching2: AppObj?.to_value,
        Nmeet1: DMeetObj?.from_value,
        Nmeet2: DMeetObj?.to_value,
      }));
    },
    enabled: false,
    retry: false,
  });

  const { isLoading: LearnosityObjLoad, refetch: fetchLearnosityObj } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/student-assessment-report/?assessment_id=${aid}&user_ting=${searchParams.get('user')}&domain_name=${window?.location?.hostname}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      setpageData(resp);
      setTeacher(resp?.teacher);
      if (resp?.learnosity_obj?.request?.reports?.length) {
        const callbacks = {
          errorListener(e: any) {
            setError(e.msg || '');
          },
        };
        setTimeout(() => {
          (window as any)?.LearnosityReports?.init(
            resp?.learnosity_obj,
            callbacks
          );
        }, 1000);
      }
    },
    onError: ({ response }: any) => {
      setError(response?.data?.message || response?.statusText || '');
    },
    enabled: false,
  });

  useEffect(() => {
    if (status === 'ready' && aid && searchParams.get('user')) {
      fetchLearnosityObj();
    }
  }, [status, aid, searchParams.get('user')]);

  const details = pageData?.data?.[0];

  function getPerformanceText(score: any) {
    if (score >= val.exceed1 && score <= val.exceed2) {
      return 'Exceeds';
    }

    if (score >= val.meet1 && score <= val.meet2) {
      return 'Meets';
    }

    if (score >= val.approching1 && score <= val.approching2) {
      return 'Approaching';
    }

    if (
      (score >= val.Nmeet1 && score <= val.Nmeet2) ||
      score == null ||
      isNaN(score)
    ) {
      return 'Does not Meet';
    }
    return '';
  }

  useEffect(() => {
    if (teacher) {
      GetPerformance();
    }
  }, [teacher]);

  if (LearnosityObjLoad) {
    return <Loader />;
  }
  return (
    <RouteLayout>
      <div className="h-max py-4">
        <PageTitle title="Assessment Details" />
      </div>
      {details && Object.keys(details).length ? (
        <div className="mt-5 h-max w-full rounded-md border bg-white p-4">
          <div className="flex flex-col bg-white">
            <div className="colouredBullets">
              <ul>
                <li style={{ color: '#FCD4C6' }}>
                  <span>Does not Meet (Score: 35%-60%)</span>
                </li>
                <li style={{ color: '#FFF9BE' }}>
                  <span>Approaching(Score: 60%-70%)</span>
                </li>
                <li style={{ color: '#d9ffc8' }}>
                  <span>Meets(Score: 70%-80%)</span>
                </li>
                <li style={{ color: '#BECCFF' }}>
                  <span>Exceeds (Score: 80%-100%)</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col p-4 mt-5 md:flex-row">
              <div className="flex flex-col grow md:flex-row ">
                <div className="grow flex flex-col md:border-r md:border-r-gray-300">
                  <div className="mb-5">
                    <div className="font-bold"> Assessment Name </div>
                    <div>{details?.assessment_name}</div>
                  </div>

                  <div>
                    <div className="font-bold"> Teacher </div>
                    <div> {details?.teacher_name || '-'} </div>
                  </div>
                </div>
                <div className="grow md:border-r md:border-r-gray-300 md:ml-4">
                  <div className="mb-5">
                    <div className="font-bold"> Status </div>
                    <div> {details?.status || '-'} </div>
                  </div>

                  <div>
                    <div className="font-bold"> Assessment Status</div>
                    <div> {details?.assessment_status || '-'} </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col grow md:flex-row">
                <div className="grow md:border-r md:border-r-gray-300 md:ml-4">
                  <div className="mb-5">
                    <div className="font-bold"> Start Date </div>
                    <div>{details?.start_date}</div>
                  </div>

                  <div>
                    <div className="font-bold"> End Date </div>
                    <div>{details?.submission_date}</div>
                  </div>
                </div>

                <div className="grow box-content flex items-center h-full justify-center">
                  <div
                    style={{
                      backgroundColor: colorCode(details?.percentage, 'bg'),
                    }}
                    className="h-3/5 w-5/6 flex items-center justify-center md:text-2xl text-sm rounded"
                  >
                    Score :
                    {/* <span
                      className="text-blue-100"
                      style={{ color: colorCode(details?.percentage, 'color') }}
                    >
                      &nbsp;
                      {`${details?.percentage || 0}% (${details?.score || 0}/${details?.max_score || 0})` ||
                        '-'}
                      &nbsp;
                    </span> */}
                    <span
                      className="text-blue-100"
                      style={{
                        color: colorCode(parseInt(details?.score, 10), 'color'),
                      }}
                    >
                      &nbsp;
                      {details?.score == null || isNaN(details?.score)
                        ? '0'
                        : `${details?.score}`}
                      % (
                      {details?.score == null || isNaN(details?.score)
                        ? '0'
                        : `${details?.score}`}
                      /100) &nbsp;
                    </span>
                    - {getPerformanceText(parseInt(details?.score, 10))}
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
      )}
    </RouteLayout>
  );
}
