/* eslint-disable linebreak-style */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ReactComponent as Search } from '@images/search.svg';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@shared/form/Select';
import Checkbox from '@component/checkbox';
import { FormControlLabel, FormGroup } from '@mui/material';
import Loader from '@shared/loader';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useGet } from '@shared/api/useApi';
import schema from './schema';

type Props = {
  selectedCourse: string[];
  setToggleCourse: (value: string[]) => void;
  error: string;
  seterror: React.SetStateAction<any>;
  codeType?: string;
};

export default function AdvanceFilter(props: Props) {
  const { codeType } = props;
  const ref = useRef(null);
  const [courseDataArray, setCourseDataArray] = useState<any>([]);
  const [categoryDataArray, setCategoryDataArray] = useState<any>([]);
  const [subjectDataArray, setSubjectDataArray] = useState<any>([]);
  const [gradeDataArray, setGradeDataArray] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [value, setvalue] = useState<string>('');
  const { control, watch } = useForm({
    resolver: yupResolver(schema),
  });

  const focusHandler = () => {
    setOpen(true);
  };

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
    setvalue(ev.target.value);
    setOpen(true);
    if (ev.target.value === '') {
      props.seterror('required');
      props.setToggleCourse([]);
    }
  };

  const onCheckboxToggle = useCallback(
    (checkValue: string) => {
      const exists = props.selectedCourse.includes(checkValue);
      if (exists) {
        const tmp = props.selectedCourse.filter(
          (course: string) => course !== checkValue
        );
        if (tmp.length > 0) {
          props.seterror('');
        } else {
          props.seterror('required');
        }
        props.setToggleCourse(tmp);
      } else {
        props.seterror('');
        if (codeType === 'single') {
          props.setToggleCourse([checkValue]);
        } else {
          props.setToggleCourse([...props.selectedCourse, checkValue]);
        }
      }
    },
    [props.selectedCourse, value]
  );

  const radioBoxes = (
    <RadioGroup
      aria-labelledby="demo-radio-buttons-group-label"
      name="radio-buttons-group"
      onChange={(ele) => onCheckboxToggle(ele.target.value)}
    >
      {courseDataArray?.map((ele: any) => (
        <FormControlLabel
          key={ele?.value}
          value={ele?.value}
          control={<Radio color="success" />}
          label={ele?.label}
        />
      ))}
    </RadioGroup>
  );

  const checkboxes = courseDataArray.map(
    (ele: { label: string; value: string }) => {
      const selected = props.selectedCourse.includes(ele.value);
      return (
        <FormControlLabel
          key={ele.value}
          control={
            <Checkbox
              checked={selected}
              onChange={() => onCheckboxToggle(ele.value)}
            />
          }
          label={ele.label}
        />
      );
    }
  );

  // -----------------API---------------------------
  const { isLoading: courseLoading, refetch: fetchCourses } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/?limit=100&offset=0&selection=Component${watch('select_category') ? `&category=${categoryDataArray.find((obj: any) => obj.value === watch('select_category')).label}` : ''}${watch('select_subject') ? `&course_id=${subjectDataArray.find((obj: any) => obj.value === watch('select_subject')).value}` : ''}${watch('select_grade') ? `&grade=${gradeDataArray.find((obj: any) => obj.value === watch('select_grade')).label}` : ''}&search=${value}`,
    cacheTime: 2000,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results || [];
      const temp: any = [];
      resp?.map((item: any) => {
        temp.push({ label: item?.name, value: item?.id });
        return temp;
      });
      setCourseDataArray(temp);
    },
    enabled: false,
  });

  const { isLoading: subjectLoading, data: subjectArray } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?ordering=-created_at&limit=300&offset=0&selection=Course`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results || [];
      const temp: any = [];
      resp?.map((item: any) => {
        temp.push({ label: item?.content, value: item?.id });
        return temp;
      });
      console.log(temp, 'subjectArray');
      setSubjectDataArray(temp);
    },
  });
  const { isLoading: gradeLoading, data: gradeArray } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?ordering=-created_at&limit=300&offset=0&selection=Grade`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results || [];
      const temp: any = [];
      resp?.map((item: any) => {
        temp.push({ label: item?.content, value: item?.id });
        return temp;
      });
      setGradeDataArray(temp);
    },
  });
  const { isLoading: categoryLoading, data: categoryArray } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?ordering=-created_at&limit=300&offset=0&selection=Category`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results || [];
      const temp: any = [];
      resp?.map((item: any) => {
        temp.push({ label: item?.content, value: item?.id });
        return temp;
      });
      setCategoryDataArray(temp);
    },
  });

  // ---------------END------------------------------

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [
    watch('select_category'),
    watch('select_subject'),
    watch('select_grade'),
    value,
  ]);

  return (
    <div ref={ref} className="w-full h-full flex flex-col relative">
      <p className={`text-xs pb-4 ${props.error !== '' ? 'text-red-500' : ''}`}>
        Select Course
      </p>
      <div
        className={`flex-1 flex bg-white border-2 rounded px-0.5 ${props.error !== '' ? 'border-red-500' : ''}`}
      >
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search"
            className="h-full w-full px-1 outline-none placeholder:text-black text-sm"
            value={value}
            onChange={onChange}
            onFocus={focusHandler}
          />
        </div>
        <div className="w-[32px] h-full grid justify-center place-items-center">
          <Search className="p-px pl-1" />
        </div>
      </div>
      {open &&
        (courseLoading ? (
          <div className="pt-8 bg-gray-100 pb-6">
            <Loader size={20} />
          </div>
        ) : (
          <div
            className={`border-2 p-4 border-t-0 border-sandgray rounded 
              ${props.error !== '' ? 'border-red-500' : ''}`}
          >
            <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
              <Select
                control={control}
                name="select_category"
                label="Select Category"
                dataArray={categoryDataArray || []}
              />
              <Select
                control={control}
                name="select_subject"
                label="Select Course"
                dataArray={subjectDataArray || []}
              />
              <Select
                control={control}
                name="select_grade"
                label="Select Grade"
                dataArray={gradeDataArray || []}
              />
            </div>
            <div className="overflow-auto h-[200px] mt-4">
              <FormGroup>
                {codeType === 'single' ? radioBoxes : checkboxes}
              </FormGroup>
            </div>
          </div>
        ))}
      {props.error !== '' && (
        <p className="text-xs pt-2 text-red-500">{props.error}</p>
      )}
    </div>
  );
}
