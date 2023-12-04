import RouteLayout from '@layout/routeLayout';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import toast from '@shared/toast';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const importedDetailCsv = () => {
  const { logId } = useParams();
  const navigate = useNavigate();
  const [logData, setLogData] = useState<any>({});

  useEffect(() => {
    if (logId) {
      fetchLogs();
    } else {
      navigate('/404');
    }
  }, [logId]);

  // -------------------API-------------------------------------------------
  //  Get Log Detail
  const { isFetching: LogDetailLoading, refetch: fetchLogs } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/import-audit/${logId}/logs-details/`,
    onSuccess: (res: any) => {
      const accData = res?.data?.response;
      setLogData(accData);
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    },
    enabled: false
  });
  // -------------------END-API-------------------------------------------------

  if (LogDetailLoading) {
    return (<Loader />);
  }

  return (
    <RouteLayout>
      <div className="my-5">
        <PageTitle title="Imported Details" />
      </div>
      <div className=" p-2 mt-6 flex flex-col border-solid border-2 rounded border-green-600 bg-white">
        <div className="width-full flex-row flex justify-between min-h-[8vh] my-8 mx-3 ">
          <div className="w-1/4 border-r-2">
            <h4 className="font-semibold">File Name</h4>
            <p className="text-sm">{logData?.file_name}</p>
          </div>
          <div className="w-1/4 border-r-2">
            <h4 className="font-semibold text-center">Uploaded By</h4>
            <p className="text-sm text-center">{logData?.created_by}</p>
          </div>
          <div className="w-1/4 border-r-2">
            <h4 className="font-semibold text-center">Created</h4>
            <p className="text-sm text-center">{moment(logData?.created_at).format('YYYY-MM-DD')}</p>
          </div>
          <div className="w-1/4">
            <h4 className="font-semibold text-center ">Status</h4>
            <p className="text-sm text-green-600 text-center">{logData?.status}</p>
          </div>
        </div>
        <div className="m-5 border-b-2" />
        <h4 className="mx-5 mt-8 font-semibold">Statistics</h4>
        <div className="flex flex-rowflex justify-between m-1">
          <div className=" w-1/2 min-h-[20vh] border border-[#3AA22B] -600m-1 rounded m-1 bg-[#F7FFF5]">
            <div className="mx-5 mt-5 font-Montserrat">
              <h4 className="font-semibold text-green-600 my-3">Success</h4>
              <p>
                Added to
                {' '}
                {logData?.import_type}
                {' '}
                :
                {' '}
                {logData?.success_count}
                {' '}
              </p>
              {/* <p>Added to Class : 1</p> */}
            </div>
          </div>
          <div className=" w-1/2 min-h-[20vh] border border-[#FF0008] -600m-1 rounded m-1 bg-rose-50">
            <div className="mx-5 mt-5 font-Montserrat">
              <h4 className="font-semibold text-red-600 my-3">Un-successful</h4>
              <p>
                Added to
                {' '}
                {logData?.import_type}
                {' '}
                :
                {' '}
                {logData?.error_count}
                {' '}
              </p>
              {/* <p>
                Added to Class :
                {' '}
                {logData?.error_count}
              </p> */}
            </div>
          </div>
        </div>
        <div className="m-5 border-b-2" />
        <h4 className="mx-5 mt-8 font-semibold">Logs</h4>
        <div className="mx-2 mb-8 min-h-[20vh] border border-[#D2D2D2] -600m-1 rounded m-1 bg-[#F7F7F7]">
          <div className="grid gap-4 grid-cols-2">
            <div className="mx-5 mt-5 font-Montserrat">
              <h4 className="font-semibold">Successful:</h4>
              {
                logData?.csv_audit?.filter((i: any) => i?.log_status !== 'Failed')?.map((i: any) => (
                  <p className="text-sm">
                    {`
                  ${i?.json_data?.first_name},${i?.json_data?.last_name},
                  ${i?.json_data?.user_name},
                  ${i?.json_data?.import_type || ''},
                  ${i?.json_data?.relationship || ''}
                  `}
                  </p>
                ))
              }
            </div>
            <div className="mx-5 mt-5 font-Montserrat">
              <h4 className="font-semibold">Unsuccessful:</h4>
              {
                logData?.csv_audit?.filter((i: any) => i?.log_status === 'Failed')?.map((i: any) => (
                  <p className="text-sm">
                    {`
                  ${i?.json_data?.first_name},
                  ${i?.json_data?.last_name},
                  ${i?.json_data?.user_name},
                  ${i?.json_data?.import_type || ''},
                  ${i?.json_data?.relationship || ''}
                  ${i?.error_data ? `${i?.error_data}` : ''}
                  `}
                  </p>
                ))
              }
            </div>
          </div>

        </div>
      </div>
    </RouteLayout>
  );
};

export default importedDetailCsv;
