import Button from '@component/button/button';
import Dropdown from '@component/dropdown/Dropdown';
import RouteLayout from '@layout/routeLayout';
import { useGet, usePatch } from '@shared/api/useApi';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import toast from '@shared/toast';
import { useEffect, useState } from 'react';

const CourseIcons = () => {
  const [courseArr, setCourseArr] = useState<any>([]);
  const [course, setCourse] = useState('');
  const [courseFile, setCourseFile] = useState<any>();

  const [gradeArr, setGradeArr] = useState<any>([]);
  const [grade, setGrade] = useState('');
  const [gradeFile, setGradeFile] = useState<any>();

  const [componentArr, setComponentArr] = useState<any>([]);
  const [component, setComponent] = useState('');
  const [componentFile, setComponentFile] = useState<any>();
  const GRADE = 'Grade';
  const COMPONENT = 'Component';

  const [loader, setLoader] = useState(GRADE);

  const findCourseId = courseArr?.find((i: any) => i.value === course);
  const courseCodeBaseURL = import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL;

  const handleCourse = () => {
    if (course && courseFile) {
      const formData = new FormData();
      formData.append('course_short_name', findCourseId?.id || '');
      formData.append('logo_file', courseFile || null);
      mutateCourse(formData);
    } else {
      toast('error', 'Course or Course-icon is missing');
    }
  };
  const handleGrade = (param: string) => {
    setLoader(param);
    if (course && grade) {
      const formData = new FormData();
      formData.append('course_short_name', findCourseId?.id || '');
      formData.append('category_id', param === GRADE ? grade : component);
      formData.append('content_icon_file', param === GRADE ? gradeFile : componentFile);
      mutateCategory(formData);
    } else {
      toast('error', 'Course or Course-icon is missing');
    }
  };

  const { isLoading, isRefetching } = useGet({
    baseURL: courseCodeBaseURL,
    url: `course-code-service/courses/short-name-list/`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const arr = accData?.map((i: any): any => ({
        label: i.short_name,
        value: i.short_name,
        id: i.short_name
      }));
      setCourseArr([...arr]);
    }
  });

  const { isLoading: mutateCourseLoading, mutate: mutateCourse } = usePatch({
    baseURL: courseCodeBaseURL,
    url: `course-code-service/courses/logo/update`,
    onSuccess: (resp: any) => {
      toast('success', 'Course Icon Updated Successfully');
      setCourse('');
      setCourseFile(null);
    },
    onError: (resp: any) => {
      toast('error', resp?.response?.data?.message || 'Error');
    },
    enabled: false
  });

  const { isLoading: mutateCategoryLoading, mutate: mutateCategory } = usePatch({
    baseURL: courseCodeBaseURL,
    url: `course-code-service/courses/content/logo/update`,
    onSuccess: (resp: any) => {
      toast('success', 'Category Icon Updated Successfully');
      setGrade('');
      setGradeFile(null);
      setComponent('');
      setComponentFile(null);
    },
    onError: (resp: any) => {
      toast('error', resp?.response?.data?.message || 'Error');
    },
    enabled: false
  });

  const { refetch: gradeRefetch, isLoading: gradeLoading, isRefetching: gradeRefetching } = useGet({
    baseURL: courseCodeBaseURL,
    url: `course-code-service/courses/content-list/?short_name=${findCourseId?.id}&keyword=Grade`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      if (respData?.length) {
        const tempGradeData: { label: string; value: string }[] = [];
        respData.forEach((ele: any) => {
          tempGradeData.push({
            label: ele.category,
            value: ele.category_id
          });
        });
        setGradeArr([...tempGradeData]);
      }
    },
    enabled: false
  });

  const { refetch: componentRefetch, isLoading: componentLoading, isRefetching: componentRefetching } = useGet({
    baseURL: courseCodeBaseURL,
    url: `course-code-service/courses/content-list/?short_name=${findCourseId?.id}&keyword=Component`,
    onSuccess: (resp: any) => {
      const respData = resp?.data?.response;
      if (respData?.length) {
        const tempCourseData: { label: string; value: string }[] = [];
        respData.forEach((ele: any) => {
          tempCourseData.push({
            label: ele.category,
            value: ele.category_id
          });
        });
        setComponentArr([...tempCourseData]);
      }
    },
    enabled: false
  });

  useEffect(() => {
    if (course) {
      gradeRefetch();
    }
  }, [course]);

  useEffect(() => {
    if (course && grade) {
      componentRefetch();
    }
  }, [grade, course]);

  return (
    <RouteLayout
      navBack={true}
    >
      <HeaderMenus title="Upload Icons" />
      <div className="wrapperBorder mt-5 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <Dropdown
              loading={isLoading || isRefetching}
              title="Select Course"
              value={course}
              dataArray={courseArr}
              onChangeHandler={(val) => {
                setCourse(val);
                setGrade('');
                setGradeFile(null);
                setComponent('');
                setComponentFile(null);
              }}
              sxClass={{
                width: '100%',
                border: '1px solid var(--sandgray)'
              }}
            />
            <div className="mt-5">
              <Button
                variant="contained"
                component="label"
                type="button"
                sx={{ width: '100%' }}
              >
                Upload Icon
                <input
                  accept="image/*"
                  type="file"
                  hidden
                  onChange={(val) => setCourseFile(val?.target?.files?.[0])}
                />
              </Button>
              <p className="mt-2 mb-2 text-xs">{courseFile?.name}</p>
            </div>
            <div className="mt-5">
              <Button loading={mutateCourseLoading} disabled={!course || !courseFile} type="button" sx={{ width: '100%' }} onClick={handleCourse}>Save</Button>
            </div>
          </div>

          <div>
            <Dropdown
              loading={gradeLoading || gradeRefetching}
              disabled={!course}
              title="Select Grade"
              value={grade}
              dataArray={gradeArr}
              onChangeHandler={(val) => {
                setComponent('');
                setComponentFile(null);
                setGrade(val);
              }}
              sxClass={{
                width: '100%',
                border: '1px solid var(--sandgray)'
              }}
            />
            <div className="mt-5">
              <Button
                variant="contained"
                component="label"
                type="button"
                sx={{ width: '100%' }}>
                Upload Icon
                <input
                  accept="image/*"
                  type="file"
                  hidden
                  onChange={(val) => setGradeFile(val?.target?.files?.[0])}
                />
              </Button>
            </div>
            <p className="mt-2 mb-2 text-xs">{gradeFile?.name}</p>
            <div className="mt-5">
              <Button loading={mutateCategoryLoading && loader === GRADE} onClick={() => handleGrade(GRADE)} disabled={!grade || !gradeFile} type="button" sx={{ width: '100%' }}>Save</Button>
            </div>
          </div>

          <div>
            <Dropdown
              loading={componentLoading || componentRefetching}
              title="Select Component"
              disabled={!grade}
              value={component}
              dataArray={componentArr}
              onChangeHandler={(val) => setComponent(val)}
              sxClass={{
                width: '100%',
                border: '1px solid var(--sandgray)'
              }}
            />
            <div className="mt-5">
              <Button
                variant="contained"
                component="label"
                type="button"
                sx={{ width: '100%' }}>
                Upload Icon
                <input
                  accept="image/*"
                  type="file"
                  hidden
                  onChange={(val) => setComponentFile(val?.target?.files?.[0])}
                />
              </Button>
            </div>
            <p className="mt-2 mb-2 text-xs">{componentFile?.name}</p>
            <div className="mt-5">
              <Button loading={mutateCategoryLoading && loader === COMPONENT} onClick={() => handleGrade(COMPONENT)} disabled={!component || !componentFile} type="button" sx={{ width: '100%' }}>Save</Button>
            </div>
          </div>
        </div>
      </div>
    </RouteLayout>
  );
};

export default CourseIcons;
