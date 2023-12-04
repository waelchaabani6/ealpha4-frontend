import Button from '@component/button/button';
import PageTitle from '@shared/pageTitle';
import Input from '@shared/form/Input';
import Select from '@shared/form/Select';
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useFormContext } from 'react-hook-form';
import { useDelete, useGet, usePatch, usePost } from '@shared/api/useApi';
import Wrapper from '@shared/wrapper/Wrapper';
import AdvanceTable from '@component/AdvancedTable/AdvanceTable';
import { ReactComponent as Eye } from '@images/eye.svg';
import DeleteIcon from '@mui/icons-material/Delete';
import { COMPONENTS, TABLE_LABELS } from '@constants/constants';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUserProfile } from '@shared/store/userSlice';
import toast from '@shared/toast';
import Loader from '@shared/loader';
import { useDebounce } from 'react-use';
import FileSelect from '@component/fileUpload';
import { AxiosError } from 'axios';
import CustomizedDialogs from '@component/dialog/CustomDialog';
// eslint-disable-next-line import/no-extraneous-dependencies
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import DownloadIcon from '@mui/icons-material/Download';
import AutoCompleteInput from '@shared/form/autoCompleteInput';

export default function ProfileDetails() {
  const imageRef = useRef<any>();
  const { control, handleSubmit, setValue, watch, setError } = useFormContext();
  const { userId } = useSelector(selectUser);
  const [value, setvalue] = useState('');
  const autoCompleteRef = useRef<any>(null);
  const [debouncedValue, setDebouncedValue] = useState<any>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deleteDocId, setDeleteDocId] = useState<string | false>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<any>([{ uri: '' }]);
  const dispatch = useDispatch();

  const TableColumns = [
    {
      label: 'Sr No.',
      mapper: 'sr_no'
    },
    {
      label: 'Document Name',
      mapper: 'document_name'
    },
    {
      label: TABLE_LABELS?.ACTION,
      component: COMPONENTS?.longmenu
    }
  ];

  const moreMenuOptions = [
    {
      icon: <Eye className="scale-75" />,
      label: 'Preview',
      value: 'preview'
    },
    {
      icon: <DownloadIcon className="scale-75" />,
      label: 'Download',
      value: 'download'
    },
    {
      icon: <DeleteIcon className="scale-75" />,
      label: 'Delete',
      value: 'delete'
    }
  ];
  const { isLoading: submitLoading, mutateAsync: updateUser } = usePatch({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/admin/${userId}/`
  });
  const { refetch: refetchUser, data: userData } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/admin/${userId}/`,
    enabled: false
  });
  useEffect(() => {
    if (userData) {
      dispatch(setUserProfile({
        profile_picture: userData?.data?.response?.profile_picture,
        first_name: userData?.data?.response?.first_name,
        last_name: userData?.data?.response?.last_name
      }));
    }
  }, [userData]);
  const { mutateAsync: uploadDocuments, failureCount, error } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/upload-documents/${userId}/`
  });
  useEffect(() => {
    if (failureCount > 0) {
      if (!(error as AxiosError)?.response) {
        toast('error', 'Document Size Too Large To Upload');
      } else {
        toast('error', (error as AxiosError)?.response?.statusText as string);
      }
    }
  }, [failureCount]);
  const onSubmit: SubmitHandler<any> = (values) => {
    if ('documents' in values && (typeof values.documents === 'string' || values.documents.length === 0)) {
      delete values.documents;
    }
    if ('profile_picture' in values && (typeof values.profile_picture === 'string' || !values.profile_picture)) {
      delete values.profile_picture;
    }
    const reqArr = [];
    if ('documents' in values) {
      const documentFormData = new FormData();
      let flag = 0;
      values.documents.map((ele: any) => ele.file).forEach((file: any) => {
        if (typeof file !== 'string') {
          flag += 1;
          documentFormData.append('document_file', file);
        }
      });
      if (flag > 0) {
        reqArr.push(uploadDocuments(documentFormData));
      }
    }
    const userFd = new FormData();
    Object.keys(values).forEach((key: string) => {
      if (key !== 'documents') {
        userFd.append(key, values[key]);
      }
    });
    reqArr.push(updateUser(userFd));
    setIsLoading(true);
    if (reqArr.length > 0) {
      Promise.all(reqArr).then(([data]: any) => {
        toast('success', 'Profile Updated Successfully!');
      }).catch(({ response }: any) => {
        if (typeof response.data !== 'string') {
          Object.keys(response.data).forEach((ele: any) => (
            setError(ele as any, { message: response.data[ele] })
          ));
        }
        toast('error', `${response?.data?.detail || 'Error'}`);
      }).finally(() => {
        refetchUser();
        setIsLoading(false);
      });
    }
  };

  const onChange = (files: FileList | File[]) => {
    if (files.length > 0) {
      const fileData = Array.from(files).map((item: File, index: number) => ({
        sr_no: (watch('documents') && watch('documents').length > 0) ? watch('documents').length + (index + 1) : index + 1,
        document_name: item.name,
        file: item,
        document_ting: `${item.name}_${index}`
      }));
      setValue('documents', [...watch('documents'), ...fileData]);
    }
  };

  const { isLoading: deleteLoading, mutate: deleteFile } = useDelete({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/upload-documents/${deleteDocId}/delete/`,
    onSuccess: ({ res }: any) => {
      setValue('documents', watch('documents').filter((ele: any) => ele.document_ting !== deleteDocId));
      setDeleteDocId(false);
      toast('success', 'File Deleted');
    },
    onError: () => {
      toast('error', 'Something went wrong');
    }
  });

  useEffect(() => {
    if (deleteDocId) {
      deleteFile();
    }
  }, [deleteDocId]);

  const handleMoreOption = (id: any, rowData: any) => {
    if (id === 'delete') {
      if (typeof rowData.file === 'string') {
        setDeleteDocId(rowData.document_ting);
      } else {
        const dt = watch('documents');
        setValue('documents', dt.filter((ele: any) => ele.sr_no !== rowData.sr_no));
      }
    }
    if (id === 'preview') {
      if (typeof rowData?.file === 'string') {
        setFileUrl([{
          uri: rowData?.file
        }]);
      } else {
        setFileUrl([{
          uri: window.URL.createObjectURL(rowData?.file),
          fileName: rowData?.file.name
        }]);
      }
      setDialogOpen(true);
    }
    if (id === 'download') {
      if (typeof rowData.file === 'string') {
        window.open(rowData.file);
      } else {
        window.open(URL.createObjectURL(rowData.file));
      }
    }
  };

  const { data: countryData, isLoading: countryLoading } = useGet({
    baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
    url: 'master-service/country/'
  });

  const { data: cityData, isLoading: cityLoading } = useGet({
    baseURL: import.meta.env.VITE_APP_MASTER_SERVICE_URL,
    url: `master-service/city/?country_code=${watch('country')}${debouncedValue ? `&city_name=${debouncedValue}` : ''}`,
    enabled: !!watch('country')
  });

  useDebounce(
    () => {
      const found = cityData?.data?.results?.findIndex((item: any) => item.value === value) > -1;
      if (!found) {
        setDebouncedValue(value);
      }
    },
    500,
    [value]
  );

  useEffect(() => {
    setvalue(debouncedValue);
  }, [debouncedValue]);

  const handleDialog = () => {
    // if (isAdd) {
    //   searchParams.delete('add');
    //   setSearchParams(searchParams);
    // }
    setDialogOpen(false);
  };

  useEffect(() => {
    if (watch('city')) {
      setvalue(watch('city'));
    }
  }, [watch('city')]);

  const changehandle = (event: any) => {
    setValue('country', event.target.value);
    setValue('city', '');
    setvalue('');
    autoCompleteRef?.current?.clear();
  };

  const cityHandler = (val: any) => {
    if (watch('city')) {
      setValue('city', '');
    }
    setvalue(val);
  };

  const onSelect = (val: string | null) => {
    if (val) {
      setValue('city', val, { shouldValidate: true });
      setvalue(val);
    }
  };
  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      <div className="flex justify-between items-center px-5 pt-4">
        <PageTitle title="Basic Information" />
        <p className="text-sm text-red-500 opacity-80">All (*) marked fields are mandatory</p>
      </div>
      <form className="flex-1 p-6 space-y-7 overflow-auto" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 content-center gap-y-3 md:gap-x-6">
          <Input control={control} name="phone_number" label="Phone" required={true} />
          <Input control={control} name="alternative_phone_number" label="Alternative Phone" />
          <Input control={control} name="email" label="Email" required={true} />
          <Input control={control} name="alternate_email" label="Alternative Email" />
          <Input control={control} name="address" label="Address" />
          <Input control={control} name="street" label="Street" />
          <Input control={control} name="area" label="Area" />
          <Input control={control} name="zip_code" label="Zip Code" required={true} />
          <Select
            control={control}
            name="country"
            label="Country"
            onChange={changehandle}
            dataArray={countryData?.data.results}
            loading={countryLoading}
            required={true}
          />
          <AutoCompleteInput
            ref={autoCompleteRef}
            control={control}
            label="City"
            name="city"
            value={value}
            dataArray={cityData?.data?.results?.map((ele: any) => ({ label: ele.label, value: ele.value }))}
            isLoading={isLoading}
            onChange={cityHandler}
            onSelect={onSelect}
          />
        </div>
        <div className="min-h-[100px]">
          <h4 className="text-base font-semibold pb-6">Documents</h4>
          <FileSelect
            ref={imageRef}
            onChange={onChange}
          />
        </div>
        <div>
          <h4 className="text-base font-semibold pb-6">Uploaded Documents</h4>
          <div>
            {
              watch('documents') && watch('documents').length > 0 && !deleteLoading
                ? (
                  <Wrapper>
                    <AdvanceTable
                      moreMenuOptions={moreMenuOptions}
                      handleMoreOption={handleMoreOption}
                      headerRows={TableColumns}
                      tableData={watch('documents')}
                    />
                  </Wrapper>
                )
                : (
                  <div className="bg-sandgray h-[180px] grid place-items-center">
                    {
                      deleteLoading
                        ? <Loader />
                        : <p className="text-xl">No Data</p>
                    }
                  </div>
                )
            }
          </div>
        </div>
        <CustomizedDialogs
          maxwidth="sm"
          open={dialogOpen}
          setOpen={() => {
            handleDialog();
          }}
          title="Preview"
        >
          <div>Preview</div>
          <DocViewer documents={fileUrl} pluginRenderers={DocViewerRenderers} />
        </CustomizedDialogs>
        <div className="float-right space-x-5">
          <Button loading={isLoading || submitLoading}>Save</Button>
        </div>
      </form>
    </div>
  );
}
