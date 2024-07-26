/* eslint-disable comma-dangle */
/* eslint-disable operator-linebreak */
/* eslint-disable indent */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable no-console */
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@component/button/button';
import PageTitle from '@shared/pageTitle';
import moment from 'moment';
import { useGet, usePatch, usePost, usePut } from '@shared/api/useApi';
import toast from '@shared/toast';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '@shared/loader';
import { useDispatch, useSelector } from 'react-redux';
import { selectSchoolData, setStoreSchool } from '@shared/store/schoolSlice';
import { AxiosError } from 'axios';
import { userRole } from '@utility/utility';
import { USER_TYPE } from '@constants/constants';
import BasicInformation from './basicInformation';
import ContactInformation from './contactInformation';
import ProfileInformation from './profileInformation';
import schema from './schema';
import UploadDocuments from './uploadDocument';
import UploadSchoolLogo from './uploadSchoolLogo';

type Props = {
  context: React.Context<any>;
  isEdit?: boolean;
};

export default function Index(props: Props) {
  const { id: schoolId, schoolName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isNew, setIsNew] = useState<boolean>(true);
  const context = useContext(props.context);
  const { contextData, setContextData, nextTab } = useContext(props.context);
  const [schoolLogo, setSchoolLogo] = useState<File | undefined>();
  const [schoolDocuments, setSchoolDocuments] = useState<File[] | undefined>();
  const [logoError, setlogoError] = useState('');
  const [createSchoolCount, setCreateSchoolCount] = useState<number>(0);
  const { schoolData: sd } = useSelector(selectSchoolData);
  const userData = useSelector((state: any) => state?.user);
  const methods = useForm<any>({
    resolver: yupResolver(schema),
    mode: 'all',
    defaultValues: {
      area_academic_year: `${new Date(Date.now()).getFullYear()}-${new Date(Date.now()).getFullYear() + 1}`,
      contact_information: [
        {
          contact_name: '',
          contact_email: '',
          contact_mobile: '',
          contact_designation: '',
          contact_others: '',
          contact_alternate_mobile: '',
          contact_alternate_email: '',
        },
      ],
      documents: [],
    },
  });

  const handleErrorResponse = (errorObj: any) => {
    if (errorObj) {
      let focusKey = '';
      Object.keys(errorObj).forEach((key1: string, index1: number) => {
        if (key1 === 'contact_information') {
          Object.keys(errorObj[key1]).forEach((key2: string) => {
            Object.keys(errorObj[key1][key2]).forEach(
              (key3: string, index: number) => {
                if (index === 0) {
                  focusKey = `${key1}[${key2}].${key3}`;
                }
                methods.setError(`${key1}[${key2}].${key3}` as any, {
                  message: errorObj[key1][key2][key3][0],
                });
              }
            );
          });
        } else if (key1 === 'profile_information') {
          Object.keys(errorObj[key1]).forEach((key: string, index: number) => {
            if (index === 0) {
              focusKey = `${key1}[${key}]`;
            }
            methods.setError(`${key1}[${key}]` as any, {
              message: errorObj[key1][key][0],
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
      school_name: '',
      school_url: '',
      academic_type: '',
      number_of_terms: '',
      area_academic_year: '',
      activation_start_date: null,
      activation_end_date: null,
      start_date: null,
      end_date: null,
      profile_information: {
        email: '',
        website: '',
        address: '',
        city: '',
        zipcode: '',
        country: '',
        phone_number: '',
        fax: '',
        school_type: '',
      },
      contact_information: [
        {
          contact_name: '',
          contact_email: '',
          contact_mobile: '',
          contact_designation: '',
          contact_others: '',
          contact_alternate_mobile: '',
          contact_alternate_email: '',
        },
      ],
    } as any);
    setSchoolLogo(undefined);
    setSchoolDocuments(undefined);
    document.getElementById('app-top')?.scrollIntoView();
    setCreateSchoolCount(0);
    resetLogoUploadRequest();
    resetdocumentUploadRequest();
  };

  useEffect(() => {
    const user = sd;
    if (user && props?.isEdit) {
      context?.setContextData({
        ...contextData,
        schoolData: user,
      });
      methods.reset({
        school_name: user.school_name || '',
        school_url: user.school_url || '',
        area_academic_year: user.area_academic_year || '',
        activation_start_date: user.activation_start_date || '',
        activation_end_date: user.activation_end_date || '',
        academic_type: user.academic_type || '',
        academic_information: user.academic_information,
        number_of_terms_or_semester: user.number_of_terms_or_semester || '',
        profile_information: {
          email: user.profile_information?.email || '',
          city: user.profile_information?.city || '',
          phone_number: user.profile_information?.phone_number || '',
          fax: user.profile_information?.fax || '',
          website: user.profile_information?.website || '',
          address: user.profile_information?.address || '',
          zipcode: user.profile_information?.zipcode || '',
          country: user.profile_information?.country || '',
          school_type: user.profile_information?.school_type || '',
        },
        contact_information: user.contact_information?.map((ele: any) => ({
          contact_name: ele?.contact_name || '',
          contact_email: ele?.contact_email || '',
          contact_mobile: ele?.contact_mobile || '',
          contact_designation: ele?.contact_designation || '',
          contact_others: ele?.contact_others || '',
          contact_mobile_alternate: ele?.contact_mobile_alternate || '',
          contact_email_alternate: ele?.contact_email_alternate || '',
        })),
      });
      if ('logo' in user && user.logo) {
        methods.setValue('logo', user.logo || '');
      }
      if ('school_document' in user) {
        const fileData = user.school_document.map(
          (doc: any, index: number) => ({
            sr_no: index + 1,
            document_name: doc.name,
            file: doc.document_file,
            school_document_ting: doc.school_document_ting,
          })
        );
        methods.setValue('documents', fileData);
      }

      document.getElementById('app-top')?.scrollIntoView();
    }
  }, [schoolId, sd]);

  const { refetch: refetchSchoolData } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/${schoolId}/`,
    onSuccess: (resp: any) => {
      dispatch(setStoreSchool(resp?.data));
      window.location.reload();
    },
    enabled: false,
  });

  const {
    isLoading: logoUploadLoading,
    mutateAsync: uploadLogo,
    reset: resetLogoUploadRequest,
    isSuccess: logoUploadSuccess,
    data: logoDocument,
    isError: logoUploadErrorHappened,
    error: logoUploadError,
    failureCount: logoUploadFailedCount,
  } = usePatch({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/upload-school-logo/${contextData?.schoolData?.school_id}/`,
  });

  const {
    isLoading: documentUploadLoading,
    mutateAsync: uploadDocument,
    reset: resetdocumentUploadRequest,
    isSuccess: documentUploadSuccess,
    data: uploadedDocument,
    isError: documentUploadErrorHappened,
    error: documentUploadError,
    failureCount: documentUploadFailedCount,
  } = usePost({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/upload-school-documents/${contextData?.schoolData?.id}/`,
  });

  // if (logoUploadErrorHappened) {
  //   setlogoError(logoUploadError?.response?.data?.errors?.logo?.[0]);
  // }

  useEffect(() => {
    if (documentUploadErrorHappened) {
      // toast('error', 'Document Upload Error');
    }
  }, [documentUploadErrorHappened]);

  // useEffect(() => {
  //   if (documentUploadSuccess) {
  //     // setFileUploadCount((prev: number) => prev + 1);
  //   }
  // }, [documentUploadSuccess]);

  const {
    isLoading: updateSchoolLoading,
    mutate: updateSchool,
    reset: resetupdateSchoolRequest,
    isSuccess: updateSchoolSuccess,
    data: updateSchoolData,
    isError: updateSchoolErrorHappened,
    error: schoolUpdationError,
  } = usePut({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/edit-school/${contextData?.schoolData?.school_id || schoolId}/`,
  });
  useEffect(() => {
    if (updateSchoolSuccess) {
      setCreateSchoolCount((prev: number) => prev + 1);
    }
  }, [updateSchoolSuccess]);

  const {
    isLoading: createSchoolLoading,
    mutate: createSchool,
    reset: resetCreateSchoolRequest,
    isSuccess: createSchoolSuccess,
    data: createSchoolData,
    isError: createSchoolErrorHappened,
    error: schoolCreationError,
  } = usePost({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: 'schools-service/schools/add-school/',
  });

  useEffect(() => {
    if (createSchoolSuccess) {
      setCreateSchoolCount((prev: number) => prev + 1);
      setContextData({
        ...contextData,
        schoolData: createSchoolData.data.response,
      });
    }
  }, [createSchoolSuccess]);

  useEffect(() => {
    if (createSchoolCount > 0) {
      uploadDocumentHelper();
    }
  }, [createSchoolCount]);

  const uploadDocumentHelper = () => {
    if (schoolDocuments || schoolLogo) {
      const reqArr = [];
      if (schoolLogo) {
        const logoFormData = new FormData();
        if (typeof schoolLogo !== 'string') {
          logoFormData.append('logo', schoolLogo);
          reqArr.push(uploadLogo(logoFormData));
        }
      }
      if (schoolDocuments) {
        const documentFormData = new FormData();
        let flag = 0;
        schoolDocuments.forEach((file: File) => {
          if (typeof file !== 'string') {
            documentFormData.append('document_file', file);
            flag += 1;
          }
        });
        if (flag > 0) {
          // files found
          reqArr.push(uploadDocument(documentFormData));
        }
      }
      if (reqArr.length > 0) {
        Promise.all(reqArr)
          .then((res: any) => {
            toast('success', `School ${props?.isEdit ? 'Updated' : 'Created'}`);
            if (userData.role.name === USER_TYPE.SCHOOL_ADMIN) {
              // refetchSchoolData();
              navigate(`/${schoolName}/dashboard`);
            } else if (isNew) {
              resetForm();
            } else {
              nextTab([2]);
            }
          })
          .catch((error: any) => {
            if (!(error as AxiosError)?.response) {
              toast('error', 'Document Size Too Large To Upload');
            } else {
              toast('error', error?.response?.data?.errors?.logo?.[0]);
            }
          });
      } else {
        // no files we have to upload
        toast('success', `School ${props?.isEdit ? 'Updated' : 'Created'}`);
        if (userData.role.name === USER_TYPE.SCHOOL_ADMIN) {
          // refetchSchoolData();
          navigate(`/${schoolName}/dashboard`);
        } else if (isNew) {
          resetForm();
        } else {
          nextTab([2]);
        }
      }
      // }
    } else {
      toast('success', `School ${props?.isEdit ? 'Updated' : 'Created'}`);
      if (userData.role.name === USER_TYPE.SCHOOL_ADMIN) {
        refetchSchoolData();
      } else if (isNew) {
        resetForm();
      } else {
        nextTab([2]);
      }
      // no files we have to upload
    }
  };

  useEffect(() => {
    if (createSchoolErrorHappened) {
      toast('error', 'Error');
      resetCreateSchoolRequest();
      handleErrorResponse((schoolCreationError as any)?.response?.data?.errors);
    }
  }, [createSchoolErrorHappened]);

  useEffect(() => {
    if (updateSchoolErrorHappened) {
      toast('error', 'Error');
      resetupdateSchoolRequest();
      handleErrorResponse((schoolUpdationError as any)?.response?.data?.errors);
    }
  }, [updateSchoolErrorHappened]);

  const onSubmit: SubmitHandler<any> = (values) => {
    values.activation_start_date = moment(values.activation_start_date).format(
      'YYYY-MM-DD'
    );
    values.activation_end_date = moment(values.activation_end_date).format(
      'YYYY-MM-DD'
    );
    values.academic_information = values.academic_information.map(
      (ele: any) => ({
        ...ele,
        from_date: moment(ele.from_date).format('YYYY-MM-DD'),
        to_date: moment(ele.to_date).format('YYYY-MM-DD'),
      })
    );
    // values.profile_information.city = selectedCity.name;
    values.number_of_terms_or_semester = +values.number_of_terms_or_semester;
    if ('logo' in values) {
      setSchoolLogo(values.logo);
      delete values.logo;
    }
    if ('documents' in values) {
      const tmp = values.documents.map((ele: any) => ele.file);
      setSchoolDocuments(tmp);
      delete values.documents;
    }
    if (values.documents === '') {
      delete values.documents;
    }
    if (values.school_url === '') {
      delete values.school_url;
    }

    if (
      props?.isEdit ||
      documentUploadFailedCount > 0 ||
      logoUploadFailedCount > 0
    ) {
      updateSchool(values);
    } else {
      createSchool(values);
    }
  };

  const { data: academicYearList, isLoading: academicYearLoading } = useGet({
    baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
    url: 'master-service/academic-year/',
    cacheTime: 2000,
  });

  const { data: countryList, isLoading: countryLoading } = useGet({
    baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
    url: 'master-service/country/',
    cacheTime: 2000,
  });

  const { data: schoolTypeList, isLoading: schoolTypeLoading } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: 'schools-service/schools/school-type/',
    cacheTime: 2000,
  });

  const apisLoading =
    schoolTypeLoading || countryLoading || academicYearLoading;
  if (apisLoading) {
    return (
      <div className="h-[300px] flex-1 grid place-items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center px-6 py-4">
        <PageTitle title="Enter School Details" />
        <p className="text-sm text-red-500 opacity-80">
          All (*) marked fields are mandatory
        </p>
      </div>
      <hr />
      <FormProvider {...methods}>
        <form
          className="flex-1 p-6 space-y-7 overflow-auto"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <BasicInformation
            // academicYearList={academicYearList}
            isEdit={props?.isEdit}
            context={props.context}
          />
          <ProfileInformation
            countryList={countryList}
            // cityList={cityList}
            // cityLoading={cityLoading}
            schoolTypeList={schoolTypeList}
            // setSearchCity={setSearchCity}
          />
          <ContactInformation name="contact_information" />
          <UploadSchoolLogo logoError={logoError} setlogoError={setlogoError} />
          <UploadDocuments />
          <div className="float-right space-x-5">
            {(userRole().isSuperAdmin || userRole().isSubAdmin) && (
              <Button
                disabled={
                  createSchoolLoading ||
                  updateSchoolLoading ||
                  documentUploadLoading ||
                  logoUploadLoading
                }
                onClick={() => setIsNew(true)}
                variant="outlined"
                {...(isNew
                  ? {
                      loading:
                        createSchoolLoading ||
                        updateSchoolLoading ||
                        documentUploadLoading ||
                        logoUploadLoading,
                    }
                  : null)}
              >
                {props?.isEdit ? 'Update ' : 'Create '}& Add New
              </Button>
            )}
            <Button
              disabled={
                createSchoolLoading ||
                updateSchoolLoading ||
                documentUploadLoading ||
                logoUploadLoading
              }
              onClick={() => setIsNew(false)}
              {...(!isNew
                ? {
                    loading:
                      createSchoolLoading ||
                      updateSchoolLoading ||
                      documentUploadLoading ||
                      logoUploadLoading,
                  }
                : null)}
            >
              {props?.isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
