/* eslint-disable no-console */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable no-shadow */
import { selectUser } from '@shared/store/userSlice';
import { api, useGet } from '@shared/api/useApi';
import Select from '@shared/form/Select';
import { sortData } from '@utility/utility';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const CoursesFilter = ({ grade, shortName }: any) => {
  const { control, watch, setValue } = useForm({});

  // const { courseId = '' } = useParams();

  const navigate = useNavigate();
  const location = useLocation();
  const { state: locationState } = useLocation();

  const { userId: userID } = useSelector(selectUser);

  const [allVolumeDetails, setAllVolumeDetails] = useState<any>(null);
  const [allVolumeDetailsArray, setAllVolumeDetailsArray] = useState<any>(null);

  const [gradesDetails, setGradesDetails] = useState<any>([]);
  const [currentGradeName, setCurrentGradeName] = useState<any>('');

  const [currentCourseId, setCourseId] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState<any>({});
  const [courseList, setCourseList] = useState<any>([]);
  const [currentCourseName, setCurrentCourseName] = useState<any>('');

  const [searchString, setSearchString] = useState('');
  const [categoriesData, setCategoriesData] = useState([]);

  const { isLoading: gradesLoading, refetch: gradesFetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/grade-list/?keyword=${currentCourseName}&user_id=${userID}`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      if (respData?.length) {
        const body: any = [];
        respData?.map((i: any) => {
          body.push({
            label: i?.grade,
            value: i?.grade,
          });
          body?.sort(sortData);
          return body;
        });
        setGradesDetails([...body]);
      }
    },
    onError: () => {},
    enabled: false,
  });

  const { isLoading: componentsLoading, refetch: componetsFetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/component-list/?keyword=${currentCourseName}&grade_value=${currentGradeName}&user_id=${userID}`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      if (respData?.length) {
        const resultAPIs = respData?.map((i: any) =>
          api(import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL)
            .get(
              `course-code-service/courses/volume-list/?keyword=${currentCourseName}&grade_value=${currentGradeName}&component_value=${i?.component}&user_id=${userID}`
            )
            .then((courses: any) => ({ i, courses }))
        );

        Promise.allSettled(resultAPIs).then((res: any) => {
          setIsLoading(false);
          const body: any = [];

          if (res?.length) {
            res?.forEach((element: any) => {
              const respData2 = element?.value?.courses?.data?.response;
              respData2?.map((i: any) => {
                body.push({
                  label: i?.volume,
                  value: i?.volume_id,
                  id: i?.courses_id,
                });
                body?.sort(sortData);
                return body;
              });
              setAllVolumeDetails(body);
              setAllVolumeDetailsArray(respData2);
            });
          }
        });
      }
    },
    onError: () => {},
    enabled: false,
  });

  useEffect(() => {
    if (shortName) {
      const currentVal = courseList?.find(
        (obj: any) => obj?.label === shortName
      );

      setValue('select_course', currentVal?.value);
    }
  }, [courseList, shortName]);

  // Set selected grade value
  useEffect(() => {
    if (grade) {
      setValue('select_grade', grade);
      setCurrentGradeName(grade);
    }
  }, [grade]);

  // Fetch grades based on course name change
  useEffect(() => {
    gradesFetch();
  }, [currentCourseName, shortName]);

  // Initial data
  useEffect(() => {
    setCurrentCourseName(shortName);
  }, [shortName]);

  const handleCourseChange = (e: any) => {
    const selectedCourse = e.target.value;
    setValue('select_course', selectedCourse);
    setValue('select_grade', '');
    setValue('select_book', '');

    const currentVal = courseList?.find(
      (obj: any) => obj?.value === selectedCourse
    );

    setCurrentCourseName(currentVal.label.split('-')[0]);
  };

  const handleGradeChange = (e: any) => {
    const selectedGrade = e.target.value;
    setValue('select_grade', selectedGrade);

    const currentVal = gradesDetails?.find(
      (obj: any) => obj?.value === selectedGrade
    );

    setCurrentGradeName(currentVal.label);
  };

  const handleBookChange = (e: any) => {
    const book = e.target.value;
    setValue('select_book', book);

    const currentVol = allVolumeDetails?.find(
      (obj: any) => obj?.value === book
    );

    setCourseId(currentVol?.id);

    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);

    navigate(`/${schoolNameInURL}/MySubject/${currentVol?.id}`, {
      state: {
        ...locationState,
        courseId: currentVol?.id,
      },
    });
  };

  // Fetch volumes based on grade
  useEffect(() => {
    if (currentCourseName && currentGradeName) {
      componetsFetch();
    }
  }, [currentGradeName, currentCourseName]);

  // Redirect to new course page based on course id
  useEffect(() => {
    if (locationState?.courseId) {
      const currentVol = allVolumeDetails?.find(
        (obj: any) => obj?.id === Number(locationState?.courseId)
      );

      setValue('select_book', currentVol?.value);
    }
  }, [locationState?.courseId, allVolumeDetailsArray]);

  const getAllcoursesDetails = (categoryArray: any) => {
    const resultAPIs = categoryArray?.map((items: any) =>
      api(import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL)
        .get(
          `course-code-service/courses/assigned_courses/${userID}/details/?Category=${items.content}`
        )
        .then((courses: any) => ({ category: items.content, courses }))
    );

    Promise.allSettled(resultAPIs).then((res: any) => {
      setIsLoading(false);
      const body: any = [];
      if (res?.length) {
        res?.forEach((element: any) => {
          const respData = element?.value?.courses?.data?.response;
          respData?.map((i: any) => {
            body.push({
              label: i?.short_name,
              value: i?.id,
            });
            body?.sort(sortData);
            return body;
          });

          setCourseList(body);
        });
      }
    });
  };

  //  Get Categories
  const {
    isLoading: categoriesLoading,
    data,
    isSuccess,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/content/?selection=Category${
      searchString ? `&search=${searchString}` : ''
    }`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response?.results;
      setCategoriesData(respData);
      setCourseDetails({});
    },
    onError: () => {},
  });

  useEffect(() => {
    getAllcoursesDetails(categoriesData);
  }, [categoriesData]);

  return (
    <div className="flex justify-start gap-8 lg:flex-nowrap flex-wrap bg-white p-4 rounded-lg mt-4 max-w-[1030px] w-full m-auto">
      <Select
        name="select_course"
        control={control}
        required={true}
        label="Course"
        dataArray={courseList}
        onChange={handleCourseChange}
        loading={gradesLoading || componentsLoading}
      />

      <Select
        name="select_grade"
        control={control}
        required={true}
        label="Grade"
        dataArray={gradesDetails}
        onChange={handleGradeChange}
        loading={gradesLoading || componentsLoading}
      />

      <Select
        name="select_book"
        label="Other books"
        onChange={handleBookChange}
        control={control}
        dataArray={allVolumeDetails}
        loading={componentsLoading}
      />
    </div>
  );
};

export default CoursesFilter;
