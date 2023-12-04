import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { useParams, useSearchParams } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { useGet } from '@shared/api/useApi';
import { useEffect, useRef, useState } from 'react';
import Loader from '@shared/loader';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { useSelector } from 'react-redux';
import ReactToPrint from 'react-to-print';
import { TOOLBAR_LABELS } from '@constants/constants';
import PrintIcon from '@mui/icons-material/Print';
import Button from '@component/button/button';
import RouteLayout from '../layout/routeLayout';

export default function QuestionAnswer() {
  const iframRef = useRef(null);
  const userData = useSelector((state: any) => state?.user);
  const { aid } = useParams();
  const [searchParams] = useSearchParams();
  const [pageData, setpageData] = useState<any>({});
  const [error, setError] = useState('');
  const [iframeHeight, setiframeHeight] = useState('');
  const componentRef = useRef(null);
  const printButton = () => <PrintIcon />;
  const type = searchParams.get('type');

  const { isLoading, refetch } = useGet({
    baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
    url: `assessments-service/print-assign-assessment/${aid}/?user_id=${userData?.userId}&domain_name=${window?.location?.hostname}`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      setpageData(resp);
    },
    onError: ({ response }: any) => {
      setError(response?.data?.message);
    },
    retry: false,
    enabled: false
  });

  useEffect(() => {
    if (aid && (type === 'question' || type === 'answer')) {
      refetch();
    }
  }, [aid]);

  const ADMIN_TOOLBAR_MENU = [
    {
      title: TOOLBAR_LABELS.PRINT,
      icon: <ReactToPrint
        trigger={printButton}
        content={() => componentRef.current}
      />
    }
  ];

  const downloadPaperscorerPDF = () => {
    const link = document.createElement('a');
    link.href = pageData?.answer_sheet_pdf;
    link.setAttribute('download', 'file.pdf');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <RouteLayout>
      <HeaderMenus title="Print Question/Answer sheet" />
      <div className="wrapperBorder w-full p-4 mt-4  resize-y overflow-auto">
        {
          isLoading
            ? (<Loader />)
            : (
              <>
                {
                  Object.keys(pageData).length && !error
                    ? (
                      <>
                        {
                          type === 'question'
                            ? (
                              <div ref={componentRef} className="h-[900px]">
                                <iframe
                                  ref={iframRef}
                                  width="100%"
                                  height="100%"
                                  // scrolling="no"
                                  title="ShowQuestionAnswer"
                                  src={pageData?.question_sheet}
                                // onLoad={(e: any) => {
                                //   console.log('iframRef', iframRef, iframRef?.current.contentWindow.document.body.scrollHeight);
                                //   console.log('test', e, e?.target?.offsetHeight);
                                //   console.log('e?.target?.offsetParent?.clientHeight', e?.target?.offsetParent?.clientHeight);
                                //   setiframeHeight(e?.target?.offsetParent?.clientHeight);
                                // }}
                                />
                              </div>
                            )
                            : (
                              <Button
                                type="button"
                                onClick={downloadPaperscorerPDF}
                              >
                                Download PDF
                              </Button>
                              // <DocViewer
                              //   documents={[{
                              //     uri: pageData?.answer_sheet_pdf
                              //   }]}
                              //   pluginRenderers={DocViewerRenderers}
                              // />
                            )
                        }
                      </>
                    )
                    : error
                      ? <h2>{`${error}`}</h2>
                      : 'Loading...'
                }
              </>
            )
        }
      </div>
    </RouteLayout>
  );
}
