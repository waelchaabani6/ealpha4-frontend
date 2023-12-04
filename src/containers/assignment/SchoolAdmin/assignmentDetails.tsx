import React, { SetStateAction, Dispatch, useState, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import DatePicker from '@shared/form/DatePicker';
import Select from '@shared/form/Select';
import Input from '@shared/form/Input';
import { useGet } from '@shared/api/useApi';
import { ASSIGNMENT_MODE } from '@constants/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';

const COURSE_CODE_SERVICE = import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL;
interface gradeObjType {
  label: string;
  value: string;
  grade_id: string;
}

interface componentObjType { label: string; value: string; id: number }

export default function AssignmentDetails({ setSelectedCourseObj, selectedCourseObj, courses, mode, setChangeCourse }: {
  setSelectedCourseObj: Dispatch<SetStateAction<number>>;
  selectedCourseObj: any;
  courses: any;
  mode: any;
  setChangeCourse: any;
}) {
  const { control, setValue, watch } = useFormContext();
  const [Volumes, setVolumes] = useState<any>([]);
  const [GradeArray, setGradeArray] = useState<gradeObjType[]>([]);
  const [ComponentArray, setComponentArray] = useState<componentObjType[]>([]);
  const { userId } = useSelector(selectUser);

  useEffect(() => {
    if (mode === ASSIGNMENT_MODE.NAVIGATE && courses.length !== 0) {
      const courseObj = courses.filter((ele: any) => Number(ele.id) === Number(selectedCourseObj));
      if (courseObj && courseObj.length) {
        setValue('select_course', courseObj[0].value);
        const selectedTempCourseObj = courseObj[0];
        const allGradeArray: gradeObjType[] = selectedTempCourseObj.course_contents.map((ele: { category: string; course_selection: string }) => (ele.course_selection === 'Grade' ? { ...ele, label: ele.category, value: ele.category } : null)).filter((n: any) => n);
        setGradeArray(allGradeArray);
      }
    }
  }, [courses]);

  useEffect(() => {
    if (watch('GradeArray') && watch('GradeArray').length) {
      setGradeArray(watch('GradeArray'));
    }
  }, watch('GradeArray'));

  const { refetch: componentRefetch, isLoading: componentLoading, isRefetching: componentRefetching } = useGet({
    baseURL: COURSE_CODE_SERVICE,
    url: `course-code-service/courses/component-list/?keyword=${watch('select_course')}&grade_value=${watch('select_grade')}&user_id=${userId}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      if (respData?.length) {
        const tempCourseData : { label: string; value: string; id: number; courses_id: string }[] = [];
        respData.forEach((ele: any) => {
          tempCourseData.push({
            label: ele.component,
            value: ele.component,
            id: ele.component_id,
            courses_id: ele.courses_id
          });
        });
        setComponentArray([...tempCourseData]);
      }
    },
    enabled: false
  });

  const { refetch: volumeRefetch, isLoading: volumeLoading, isRefetching: volumeRefetching } = useGet({
    baseURL: COURSE_CODE_SERVICE,
    url: `course-code-service/courses/volume-list/?keyword=${watch('select_course')}&grade_value=${watch('select_grade')}&component_value=${watch('select_components')}&user_id=${userId}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      if (respData?.length) {
        const tempCourseData : { label: string; value: string; id: number; courses_id: number }[] = [];
        respData.forEach((ele: any) => {
          tempCourseData.push({
            label: ele.volume,
            value: ele.volume,
            id: ele.volume_id,
            courses_id: ele.courses_id
          });
        });
        setVolumes([...tempCourseData]);
      }
    },
    enabled: false
  });

  const { refetch: gradeRefetch, isLoading: gradeLoading, isRefetching: gradeRefetching } = useGet({
    baseURL: COURSE_CODE_SERVICE,
    url: `course-code-service/courses/grade-list/?keyword=${watch('select_course')}&user_id=${userId}`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      if (respData?.length) {
        const tempGradeData : { label: string; value: string; grade_id: string }[] = [];
        respData.forEach((ele: any) => {
          tempGradeData.push({
            label: ele.grade,
            value: ele.grade,
            grade_id: ele.grade_id
          });
        });
        setGradeArray([...tempGradeData]);
      }
    },
    enabled: false
  });

  useEffect(() => {
    if (watch('select_course') && watch('select_grade')) {
      componentRefetch();
    }
  }, [watch('select_grade')]);

  useEffect(() => {
    if (watch('select_course') && watch('select_grade') && watch('select_components')) {
      volumeRefetch();
    }
  }, [watch('select_components')]);

  useEffect(() => {
    if (watch('select_course')) {
      gradeRefetch();
    }
  }, [watch('select_course')]);

  return (
    <div className="w-full h-max p-6 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 content-center gap-y-3 md:gap-x-6 pb-4">
        <Input required={true} control={control} name="assignment_name" label="Assignment Name" />
        <DatePicker
          control={control}
          disableOld={true}
          name="assignment_start_date"
          label="Assignment Start Date"
          disablePast={new Date()}
          required={true}
          disableFuture={watch('assignment_due_date')}
        />
        <DatePicker
          disabled={!watch('assignment_start_date')}
          control={control}
          name="assignment_due_date"
          label="Assignment Due Date"
          disablePast={watch('assignment_start_date')}
          required={true}
          disableOld={!!watch('assignment_start_date')}
        />
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-y-3 md:gap-x-6">
        <Select
          control={control}
          name="select_course"
          label="Select Course"
          dataArray={courses}
          required={true}
          // value={selectedCourseObj?.value}
          onChange={(val: any) => {
            setValue('select_course', val.target.value);

            setSelectedCourseObj(0);
            setValue('select_course_id', '');

            setValue('select_grade', '');
            setValue('select_grade_id', '');

            setValue('select_components', '');
            setValue('select_components_id', '');

            setValue('select_volume', '');
            setValue('select_volume_id', '');
          }}
        />
        <Select
          control={control}
          name="select_grade"
          disabled={!(watch('select_course')) || gradeLoading || gradeRefetching}
          label="Select Grade"
          dataArray={GradeArray}
          required={true}
          onChange={(val: any) => {
            if (val.target.value) {
              setValue('select_grade', val.target.value);
              const selectedGradeObj = GradeArray.filter((ele: any) => ele.label === val.target.value)[0];
              setValue('select_grade_id', selectedGradeObj.grade_id);
            } else {
              setValue('select_grade', '');
              setValue('select_grade_id', '');
            }

            setSelectedCourseObj(0);
            setValue('select_course_id', '');

            setValue('select_components', '');
            setValue('select_components_id', '');

            setValue('select_volume', '');
            setValue('select_volume_id', '');
          }}
        />

        <Select
          control={control}
          name="select_components"
          disabled={!(watch('select_course') && watch('select_grade')) || componentLoading || componentRefetching}
          label="Select Component"
          dataArray={ComponentArray}
          required={true}
          onChange={(val: any) => {
            if (val.target.value) {
              setValue('select_components', val.target.value);
              const selectedComponentObj = ComponentArray.filter((ele: any) => ele.label === val.target.value)[0];
              setValue('select_components_id', selectedComponentObj.id);
            } else {
              setValue('select_components', '');
              setValue('select_components_id', '');
            }

            setSelectedCourseObj(0);
            setValue('select_course_id', '');

            setValue('select_volume', '');
            setValue('select_volume_id', '');
          }}
        />
        <Select
          control={control}
          disabled={!(watch('select_course') && watch('select_grade') && watch('select_components')) || volumeLoading || volumeRefetching}
          name="select_volume"
          label="Select Volume"
          required={true}
          dataArray={Volumes}
          onChange={(val: any) => {
            if (val.target.value) {
              setValue('select_volume', val.target.value);
              setChangeCourse(true);
              const selectedVolumeObj = Volumes.filter((ele: any) => ele.label === val.target.value)[0];
              setValue('select_volume_id', selectedVolumeObj.id);
              setSelectedCourseObj(selectedVolumeObj.courses_id);
              setValue('select_course_id', selectedVolumeObj.courses_id);
            } else {
              setValue('select_volume', '');
              setValue('select_volume_id', '');
              setSelectedCourseObj(0);
              setValue('select_course_id', '');
            }
          }}
        />
      </div>
    </div>
  );
}
