/* eslint-disable no-console */
import Button from '@component/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGet, usePatch, usePost } from '@shared/api/useApi';
import Input from '@shared/form/Input';
import Loader from '@shared/loader';
import toast from '@shared/toast';
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userRole } from '@utility/utility';
import { SubmitHandler, useForm } from 'react-hook-form';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector } from 'react-redux';
import { thirdPartySchemaSchool, thirdPartySchemaBranch } from './schema';
import ThirdPartyIntegration from './thirdPartyIntegration';

type Inputs = {
  number_of_users: number;
  number_of_branches: number;
  storage: number;
  branch: number;
  branchId: number;
  third_party_integrations: {
    name: string;
    classes: string;
    role: string;
    number_of_licenses: string;
    integration_id: string;
    assign_date: string;
  }[];
}

type Props = {
  context: React.Context<any>;
  isEdit?: boolean;
  isBranch?: boolean;
}

export default function Index(props: Props) {
  const { id: schoolId } = useParams();
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [selectedbranchId, setSelectedbranchId] = useState('');
  const context = useContext(props.context);
  const navigate = useNavigate();
  const methods = useForm<Inputs>({
    resolver: yupResolver(!props?.isBranch ? thirdPartySchemaSchool : thirdPartySchemaBranch),
    defaultValues: {
      third_party_integrations: []
    }
  });
  const masterServiceBaseURL = import.meta.env.VITE_APP_MASTER_SERVICE_URL;
  const schoolServiceBaseURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
  const { data: integrationData, isLoading: integrationListLoading, refetch: refetchIntegration } = useGet({
    baseURL: masterServiceBaseURL,
    url: 'master-service/integration/'
  });

  useEffect(() => {
    methods.setValue('branch', context?.contextData?.branchData?.id);
    if (integrationData) {
      methods.setValue('third_party_integrations', integrationData?.data?.response?.results?.map((ele: any) => ({
        name: ele?.name || '',
        logo: ele?.logo_url || '',
        role: [],
        number_of_licenses: '',
        integration_id: ele?.id || '',
        flag: false
      })));
    }
  }, [integrationData]);

  const formReset = () => {
    methods.reset();
  };

  // Post Add New Integrations
  const { isLoading: loadAddIntegrations, mutate: mutateAddIntegrations } = usePost({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/schools/school-integrations/`,
    onSuccess: (response: any) => {
      toast('success', 'Integration added successfully');
      formReset();
      if (userRole().isSuperAdmin) {
        navigate('/school-management/all-schools');
      } else {
        navigate(`/${schoolData?.school_name}/dashboard/${schoolId}/branches`);
      }
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  // Update Integrations
  const { isLoading: loadUpdateIntegrations, mutate: mutateUpdateIntegrations } = usePatch({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/schools/school-integrations/${branchData?.school_data?.id || schoolId}/`,
    onSuccess: (response: any) => {
      toast('success', 'Integration updated successfully');
      refetchIntegrationData();
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
    }
  });

  const onSubmit: SubmitHandler<Inputs & any> = (values) => {
    const temp = values?.third_party_integrations?.filter((ele: any) => ele?.flag);
    const data = temp?.map((ele: any) => ({
      branch_id: values?.branch,
      name: ele?.name,
      number_of_licenses: ele?.number_of_licenses,
      status: 'Active',
      integration_id: ele?.integration_id,
      assigned_roles: ele?.role || [],
      integration_classes: ele?.classesArray || []
    }));
    const schoolPayload = {
      school_id: context?.contextData?.schoolData?.id || branchData?.school_data?.id || schoolId,
      school_license: {
        number_of_users: values?.number_of_users,
        number_of_branches: values?.number_of_branches,
        storage: values?.storage
      },
      school_integration: data
    };
    const branchPayload = {
      school_id: context?.contextData?.schoolData?.id || branchData?.school_data?.id || schoolId,
      school_integration: data
    };
    if (!props?.isEdit) {
      mutateAddIntegrations(props?.isBranch ? branchPayload : schoolPayload);
    } else {
      mutateUpdateIntegrations(props?.isBranch ? branchPayload : schoolPayload);
    }
  };

  const {
    isLoading: getIntegrationDataLoading,
    isSuccess: getIntegrationDataSuccess,
    data: getIntegrationData,
    isRefetching: isRefetchingIntegrationData,
    refetch: refetchIntegrationData,
    isError: getIntegrationDataErrorHappened,
    error: getIntegrationDataError
  } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/schools/school-integrations/${(props?.isEdit && props?.isBranch) ? branchData?.school_data?.id : schoolId}/${(props?.isEdit && props?.isBranch) || selectedbranchId ? `?branch_id=${selectedbranchId || branchData?.id}` : ''}`,
    enabled: props?.isEdit || !!selectedbranchId
  });

  useEffect(() => {
    if (getIntegrationDataSuccess || isRefetchingIntegrationData) {
      const data = getIntegrationData.data.response;
      if (integrationData?.data?.response?.results?.length > 0) {
        methods.reset({
          number_of_users: data?.school_license?.number_of_users || '',
          number_of_branches: data?.school_license?.number_of_branches || '',
          storage: data?.school_license?.storage || '',
          branch: data?.school_integration[0]?.branch_id || selectedbranchId,
          third_party_integrations: integrationData?.data?.response?.results?.map((ele: any) => {
            let integrationObj = {};
            const selectedArr = data?.school_integration?.find((option: any) => option?.integration_id === ele?.id);
            if (selectedArr?.integration_id === ele?.id) {
              integrationObj = {
                flag: true,
                name: selectedArr?.name || '',
                logo: selectedArr?.logo_url || '',
                integration_id: selectedArr?.integration_id || '',
                classes: selectedArr?.integration_classes?.map((item: any) => item?.name) || [],
                role: selectedArr?.assigned_roles || [],
                number_of_licenses: selectedArr?.number_of_licenses || ''
              };
            } else {
              integrationObj = {
                name: ele?.name || '',
                logo: ele?.logo_url || '',
                classes: [],
                role: [],
                number_of_licenses: '',
                integration_id: ele?.id || '',
                flag: false
              };
            }
            return integrationObj;
          })
        });
      } else {
        refetchIntegration();
      }
    }
  }, [getIntegrationDataSuccess, isRefetchingIntegrationData, selectedbranchId]);

  if (integrationListLoading || isRefetchingIntegrationData || getIntegrationDataLoading || loadUpdateIntegrations) {
    return (
      <div className="w-full h-[200px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <form className="flex-1 p-6 space-y-7 overflow-auto" onSubmit={methods.handleSubmit(onSubmit)}>
        {
          props.isBranch
            ? (<ThirdPartyIntegration methods={methods} setSelectedbranchId={setSelectedbranchId} isEdit={props?.isEdit} />) : (
              <>
                <div
                  className="w-full h-max border border-accent
                rounded-md p-6 overflow-auto grid grid-cols-1
                lg:grid-cols-3 content-center gap-y-3 lg:gap-x-6"
                >
                  <Input
                    control={methods.control}
                    type="number"
                    name="number_of_users"
                    label="Number Of Users"
                    required={false}
                  />
                  <Input
                    control={methods.control}
                    type="number"
                    name="number_of_branches"
                    label="Number Of Branches"
                  />
                  <Input
                    control={methods.control}
                    type="number"
                    name="storage"
                    label="Storage"
                  />
                </div>
                <ThirdPartyIntegration methods={methods} setSelectedbranchId={setSelectedbranchId} isEdit={props?.isEdit} />
              </>
            )
        }
        <div className="flex items-center justify-end">
          <Button loading={loadAddIntegrations}>Save</Button>
        </div>
      </form>
    </div>
  );
}
