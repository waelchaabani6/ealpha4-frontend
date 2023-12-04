/* eslint-disable no-param-reassign */
import React, { useContext, useEffect, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import Button from '@component/button/button';
import PageTitle from '@shared/pageTitle';
import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useGet, usePatch, usePost } from '@shared/api/useApi';
import toast from '@shared/toast';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '@shared/loader';
import { userRole } from '@utility/utility';
import { AxiosError } from 'axios';
import schema from './schema';
import BasicInformation from './basicInformation';
import ContactInformation from './contactInformation';
import ProfileInformation from './profileInformation';
import UploadDocuments from './uploadDocument';

type Props = {
  context: React.Context<any>;
  isEdit?: boolean;
}

export default function Index(props: Props) {
  const uid = uuidv4();
  const context = useContext(props.context);
  const { contextData, setContextData, nextTab } = useContext(props.context);
  const { id: schoolId, branchId } = useParams();
  const [isNew, setIsNew] = useState<boolean>(true);
  const [branchDocuments, setBranchDocuments] = useState<File[] | undefined>();
  const [flag, setFlag] = useState<boolean>(false);
  const navigate = useNavigate();
  const schoolServiceBaseURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
  const masterServiceBaseURL = import.meta.env.VITE_APP_MASTER_SERVICE_URL;

  const methods = useForm<any>({
    resolver: yupResolver(schema),
    mode: 'all',
    defaultValues: {
      academic_year: `${new Date(Date.now()).getFullYear()}-${new Date(Date.now()).getFullYear() + 1}`,
      academic_type_new: true,
      academic_information: [],
      contact_information: [{
        contact_name: '',
        contact_email: '',
        contact_email_alternate: '',
        contact_mobile: '',
        contact_mobile_alternate: '',
        contact_designation: '',
        contact_others: ''
      }],
      documents: []
    }
  });

  const handleErrorResponse = (errorObj: any) => {
    if (errorObj) {
      let focusKey = '';
      Object.keys(errorObj).forEach((key1: string, index1: number) => {
        if (key1 === 'contact_information') {
          Object.keys(errorObj[key1]).forEach((key2: string) => {
            Object.keys(errorObj[key1][key2]).forEach((key3: string, index: number) => {
              if (index === 0) {
                focusKey = `${key1}[${key2}].${key3}`;
              }
              methods.setError(`${key1}[${key2}].${key3}` as any, { message: errorObj[key1][key2][key3][0] });
            });
          });
        } else {
          if (index1 === 0) {
            focusKey = key1;
          }
          methods.setError(key1, { message: errorObj[key1] });
        }
      });
      methods.setFocus(focusKey);
    }
  };

  const resetForm = () => {
    methods.reset({
      name: '',
      branch_type: '',
      academic_year: '',
      activation_start_date: null,
      activation_end_date: null,
      academic_type: '',
      academic_type_new: false,
      number_of_terms: '',
      email: '',
      website: '',
      address: '',
      city: '',
      zipcode: '',
      country: '',
      phone_number: '',
      fax: '',
      academic_information: [],
      contact_information: [{
        contact_name: '',
        contact_email: '',
        contact_mobile: '',
        contact_designation: '',
        contact_others: ''
      }],
      documents: []
    } as any);
    setBranchDocuments(undefined);
    document.getElementById('app-top')?.scrollIntoView();
  };

  const {
    isLoading: getSchoolDataLoading,
    isSuccess: getSchoolDataSuccess,
    data: schoolData,
    isError: getSchoolDataErrorHappened,
    error: getSchoolDataError
  } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/schools/${schoolId}/`,
    enabled: !!schoolId && !props?.isEdit
  });

  useEffect(() => {
    if (getSchoolDataSuccess) {
      context?.setContextData({
        ...contextData,
        schoolData: schoolData?.data
      });
    }
  }, [getSchoolDataSuccess]);

  const {
    isLoading: getBranchDataLoading,
    isSuccess: getBranchDataSuccess,
    data: branchData,
    isError: getBranchDataErrorHappened,
    error: getBranchDataError
  } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/school-branches/branch/${branchId}/`,
    enabled: !!branchId
  });

  useEffect(() => {
    if (getBranchDataSuccess) {
      const { school_data: getSchoolData, ...branch } = branchData.data.response;
      setContextData({
        ...contextData,
        branchData: branch,
        schoolData: getSchoolData
      });
      let tmp = [];
      if ('school_branch_document' in branch) {
        tmp = branch.school_branch_document.map((doc: any, index: number) => ({
          sr_no: index + 1,
          document_name: doc.name,
          file: doc.document_file,
          school_document_ting: doc.school_document_ting
        }));
      }
      methods.reset({
        name: branch?.name || '',
        branch_type: branch?.branch_type || '',
        academic_year: branch?.academic_year || '',
        activation_start_date: branch?.activation_start_date,
        activation_end_date: branch?.activation_end_date,
        academic_type: branch?.academic_type,
        academic_type_new: branch?.academic_type_new,
        number_of_terms: branch?.number_of_terms,
        email: branch.email || '',
        website: branch.website_url || '',
        address: branch.address_line || '',
        city: branch.city || '',
        zipcode: branch.zip_code || '',
        country: branch.country_code || '',
        phone_number: branch.phone_number || '',
        fax: branch?.fax || '',
        contact_information: branch.contact_information?.map((ele: any) => ({
          contact_name: ele?.contact_name || '',
          contact_email: ele?.contact_email || '',
          contact_mobile: ele?.contact_mobile || '',
          contact_designation: ele?.contact_designation || '',
          contact_others: ele?.contact_others || '',
          contact_mobile_alternate: ele?.contact_mobile_alternate || '',
          contact_email_alternate: ele?.contact_email_alternate || ''
        }))
      });
      methods.setValue('documents', tmp || []);
    }
  }, [getBranchDataSuccess, branchData]);

  useEffect(() => {
    if (flag) {
      if (branchDocuments && contextData?.branchData?.id) {
        const documentFormData = new FormData();
        let count = 0;
        branchDocuments.forEach((file: File | string) => {
          if (typeof file !== 'string') {
            documentFormData.append('document_file', file);
            count += 1;
          }
        });
        if (count > 0) {
          uploadDocument(documentFormData);
        } else if (!isNew) {
          nextTab();
        } else {
          resetForm();
        }
      }
    }
  }, [flag]);
  // }, [flag, branchDocuments, contextData, isNew]);

  const {
    isLoading: createBranchLoading,
    mutate: createBranch,
    reset: resetCreateBranchRequest,
    isSuccess: createBranchSuccess,
    data: createBranchData,
    isError: createBranchErrorHappened,
    error: branchCreationError
  } = usePost({
    baseURL: schoolServiceBaseURL,
    url: 'schools-service/school-branches/'
  });

  useEffect(() => {
    if (createBranchSuccess) {
      setContextData({
        ...contextData,
        branchData: createBranchData.data.response
      });
      if (branchDocuments && branchDocuments.some((ele: File | string) => typeof ele !== 'string')) {
        setFlag(true);
      } else {
        toast('success', 'Branch Created');
        if (!isNew) {
          nextTab();
        } else {
          resetForm();
          resetCreateBranchRequest();
        }
      }
    }
  }, [createBranchSuccess]);
  // }, [createBranchSuccess, branchDocuments, isNew]);

  useEffect(() => {
    if (createBranchErrorHappened) {
      toast('error', 'Error');
      resetCreateBranchRequest();
      handleErrorResponse((branchCreationError as any)?.response?.data?.errors);
    }
  }, [createBranchErrorHappened]);

  const {
    isLoading: updateBranchLoading,
    mutate: updateBranch,
    reset: resetUpdateBranchRequest,
    isSuccess: updateBranchSuccess,
    data: updateBranchData,
    isError: updateBranchErrorHappened,
    error: branchUpdationError
  } = usePatch({
    baseURL: schoolServiceBaseURL,
    url: 'schools-service/school-branches/'
  });

  useEffect(() => {
    // if (updateBranchSuccess && getBranchDataSuccess) {
    if (updateBranchSuccess) {
      // setContextData({
      //   ...contextData,
      //   branchData: branchData.data.response
      // });
      if (branchDocuments && branchDocuments.some((ele: File | string) => typeof ele !== 'string')) {
        setFlag(true);
      } else {
        toast('success', 'Branch Updated');
        if (props.isEdit) {
          navigate(-1);
        } else if (!isNew) {
          nextTab();
        } else {
          resetForm();
          resetUpdateBranchRequest();
        }
      }
    }
  }, [updateBranchSuccess]);
  // }, [updateBranchSuccess, getBranchDataSuccess, isNew]);

  useEffect(() => {
    if (updateBranchErrorHappened) {
      resetUpdateBranchRequest();
      handleErrorResponse((branchUpdationError as any)?.response?.data?.errors);
    }
  }, [updateBranchErrorHappened]);

  const {
    isLoading: documentUploadLoading,
    mutate: uploadDocument,
    reset: resetdocumentUploadRequest,
    isSuccess: documentUploadSuccess,
    data: uploadedDocument,
    isError: documentUploadErrorHappened,
    error: documentUploadError,
    failureCount: documentUploadFailedCount
  } = usePost({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/school-branches/upload-branch-documents/${schoolId || contextData?.schoolData?.id}/${branchId || contextData?.branchData?.id}/`
  });

  useEffect(() => {
    if (documentUploadSuccess) {
      toast('success', `Branch ${props?.isEdit ? 'Updated' : 'Created'}`);
      if (!isNew) {
        nextTab();
      } else {
        setFlag(false);
        resetForm();
        resetdocumentUploadRequest();
      }
      document.getElementById('app-top')?.scrollIntoView();
    }
  }, [documentUploadSuccess]);

  useEffect(() => {
    if (documentUploadErrorHappened) {
      // resetdocumentUploadRequest();
      setFlag(false);
      if (!(documentUploadError as AxiosError)?.response) {
        toast('error', 'Document Size Too Large To Upload');
      } else {
        toast('error', (documentUploadError as AxiosError)?.response?.statusText as string);
      }
    }
  }, [documentUploadErrorHappened]);

  const onSubmit: SubmitHandler<any> = (values) => {
    values.school_id = context?.contextData?.schoolData?.id;
    if (branchId && props?.isEdit) {
      values.branch_id = branchId;
    }
    values.activation_start_date = moment(values.activation_start_date).format('YYYY-MM-DD');
    values.activation_end_date = moment(values.activation_end_date).format('YYYY-MM-DD');
    values.number_of_terms = +values.number_of_terms;
    values.academic_information = values?.academic_information?.map((ele: any) => ({
      ...ele,
      from_date: moment(ele.from_date).format('YYYY-MM-DD'),
      to_date: moment(ele.to_date).format('YYYY-MM-DD')
    }));

    if ('documents' in values) {
      const tmp = values.documents.map((ele: any) => ele.file);
      setBranchDocuments([...tmp]);
      delete values.documents;
    }

    if (props?.isEdit || documentUploadFailedCount > 0) {
      updateBranch(values);
    } else {
      createBranch(values);
    }
  };

  const { data: branchTypeList, isLoading: branchListLoading } = useGet({
    baseURL: schoolServiceBaseURL,
    url: 'schools-service/school-branches/branch-type/',
    cacheTime: 2000
  });
  const { data: countryList, isLoading: countryLoading } = useGet({
    baseURL: masterServiceBaseURL,
    url: 'master-service/country/',
    cacheTime: 2000
  });

  const apisLoading = (getSchoolDataLoading
    || countryLoading || branchListLoading
    || getBranchDataLoading || getBranchDataErrorHappened);

  if (apisLoading) {
    return (
      <div className="h-[300px] flex-1 grid place-items-center">
        {
          getBranchDataErrorHappened
            ? <p>Something Went Wrong</p>
            : <Loader />
        }
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col" id={uid}>
      <div className="flex justify-between items-center px-6 py-4">
        <PageTitle title="Branch Details" />
        <p className="text-sm text-red-500 opacity-80">All (*) marked fields are mandatory</p>
      </div>
      <hr />
      <FormProvider {...methods}>
        <form className="flex-1 p-6 space-y-7 overflow-auto" onSubmit={methods.handleSubmit(onSubmit)}>
          <BasicInformation
            context={props.context}
            isEdit={props?.isEdit}
            // academicYearList={academicYearList}
            branchTypeList={branchTypeList}
          />
          <ProfileInformation
            countryList={countryList}
          />
          <ContactInformation name="contact_information" />
          <UploadDocuments />
          <div className="float-right space-x-5">
            {
              (userRole().isSuperAdmin || userRole().isSubAdmin || userRole().isSchoolAdmin) && (
                <Button
                  disabled={(documentUploadLoading || createBranchLoading || updateBranchLoading)}
                  onClick={() => setIsNew(true)}
                  variant="outlined"
                  {...(isNew ? { loading: (documentUploadLoading || createBranchLoading || updateBranchLoading) } : null)}
                >
                  {
                    props?.isEdit ? 'Update ' : 'Create '
                  }
                  & Add New
                </Button>
              )
            }
            <Button
              disabled={(documentUploadLoading || createBranchLoading || updateBranchLoading)}
              onClick={() => setIsNew(false)}
              {...(!isNew ? { loading: (documentUploadLoading || createBranchLoading || updateBranchLoading) } : null)}
            >
              {
                props?.isEdit ? 'Update' : 'Create'
              }
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
