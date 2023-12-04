/* eslint-disable camelcase  */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Select from '@shared/form/Select';
import Button from '@component/button/button';
import { useGet, usePost, api } from '@shared/api/useApi';
import Loader from '@shared/loader';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '@shared/form/Input';
import toast from '@shared/toast';

type DropDownType = {
  name: string;
  dataArray: { label: string; value: number | string | boolean }[];
}

export default function CourseUploadForm() {
  const [load, setLoad] = useState<boolean>(true);
  const [toggleFlag, setToggleFlag] = useState<boolean>(true);
  const [dropdownName, setDropdownName] = useState('');
  const [error, setError] = useState<string>('');
  const [dynamicDropdown, setDynamicDropdown] = useState<DropDownType[]>();
  const { isLoading, data, isSuccess } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: 'course-code-service/courses/selection/'
  });
  const { isLoading: addCourseLoading, mutate: addCourse } = usePost({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: 'course-code-service/courses/',
    onSuccess: (res: any) => {
      toast('success', res?.data?.message);
    },
    onError: (err: any) => {
      const tgArr = err?.response?.data?.errors?.non_field_errors;
      if (tgArr) {
        setFormError('access_link', { message: tgArr[0] });
      }
      toast('error', err?.response?.data?.message);
    }
  });
  const getDatas = (dataArr: any) => {
    const apis = dataArr?.map((item: any) => api(import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL
    ).get(`course-code-service/courses/content/?limit=1000&ordering=content&offset=${0}&selection=${item.name}`));
    Promise.allSettled(apis).then((res: any) => {
      const tmp = res.map((element: any) => {
        const url = new URL(`${import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL}/${element.value.config.url}`);
        const searchParams = new URLSearchParams(url.search);
        return ({
          name: searchParams.get('selection'),
          dataArray: element.value.data.response.results.map((i: any) => ({ label: i.content, value: i.id }))
        });
      });
      setDynamicDropdown(tmp);
    }).catch((err: any) => {
      setError('Someting Went Wrong');
    }).finally(() => setLoad(false));
  };

  const schema = useMemo(() => yup.lazy(() => {
    const objectSchema = {
      course_contents: yup.object().shape({
        isbn_number: yup.string().length(10, 'Must be exactly 10 digits').matches(/[\d]/, 'Invalid'),
        uploaded_from: yup.string().required(`Please select`)
      }),
      access_link: yup.string().when('course_contents.uploaded_from', {
        is: (exists: string) => exists === 'Eauthor',
        then: yup.string().url('Invalid Url').required('Please enter access link'),
        otherwise: yup.string().url('Invalid Url').optional()
      }),
      static_access_link: yup.string().when('course_contents.uploaded_from', {
        is: (exists: string) => exists === 'Static-page',
        then: yup.string().url('Invalid Url').required('Please enter access link'),
        otherwise: yup.string().url('Invalid Url').optional()
      })
    } as any;
    dynamicDropdown?.forEach((ele: DropDownType) => {
      objectSchema[ele.name] = yup.string().required(`Please select ${ele.name}`);
    });
    return yup.object().shape(objectSchema, ['access_link', 'access_link'] as any);
  }), [dynamicDropdown]);

  const { control, handleSubmit, setError: setFormError, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  useEffect(() => {
    if (isSuccess) {
      getDatas(data?.data?.response?.results);
    }
  }, [isSuccess]);

  const handleDropdownChange = (name: any) => {
    const len = dynamicDropdown?.findIndex((obj) => obj?.name === name);
    dynamicDropdown?.forEach((ele, i) => {
      if (len !== undefined && i > len) {
        setValue(dynamicDropdown[i].name, '');
      }
    });
  };

  const dropdowns = useMemo(() => {
    if (dynamicDropdown) {
      return dynamicDropdown?.map((val: DropDownType, i: any) => (
        <Select
          key={val.name}
          control={control}
          name={val.name}
          label={val.name}
          dataArray={val.dataArray}
          onChange={(e: any) => { setValue(val.name, e.target.value); setToggleFlag(!toggleFlag); handleDropdownChange(val.name); }}
          disabled={!watch(dynamicDropdown[i - 1]?.name)}
          required={true}
        />
      ));
    }
    return [];
  }, [dynamicDropdown, errors, toggleFlag]);

  const getSelectionId = useCallback((selection: string) => {
    const currentSelection = data?.data?.response?.results?.find((item: any) => item.name === selection);
    return currentSelection.id;
  }, [data]);

  const onSubmit = (values: any) => {
    const { course_contents, access_link, static_access_link, ...rest } = values;
    const tmp = Object.keys(rest).map((key: string) => ({
      selection_id: getSelectionId(key),
      content_id: +values[key]
    }));
    let pyld;
    if (watch('course_contents.uploaded_from') === 'Eauthor') {
      pyld = {
        content_details: tmp,
        course_contents,
        access_link
      };
    } else if (watch('course_contents.uploaded_from') === 'Static-page') {
      pyld = {
        content_details: tmp,
        course_contents,
        static_access_link
      };
    }
    addCourse(pyld);
  };

  if (isLoading || load) {
    return (
      <div className="h-32">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <p>{error}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full h-max border border-accent rounded-md p-6 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 content-center gap-y-3 md:gap-x-6">
        {dropdowns}
        <Input type="number" required={true} control={control} name="course_contents.isbn_number" label="Add ISBN Number" />
        <Select
          displayEmpty={true}
          required={true}
          control={control}
          name="course_contents.uploaded_from"
          label="Uploaded From"
          dataArray={[
            { label: 'Eauthor', value: 'Eauthor' },
            { label: 'Static Pages', value: 'Static-page' }
          ]}
        />
        {
          watch('course_contents.uploaded_from') === 'Eauthor' && (
            <Input control={control} name="access_link" label="Access Link" />
          )
        }
        {
          watch('course_contents.uploaded_from') === 'Static-page' && (
            <Input control={control} name="static_access_link" label="Static Page Link" />
          )
        }
      </div>
      <div className="mt-4 float-right space-x-5">
        <Button type="submit" loading={addCourseLoading}>Upload Course</Button>
      </div>
    </form>
  );
}
