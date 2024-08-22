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
import { useNavigate, useParams } from 'react-router-dom';

const CoursesFilter = ({
  state,
  setVolumeDetails,
  name,
  grade,
  shortName,
}: any) => {
  const { control, watch, setValue } = useForm({});

  const { schoolName = '', courseId = '' } = useParams();
  const params = useParams();
  const navigate = useNavigate();

  const { userId: userID } = useSelector(selectUser);

  const [allVolumeDetails, setAllVolumeDetails] = useState<any>(null);
  const [allVolumeDetailsArray, setAllVolumeDetailsArray] = useState<any>(null);

  const [componentDetails, setComponentDetails] = useState<any>([]);
  const [currentComponent, setCurrentComponent] = useState<any>({});

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

  // useEffect(() => {
  //   if (name && grade) {
  //     componetsFetch();
  //   }
  // }, [name, grade]);

  // Set Default values of select boxes
  // useEffect(() => {
  //   if (state?.components) {
  //     const currentVal = componentDetails?.find(
  //       (obj: any) => obj?.label === state?.components
  //     );
  //     setCurrentComponent(currentVal);
  //     setValue('select_component', currentVal?.value);
  //   }
  // }, [state?.components, componentDetails]);

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

  // useEffect(() => {
  //   if (courseId) {
  //     console.log('courseId', courseId);
  //     setValue('select_book', courseId);
  //   }
  // }, [courseId]);

  const handleCourseChange = (e: any) => {
    const selectedCourse = e.target.value;
    setValue('select_course', selectedCourse);

    const currentVal = courseList?.find(
      (obj: any) => obj?.value === selectedCourse
    );

    setCurrentCourseName(currentVal.label.split('-')[0]);

    // navigate(
    //   `/${schoolName}/MySubject/${currentVal?.label}/${watch(
    //     'select_grade'
    //   )}/${courseId ?? 'course'}?type=course`,
    //   {
    //     state: {
    //       volume: state?.volume,
    //       courses_id: state?.courses_id,
    //       volume_id: courseId,
    //       course_name: currentVal?.name,
    //       grade,
    //       components: state?.components,
    //       component_id: state?.component_id,
    //       grade_id: watch('select_grade'),
    //     },
    //   }
    // );
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
    setValue('select_book', e.target.value);
  };

  // Fetch volumes based on grade
  useEffect(() => {
    // setVolumeDetails(null);
    // navigate(
    //   `/${schoolName}/MySubject/${name}/${watch(
    //     'select_grade'
    //   )}/${courseId ?? 'course'}?type=course`,
    //   {
    //     state: {
    //       volume: state?.volume,
    //       courses_id: state?.courses_id,
    //       volume_id: courseId,
    //       course_name: name,
    //       grade,
    //       components: currentComponent?.label,
    //       component_id: currentComponent?.value,
    //       grade_id: watch('select_grade'),
    //     },
    //   }
    // );
    if (currentCourseName && currentGradeName) {
      componetsFetch();
    }
  }, [currentGradeName, currentCourseName]);

  // Get course id from selected volume data array
  useEffect(() => {
    const currentVol = allVolumeDetailsArray?.find(
      (obj: any) => obj?.volume_id === watch('select_book')
    );

    setCourseId(currentVol?.courses_id);
  }, [allVolumeDetails, watch('select_book')]);

  // Redirect to new course page based on course id
  useEffect(() => {
    if (courseId) {
      const currentVol = allVolumeDetails?.find(
        (obj: any) => obj?.id === Number(courseId)
      );

      setValue('select_book', currentVol?.value);
      // setValue('select_course', currentVol.value);
      // navigate(`/${schoolName}/course-preview`, {
      //   state: {
      //     volume: state.volume,
      //     courses_id: state.courses_id,
      //     volume_id: courseId,
      //     course_name: name,
      //     grade,
      //     components: state.components,
      //     component_id: state.component_id,
      //     grade_id: watch('select_grade'),
      //   },
      // });
    }
  }, [courseId, allVolumeDetailsArray]);

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
    <div className="flex gap-8 lg:flex-nowrap flex-wrap bg-white p-4 rounded-lg mt-4  w-full m-auto">
      <Select
        name="select_course"
        control={control}
        required={true}
        label="Course"
        dataArray={courseList}
        onChange={handleCourseChange}
        sx={{ width: '200px', backgroundColor: 'transparent' }}
        loading={gradesLoading || componentsLoading}
      />

      <Select
        name="select_grade"
        control={control}
        required={true}
        label="Grade"
        dataArray={gradesDetails}
        onChange={handleGradeChange}
        sx={{ width: '200px', backgroundColor: 'transparent' }}
        loading={gradesLoading || componentsLoading}
      />

      <Select
        name="select_book"
        label="Other books"
        onChange={handleBookChange}
        control={control}
        dataArray={allVolumeDetails}
        sx={{ width: '200px', backgroundColor: 'transparent' }}
        loading={componentsLoading}
      />
    </div>
  );
};

export default CoursesFilter;
