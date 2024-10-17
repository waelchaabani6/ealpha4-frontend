import React, { useEffect, useState } from 'react';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '@component/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import { usePost, useGet } from '@shared/api/useApi';
import moment from 'moment';
import { selectUser } from '@shared/store/userSlice';
import UseGetProfile from '@utility/Hooks/UseGetProfile';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import {
  resetAssignmentData,
  getAssignmentData,
} from '@shared/store/createAssignmentSlice';
import { SELECT_TYPE, ASSIGNMENT_MODE } from '@constants/constants';
import RouteLayout from '@layout/routeLayout';
import { selectClassYupSchema, selectClassArrayYupSchema } from './schema';
import AssignmentDetails from './assignmentDetails';
import AccordianCheckbox from './accordianCheckbox';

const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;
const COURSE_CODE_SERVICE = import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL;

export default function CreateAssignment() {
  const {
    courseId,
    selectedLesson,
    schoolName,
    course_name,
    grade_id,
    grade,
    component_id,
    components,
    volume_id,
    volume,
  } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState(ASSIGNMENT_MODE.DEFAULT);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignmentRespMessage, setAssignmentRespMessage] = useState('');
  const [
    listofStudentAssignmentNotCreated,
    setListofStudentAssignmentNotCreated,
  ] = useState<string[]>([]);
  const dispatch = useDispatch();
  const {
    user_profile_id: userProfileId,
    userId,
    schoolId,
    first_name: teacherfName,
    last_name: teacherlName,
    branchId,
  } = useSelector(selectUser);
  const [selectedCourseObj, setSelectedCourseObj] = useState<number>(0);
  const [ErrorDialogOpen, setErrorDialogOpen] = useState(false);
  const [ErrorMsg, setErrorMsg] = useState('');
  const [courses, setCourses] = useState<any>([]);
  const storedAssignmentData = useSelector(getAssignmentData);
  const [isChangeCourse, setChangeCourse] = useState(false);
  const [typeValue, setTypeValue] = useState('');
  const { getUser } = UseGetProfile();

  const resetForm = () => {
    methods.setValue('assignment_start_date', '');
    methods.setValue('assignment_due_date', '');
    setSelectedCourseObj(0);
    methods.reset({
      assignment_name: '',
      assignment_start_date: null,
      assignment_due_date: null,
      select_course: '',
      select_grade_id: '',
      select_components_id: '',
      select_volume_id: '',
      class_id: '',
      select_class: '',
      file: '',
      select_grade: '',
      select_components: '',
      volume_name: '',
      course_id: '',
      course_table_id: '',
    });
  };

  const methods = useForm<any>({
    resolver: yupResolver(
      typeValue !== SELECT_TYPE.CLASS
        ? selectClassYupSchema
        : selectClassArrayYupSchema
    ),
    mode: 'all',
    defaultValues: {
      documents: [],
      single_access: false,
      block_after_due_date: false,
      assignment_start_date: '',
      assignment_due_date: '',
    },
  });

  useEffect(() => {
    document.getElementById('app-top')?.scrollIntoView();
    if (courseId !== undefined && selectedLesson !== undefined) {
      setMode(ASSIGNMENT_MODE.NAVIGATE);
      if (storedAssignmentData?.select_course_id) {
        setSelectedCourseObj(storedAssignmentData?.select_course_id);
      } else {
        methods.setValue(`select_course_id`, courseId);
        methods.setValue(`select_course`, course_name);
        methods.setValue(`select_grade_id`, grade_id);
        methods.setValue(`select_grade`, grade);
        methods.setValue(`select_components`, components);
        methods.setValue(`select_components_id`, component_id);
        methods.setValue(`select_volume_id`, volume_id);
        methods.setValue(`select_volume`, volume);
        setSelectedCourseObj(Number(courseId));
      }
    }
  }, []);

  const returnAssignmentDataFun = (formData: any) => {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    const MyCourseData = new Array(formData.CourseDetails.length).fill(null);
    const { CourseDetails } = formData;
    // eslint-disable-next-line no-restricted-syntax
    for (const property in formData) {
      if (property.startsWith('chapter')) {
        const chapterIndex: any = property.split('_')[1];
        const lessonIndex = property.split('_')[3];
        if (property.split('_').length === 4) {
          if (CourseDetails.length > chapterIndex) {
            if (MyCourseData[chapterIndex] === null) {
              MyCourseData[chapterIndex] = {
                chapterIndex,
                lessons: [
                  { lessonIndex, isSelected: formData[property].isTrue },
                ],
              };
            } else {
              MyCourseData[chapterIndex] = {
                chapterIndex,
                lessons: [
                  ...MyCourseData[chapterIndex].lessons,
                  { lessonIndex, isSelected: formData[property].isTrue },
                ],
              };
            }
          }
        }
      }
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const property in formData) {
      if (property.startsWith('chapter')) {
        const chapterIndex: any = property.split('_')[1];
        const lessonIndex = property.split('_')[3];
        if (CourseDetails.length > chapterIndex) {
          if (property.split('_').length === 6) {
            const pageIndex = property.split('_')[5];
            if (
              MyCourseData[chapterIndex]?.lessons[lessonIndex]?.pages == null
            ) {
              MyCourseData[chapterIndex].lessons[lessonIndex] = {
                ...MyCourseData[chapterIndex].lessons[lessonIndex],
                pages: [
                  {
                    pageIndex,
                    isSelected: formData[property].isTrue,
                  },
                ],
              };
            } else {
              MyCourseData[chapterIndex].lessons[lessonIndex].pages = [
                ...MyCourseData[chapterIndex].lessons[lessonIndex].pages,
                {
                  pageIndex,
                  isSelected: formData[property].isTrue,
                },
              ];
            }
          }
        }
      }
    }

    let MyCourseDetails = CourseDetails.map(
      (chapter: any, chapterIndex: number) => ({
        ...chapter,
        lessons: chapter.visible_lessons
          .map((lesson: any, lessonIndex: number) => {
            const { isSelected } =
              MyCourseData[chapterIndex].lessons[lessonIndex];
            const currentPageArray = MyCourseData[chapterIndex]?.lessons[
              lessonIndex
            ]?.pages
              ? MyCourseData[chapterIndex]?.lessons[lessonIndex]?.pages
                  .map((page: any, pageIndex: number) =>
                    page.isSelected ? Number(page.pageIndex) : null
                  )
                  .filter((n: any) => n !== null)
              : [];
            delete lesson.s3_lesson_url;
            delete lesson.status;
            const pages =
              lesson && lesson.pages
                ? lesson?.pages
                    ?.map(
                      (page: any, pageIndex: number, page_number: number) =>
                        currentPageArray.includes(pageIndex)
                          ? {
                              page_name: page.name,
                              page_id: page.page_id,
                              page_number: page.page_number,
                            }
                          : null
                    )
                    .filter((n: any) => n !== null)
                : [];
            if (isSelected || pages.length !== 0) {
              return {
                ...lesson,
                isSelected,
                pages,
              };
            }
            return null;
          })
          .filter((lesson: any): boolean => lesson)
          .map((ele: any) => {
            delete ele.isSelected;
            return ele;
          }),
      })
    ).filter((chapter: any) => chapter.lessons.length !== 0);

    MyCourseDetails = MyCourseDetails.map((chapter: any) => {
      delete chapter.id;
      delete chapter.visible_lessons;
      return { ...chapter };
    });

    return MyCourseDetails;
  };

  function onSubmit(formData: any) {
    const returnAssignmentData = returnAssignmentDataFun(formData);
    const startDateCase = `${moment(formData.assignment_start_date).format('YYYY-MM-DD')}`;
    const endDateCase = `${moment(formData.assignment_due_date).format('YYYY-MM-DD')}`;
    const teacherName = `${teacherfName} ${teacherlName}`;

    if (returnAssignmentData.length === 0) {
      methods.setValue('checkboxError', 'Lesson not selected');
      methods.setError('checkboxError', {
        type: 'custom',
        message: 'Lesson not selected',
      });
      return;
    }
    methods.setValue('checkboxError', undefined);
    methods.clearErrors('checkboxError');

    let assignExternalId: any[] = [];
    if (formData.select_type === SELECT_TYPE.STUDENT) {
      const selectedStudentIndex: any[] = [];
      // eslint-disable-next-line array-callback-return
      formData.studentCheckbox.map((ele: any, index: number) => {
        if (ele.isTrue === true) {
          selectedStudentIndex.push(index);
        }
      });
      if (selectedStudentIndex.length === 0) {
        methods.setValue('StudentCheckboxError', 'Please select students');
        return;
      }
      methods.clearErrors('StudentCheckboxError');
      methods.setValue('StudentCheckboxError', undefined);
      formData.studentCheckboxList.map((ele: any, ind: number) => {
        if (selectedStudentIndex.includes(ind)) {
          assignExternalId.push(ele.id);
        }
        return ele;
      });
    } else {
      assignExternalId = [...formData.selected_class_id];
    }

    let classId = 1;
    if (
      (formData.select_type === SELECT_TYPE.STUDENT ||
        formData.select_type === SELECT_TYPE.CLASS) &&
      formData?.selected_class_id &&
      formData.selected_class_id.length !== 0
    ) {
      // eslint-disable-next-line prefer-destructuring
      classId = formData.selected_class_id[0];
    }

    const passObj: any = {
      assignments_data: JSON.stringify(returnAssignmentData),
      name: formData.assignment_name,
      start_date: startDateCase,
      end_date: endDateCase,
      grade: formData.select_grade_id,
      grade_name: formData?.select_grade,
      component_id: formData.select_components_id,
      component_name: formData?.select_components,
      volume_id: formData.select_volume_id,
      assignment_type: formData.assignment_type,
      class_id: classId,
      school_id: schoolId,
      created_by: userProfileId,
      updated_by: userProfileId,
      assignment_comment: formData.comments,
      assign_external_id: JSON.stringify(assignExternalId),
      assign_external_name:
        formData.select_class || formData.select_class_array.join(','),
      file: formData?.file?.file,
      course_name: formData?.select_course,
      volume_name: formData?.select_volume,
      course_id: formData.course_id,
      course_table_id: formData.course_table_id,
      block_after_due_date: formData.block_after_due_date,
      single_access: formData.single_access,
      teacher_name: teacherName,
      branch_id: branchId,
    };

    if (branchId == null) {
      delete passObj.branch_id;
    }
    if (passObj.file === undefined) {
      delete passObj.file;
    }

    const userFd = new FormData();
    Object.keys(passObj).forEach((key: string) => {
      userFd.append(key, passObj[key]);
    });
    // mutatePostAssinmentData(passObj);
    mutatePostAssinmentData(userFd);
  }

  const { isLoading, mutate: mutatePostAssinmentData } = usePost({
    baseURL,
    url: `assignments-service/assignment/create/`,
    onSuccess: async ({
      data,
    }: {
      data: {
        message: string;
        response: {
          'assignment not created for ': {
            first_name: string;
            last_name: string;
          }[];
        };
      };
    }) => {
      setAssignmentRespMessage(data?.message);
      if (data?.response && data?.response['assignment not created for ']) {
        setListofStudentAssignmentNotCreated(
          data?.response['assignment not created for '].map(
            (student: { first_name: string; last_name: string }) =>
              `${student.first_name} ${student.last_name}`
          )
        );
      }
      setDialogOpen(true);
      dispatch(resetAssignmentData());
    },
    onError: ({ response }: any) => {
      if (response?.data?.response) {
        setListofStudentAssignmentNotCreated(
          response?.data?.response.map(
            (student: { first_name: string; last_name: string }) =>
              `${student.first_name} ${student.last_name}`
          )
        );
      }
      setErrorMsg(response?.data?.message || 'Something went wrong');
      setErrorDialogOpen(true);
    },
  });

  useGet({
    baseURL: COURSE_CODE_SERVICE,
    url: `course-code-service/courses/assigned_courses/${userId}/details/`,
    onSuccess: (resp: any) => {
      const accData = resp?.data?.response;
      const respData = accData;
      if (respData?.length) {
        const tempCourseData: any = [];
        const allCourses: string[] = [];
        respData.forEach((ele: { short_name: string }) => {
          if (!allCourses.includes(ele.short_name)) {
            tempCourseData.push({
              label: ele.short_name,
              value: ele.short_name,
              id: ele.short_name,
            });
            allCourses.push(ele.short_name);
          }
        });
        setCourses([...tempCourseData]);
      }
    },
  });

  useEffect(() => {
    if (dialogOpen) {
      getUser();
    }
  }, [dialogOpen]);

  return (
    <RouteLayout>
      <HeaderMenus title="Create Assignment" />
      <FormProvider {...methods}>
        <form
          className="mt-5 w-full overflow-auto rounded-md h-max bg-white"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <AssignmentDetails
            setChangeCourse={setChangeCourse}
            setSelectedCourseObj={setSelectedCourseObj}
            selectedCourseObj={selectedCourseObj}
            courses={courses}
            mode={mode}
          />
          <hr />
          <AccordianCheckbox
            typeValue={typeValue}
            setTypeValue={setTypeValue}
            isChangeCourse={isChangeCourse}
            setSelectedCourseObj={setSelectedCourseObj}
            selectedCourseObj={selectedCourseObj}
            selectedLesson={selectedLesson}
            mode={mode}
            setMode={setMode}
          />
          <div className="py-8 float-right space-x-5 px-5">
            <Button
              variant="outlined"
              type="button"
              onClick={() => {
                navigate(`/${schoolName}/assignment`);
              }}
            >
              Cancel
            </Button>
            <Button loading={isLoading}>Create Assignment</Button>
          </div>
        </form>
      </FormProvider>

      <CustomizedDialogs
        onclose={() => {
          navigate(`/${schoolName}/assignment`);
        }}
        open={dialogOpen}
        setOpen={() => {
          setDialogOpen(false);
          resetForm();
        }}
        title="Assignment Created"
      >
        <div className="text-center">
          <div className="mb-4 font-bold">{assignmentRespMessage}</div>

          {listofStudentAssignmentNotCreated.length ? (
            <div className="mb-4 flex flex-col">
              <div className="font-bold text-center">
                Assignments not created for
              </div>
              <div className="text-center font-normal">
                {' '}
                {listofStudentAssignmentNotCreated.join(', ')}{' '}
              </div>
            </div>
          ) : null}
          <Button
            onClick={() => {
              navigate(`/${schoolName}/assignment`);
            }}
          >
            Ok
          </Button>
        </div>
      </CustomizedDialogs>
      <CustomizedDialogs
        onclose={() => {
          setErrorDialogOpen(false);
        }}
        open={ErrorDialogOpen}
        setOpen={() => {
          setErrorDialogOpen(false);
        }}
        title="Assigmnent Information"
      >
        <div className="text-center">
          <div className="mb-4 font-bold">
            {/* {' '}
            {ErrorMsg !== '' ? ErrorMsg : ''}
            .
            {' '} */}
            {listofStudentAssignmentNotCreated.length ? (
              <div className="mt-4 mb-4 flex flex-col">
                <div className="font-bold text-center">
                  Assignments not created for
                </div>
                <div className="text-center font-normal">
                  {' '}
                  {listofStudentAssignmentNotCreated.join(', ')}{' '}
                </div>
                <div className="text-center font-normal mt-2">
                  Note: Assignment is not created for the above students as
                  courses are not assigned to them. Please contact the
                  administrator support team on{' '}
                  <a
                    href="mailto:digital.accounts@alphapublishing.com"
                    className="text-blue-600 underline"
                  >
                    digital.accounts@alphapublishing.com
                  </a>{' '}
                  and request them to assign the courses. Once the courses are
                  assigned then you can able to create the assignments.
                </div>
              </div>
            ) : null}
          </div>
          <Button
            onClick={() => {
              setErrorDialogOpen(false);
            }}
          >
            {' '}
            Ok{' '}
          </Button>
        </div>
      </CustomizedDialogs>
    </RouteLayout>
  );
}
