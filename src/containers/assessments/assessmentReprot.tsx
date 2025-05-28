import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import PrintIcon from '@mui/icons-material/Print';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import PageTitle from '@shared/pageTitle';
import useScript from '@utility/Hooks/UseScript';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { TOOLBAR_LABELS } from '../../constants/constants';
import Wrapper from '../../shared/wrapper/Wrapper';
import RouteLayout from '../layout/routeLayout';

const printButton = () => <PrintIcon />;

export default function AssessmentReprot() {
  const userData = useSelector((state: any) => state?.user);
  const { aid } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = useScript(`https://reports.learnosity.com/?v2023.1.LTS`, {
    removeOnUnmount: false,
  });
  const notCompletedStudentColumns = [
    {
      label: 'First Name',
      mapper: 'first_name',
    },
    {
      label: 'Last Name',
      mapper: 'last_name',
    },
  ];

  const [incompleteStudentArray, setincompleteStudentArray] = useState([]);
  const [error, setError] = useState('');
  const [pageData, setpageData] = useState<any>({});

  const componentRef = useRef(null);

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
    url: `assessments-service/assign-assessment-report/${aid}/?user_id=${userData?.userId}&domain_name=${window?.location?.hostname}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      setpageData(resp);
      setincompleteStudentArray(resp?.incomplete_assessment_student);
      const callbacks = {
        errorListener(e: any) {
          console.log('errorListener', e);
        },
      };
      setTimeout(() => {
        (window as any)?.LearnosityReports?.init(
          resp?.learnosity_obj,
          callbacks
        );
      }, 1000);
    },
    onError: ({ response }: any) => {
      setError(response?.data?.message || 'Technical Error');
    },
    enabled: false,
  });

  useEffect(() => {
    if (status === 'ready' && aid) {
      fetchLearnosityObj();
    }
  }, [status, aid]);

  if (LearnosityObjLoad) {
    return <Loader />;
  }

  return (
    <RouteLayout navBack={true}>
      <HeaderMenus
        title={`${pageData?.data?.[0]?.assessment_name || searchParams.get('assessment') || 'Test'}`}
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      {pageData?.learnosity_obj?.request?.reports?.length && !error ? (
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
          <div className="p-[13px]">
            <PageTitle title="Not Completed Students" />
          </div>
          <Wrapper>
            <AdvanceTable
              tableData={incompleteStudentArray || []}
              headerRows={notCompletedStudentColumns || []}
            />
          </Wrapper>
        </div>
      ) : (
        <div className="mt-5 h-max w-full rounded-md border bg-white p-4">
          {error ? <h2>{`${error}`}</h2> : 'Loading...'}
        </div>
      )}
    </RouteLayout>
  );
}
