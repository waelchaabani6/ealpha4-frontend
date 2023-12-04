import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import PageTitle from '@shared/pageTitle';
import Button from '@component/button/button';
import { ReactComponent as PenIcon } from '@images/pen.svg';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from '@shared/toast';
import { useGet, usePut, usePost } from '@shared/api/useApi';
import IconButton from '@mui/material/IconButton';
import JoditEditor from 'jodit-react';
import * as yup from 'yup';

const JoditEditorPage = () => {
  const { id = '' } = useParams();
  const baseURL = import.meta.env.VITE_APP_CMS_SERVICE_URL;

  const shape = {
    page_name: yup.string().required('Page name is required'),
    content: yup.string().optional()
  };

  const schema = yup
    .object()
    .shape(shape);

  const { watch, setError, handleSubmit, control, register, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      page_name: '',
      content: ''
    }
  }) as any;

  const config = useMemo(
    () => ({
      language: 'en',
      height: 'calc(100vh - 300px)',
      uploader: {
        url: `${baseURL}cms-service/page-file/upload/single/`,
        insertImageAsBase64URI: false,
        imagesExtensions: ['jpg', 'png', 'jpeg', 'gif'],
        filesVariableName: (t: any) => `files[${t}]`,
        pathVariableName: 'path',
        format: 'json',
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('token') || ''
        },
        prepareData: (formdata: any) => {
          const file = formdata.getAll('files[0]')[0];
          formdata.delete('files[0]');
          formdata.append('filename', file.name);
          formdata.append('page_file', file);
          formdata.delete('path');
          formdata.delete('source');
          return formdata;
        },
        isSuccess: (e: any) => e.success,
        process: (resp: any) => ({
          files: resp.response || [],
          error: resp.message,
          msg: resp.message
        }),
        error: () => toast('error', 'Something went wrong! Please try again!!'),
        defaultHandlerSuccess (this: any, resp: any) {
          const tagName = 'img';
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const j = this;
          if (resp.files && resp.files.page_file) {
            const elm = document.createElement(tagName);
            elm.setAttribute('src', resp.files.page_file);
            j.s.insertImage(elm, null, j.o.imageDefaultWidth);
          }
        }
      },
      filebrowser: {
        view: 'tiles',
        showFoldersPanel: false,
        permissionsPresets: {
          allowFileRename: false
        },
        isSuccess (resp: any) {
          return resp.success;
        },
        prepareData: (formdata: any) => {
          const file = formdata.getAll('files[0]')[0];
          formdata.delete('files[0]');
          formdata.append('filename', file.name);
          formdata.append('page_file', file);
          formdata.delete('path');
          formdata.delete('source');
          return formdata;
        },
        getMessage (resp: any) {
          return resp.message;
        },
        ajax: {
          method: 'GET',
          url: `${baseURL}cms-service/page-file/`,
          headers: {
            Authorization: localStorage.getItem('token') || ''
          },
          processData: true,
          process: (resp: any) => ({
            success: true,
            data: {
              sources: [
                {
                  baseurl: '',
                  path: '',
                  files: resp?.response?.results?.map((i: any) => ({
                    file: i.page_file,
                    type: 'image',
                    id: i.id
                  })),
                  name: 'default'
                }
              ],
              code: 220
            }
          }),
          error: () => toast('error', 'Something went wrong! Please try again!!')
        },
        fileRemove: {
          isSuccess (resp: any) {
            return resp.success;
          },
          getMessage (resp: any) {
            return resp.message;
          },
          successStatuses: [200],
          error: () => toast('error', 'Something went wrong! Please try again!!'),
          method: 'DELETE',
          headers: {
            Authorization: localStorage.getItem('token') || ''
          },
          url: `${baseURL}cms-service/page-file/plain-text/delete/`,
          prepareData: (file: any) => ({ url: file.name })
        }
      }
    }),
    []
  );

  const { isLoading: getPageDetailsLoading, refetch: getPageDetails, isRefetching: refetchPageDetails } = useGet({
    baseURL,
    url: `cms-service/page/${id}/`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      setValue('page_name', respData.display_title);
      setValue('content', respData.content);
    },
    onError: () => { },
    enabled: false
  });

  const { isLoading: loadingPageDetails, mutate: mutatePageDetails } = usePut({
    baseURL,
    url: `cms-service/page/${id}/update/`,
    onSuccess: (response: any) => {
      getPageDetails();
      toast('success', 'Page Updated');
    },
    onError: ({ response }: any) => {
      getPageDetails();
      toast('error', response?.statusText || 'Error');
    }
  });

  useEffect(() => {
    getPageDetails();
  }, [id]);

  const onSubmit = (values: any) => {
    const obj = {
      display_title: values?.page_name,
      content: values?.content
    };
    mutatePageDetails(obj);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="h-max md:h-full flex flex-col md:overflow-hidden">
        <div className="py-4">
          <PageTitle title="Edit Page" />
        </div>
        <div className="py-4 flex items-end justify-between gap-x-4">
          <div className="flex flex-col">
            <p className="mb-3 text-sm">Page Name</p>
            <div className={`h-[36px] w-[213px] rounded-[4px] flex items-center justify-between gap-x-1 ${errors?.page_name ? 'border border-red-500' : ''}`}>
              <input type="text" {...register('page_name')} className="w-full outline-none h-[35px] rounded-[4px] pl-1" />
              {/* <PenIcon className="scale-110" /> */}
              <IconButton
                aria-label="expand row"
                size="large"
                title="Rename"
                type="submit"
                onClick={() => {}}
                className="ml-4 bg-green-400"
              >
                <PenIcon />
              </IconButton>
            </div>
            {
              errors?.page_name && (
                <span className="text-xs text-red-500">{errors?.page_name.message}</span>
              )
            }
          </div>
          <div>
            <Button>
              Save
            </Button>
          </div>
        </div>
        <JoditEditor
          value={watch('content')}
          config={config}
          onChange={(val: any) => setValue('content', val)}
        />
      </form>
    </div>
  );
};

export default JoditEditorPage;
