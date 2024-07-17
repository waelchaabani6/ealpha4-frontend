import { TOOLBAR_LABELS } from '@constants/constants';
import RouteLayout from '@layout/routeLayout';
import PrintIcon from '@mui/icons-material/Print';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import PageTitle from '@shared/pageTitle';
import Wrapper from '@shared/wrapper/Wrapper';
import useScript from '@utility/Hooks/UseScript';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import ReactToPrint from 'react-to-print';

const printButton = () => <PrintIcon />;

export default function StudentQuickReport() {
  const userData = useSelector((state: any) => state?.user);
  const { aid, schoolName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageData, setpageData] = useState<any>({});
  const [error, setError] = useState<any>('');
  const status = useScript(`https://reports.learnosity.com/?v2021.2.LTS`, {
    removeOnUnmount: false,
  });
  const componentRef = useRef(null);
  const location = useLocation();

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.PRINT,
      icon: (
        <ReactToPrint
          trigger={printButton}
          content={() => componentRef.current}
        />
      ),
    },
  ];

  const handleToolbarAction = async (title: string) => {};

  const { isLoading: LearnosityObjLoad, refetch: fetchLearnosityObj } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/student-assessment-report/?assessment_id=${aid}&user_ting=${searchParams.get('user_ting') || userData?.user_ting}&domain_name=${window?.location?.hostname}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      setpageData(resp);
      setTimeout(() => {
        const callbacks = {
          errorListener(e: any) {
            setError(e.msg || '');
          },
        };
        (window as any)?.LearnosityReports?.init(
          resp?.learnosity_obj,
          callbacks
        );
      }, 1000);
    },
    onError: (resp: any) => {
      setError(resp?.response?.data?.message || '');
    },
    enabled: false,
  });

  useEffect(() => {
    if (status === 'ready' && aid && userData?.user_ting) {
      fetchLearnosityObj();
    }
  }, [status, aid, userData]);

  if (LearnosityObjLoad) {
    return <Loader />;
  }

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus
        title={`${searchParams.get('assessment') || 'Test'}`}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      {pageData?.learnosity_obj?.request?.reports?.length && !error ? (
        <>
          <div className="wrapperBorder mt-3" ref={componentRef}>
            <div className="p-[13px]">
              <PageTitle title="Quick View Report" />
            </div>
            <Wrapper>
              <>
                <span className="learnosity-report" id="lastscore-list-item" />
                <span className="learnosity-report" id="response-analysis" />
              </>
            </Wrapper>
          </div>
        </>
      ) : (
        <div className="mt-5 h-max w-full rounded-md border bg-white p-4">
          {error ? <h2>{`${error}`}</h2> : 'Loading...'}
        </div>
      )}
    </RouteLayout>
  );
}
