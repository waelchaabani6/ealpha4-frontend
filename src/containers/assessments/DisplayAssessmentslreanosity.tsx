/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import { toast } from 'react-toastify';
import RouteLayout from '@layout/routeLayout';
import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import PageTitle from '@shared/pageTitle';
import useScript from '@utility/Hooks/UseScript';
import axios from 'axios';

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

export default function DisplayAssessmentLearnosity() {
  const location = useLocation();
  const navigate = useNavigate();
  const { obeasses_id, duration } = (location?.state || {}) as {
    obeasses_id?: string;
    duration?: string;
  };
  const userData = useSelector((state: any) => state?.user) as UserData;
  const { aid } = useParams<{ aid: string }>();
  const [apiRes, setApiRes] = useState<ApiResponse>({});
  const [pageData, setPageData] = useState<PageData>({});
  const [error, setError] = useState<string>('');

  const status = useScript(`https://items.learnosity.com/?v2023.1.LTS`, {
    removeOnUnmount: false,
  });

  // const { isLoading: loadSync, refetch: sync } = useGet({
  //   baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
  //   url: `assessments-service/update-assessment-status/?user_ting=${userData?.user_ting}&domain_name=${window?.location?.hostname}&assessment_ting=${apiRes?.data?.assessment_ting}&assessment_id=${aid}&my_name=hello_world`,
  //   enabled: false,
  // });

  const getAssessStatus = async () => {
    try {
      const url = `${import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL}assessments-service/update-assessment-status/?user_ting=${userData?.user_ting}&domain_name=${window?.location?.hostname}&assessment_ting=${apiRes?.data?.assessment_ting}&assessment_id=${aid}`;
      const response = await axios.get(url);
      console.log("Response data:", response.data);
      
    } catch (error) {
      console.error('[getAssessStatus()] Error ->', error);
    }
  };
  
  const schoolName = decodeURIComponent(location.pathname.split('/')[1]);
  const schoolNameInURL = `${window?.location?.origin}/${schoolName}/assessments`;

  const { isRefetching: LearnosityObjLoad, refetch: fetchLearnosityObj } =
    useGet({
      baseURL: import.meta.env.VITE_APP_ASSESSMENT_SERVICE_URL,
      url: `assessments-service/assign_assessment/${aid}/?user_ting=${userData?.user_ting}&redirect_url=${schoolNameInURL}&domain_name=${window?.location?.hostname}`,
      onSuccess: (res: any) => {
        const resp = res?.data?.response;
        setPageData(resp);
        const callbacks = {
          errorListener(e: any) {
            setError(e.msg || '');
          },
        };
        const obj = (window as any)?.LearnosityItems?.init(
          resp?.learnosity_obj,
          callbacks
        );
        obj?.on('test:finished:submit', () => {
          setApiRes(res?.data?.response);
        });
      },
      onError: () => {},
      enabled: false,
    });

  useEffect(() => {
    if (apiRes?.data?.assessment_ting) {
      getAssessStatus()
    }
  }, [apiRes]);

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
      <div className="h-max py-4">
        <PageTitle
          title={`${pageData?.data?.assessment_name || 'Assessment'}`}
        />
      </div>
      <div className="mt-5 w-full overflow-auto rounded-md h-max border bg-white p-4">
        {pageData?.data?.assessment_items?.length ? (
          <div id="learnosity_assess" />
        ) : error ? (
          <h2>{`${error}`}</h2>
        ) : (
          'Loading...'
        )}
      </div>
    </RouteLayout>
  );
}
