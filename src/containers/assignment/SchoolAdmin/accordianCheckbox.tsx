import React, { useEffect, useState, useRef } from 'react';
import CheckBox from '@shared/form/Checkbox';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import FileSelect from '@component/fileUpload';
import Select from '@shared/form/Select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@component/button/button';
import { useGet, usePost } from '@shared/api/useApi';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { USER_TYPE, SELECT_TYPE, ASSIGNMENT_MODE } from '@constants/constants';
import TextArea from '@shared/form/TextArea';
import {
  setAssignmentData,
  getAssignmentData,
} from '@shared/store/createAssignmentSlice';
import Loader from '@shared/loader';

const AllowerdTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4',
  'image/png',
  'video/avi',
  ' text/plain',
  'text/html',
  ' video/quicktime',
  'application/vnd.oasis.opendocument.presentation',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
];
const COURSE_CODE_SERVICE = import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL;
const SCHOOL_SERVICE = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
const USER_SERVICE = import.meta.env.VITE_APP_USER_SERVICE_URL;

const selObj: any = {
  Student: 'student',
  'My Group': 'my_group',
  Class: 'class',
};

const AccordianCheckbox = React.forwardRef(
  (
    {
      selectedCourseObj,
      selectedLesson,
      mode,
      setMode,
      isChangeCourse,
      setSelectedCourseObj,
      typeValue,
      setTypeValue,
    }: {
      selectedCourseObj: any;
      selectedLesson: string | undefined;
      mode: string;
      setMode: any;
      isChangeCourse: boolean;
      setSelectedCourseObj: any;
      typeValue: string;
      setTypeValue: any;
    },
    ref: any
  ) => {
    const fileRef = useRef();
    const [Classes, setClasses] = useState<any>([]);
    const [ClassId, setClassId] = useState<any>(-1);
    const [GroupList, setGroupList] = useState<any>([]);
    const [idLots, setIdLots] = useState<any>([]);

    const {
      control,
      setValue,
      setError,
      getValues,
      watch,
      clearErrors,
      register,
      resetField,
      unregister,
    } = useFormContext();
    const [CourseDetails, setCourseDetails] = useState<any>([]);
    const name = 'academic_information';
    const dispatch = useDispatch();
    const { fields, append } = useFieldArray({
      control,
      name,
    });
    const navigate = useNavigate();
    const location = useLocation();
    const {
      courseId: UrlFetchedCourseId,
      schoolName,
      course_name,
      grade_id,
      grade,
      component_id,
      components,
      volume_id,
      volume,
    } = useParams();
    const { schoolData, branchData } = useSelector(selectSchoolData);
    const {
      schoolId,
      branchId,
      user_profile_id: teacherID,
      role,
    } = useSelector(selectUser);
    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    const {
      isLoading: loadingCourses,
      refetch: refetchCourseData,
      isRefetching: refetchLoadingCourses,
    } = useGet({
      baseURL: COURSE_CODE_SERVICE,
      url: `course-code-service/courses/course-content-listing/${selectedCourseObj}/?school_id=${role.name === USER_TYPE.SCHOOL_ADMIN || role.name === USER_TYPE.TEACHER ? schoolData?.id : branchData?.school_data?.id}`,
      onSuccess: (resp: any) => {
        setCourseDetails(resp?.data?.response?.course_chapters);
        if (resp?.data?.response?.course_chapters) {
          setValue(
            'CourseDetails',
            JSON.parse(JSON.stringify(resp?.data?.response?.course_chapters))
          );
        }

        setValue('course_table_id', resp?.data?.response?.id);
        setCourseId(resp?.data?.response?.id);

        setUrlCourseId(resp?.data?.response?.course_id);
        setValue('course_id', resp?.data?.response?.course_id);

        resp?.data?.response?.course_chapters?.forEach(
          (chapter: any, chaptInd: number) => {
            chapter?.visible_lessons?.forEach(
              (vlesson: any, lindex: number) => {
                setValue(`chapter_${chaptInd}_lesson_${lindex}.isTrue`, false);
                vlesson.pages?.forEach((page: any, pageIndex: number) => {
                  setValue(
                    `chapter_${chaptInd}_lesson_${lindex}_page_${pageIndex}.isTrue`,
                    false
                  );
                });
              }
            );
          }
        );

        if (
          !isChangeCourse &&
          storedAssignmentData?.courseCheckboxArray.length !== 0
        ) {
          storedAssignmentData.courseCheckboxArray.forEach((key: any) => {
            setValue(`${Object.keys(key)[0]}.isTrue`, true);
          });
        }

        if (
          mode === ASSIGNMENT_MODE.NAVIGATE &&
          storedAssignmentData?.courseCheckboxArray.length === 0
        ) {
          const chapters = resp?.data?.response?.course_chapters;
          setValue(`${selectedLesson}`, { isTrue: true });
          if (selectedLesson && selectedLesson.split('_').length === 4) {
            const selectedChapterIndex = Number(selectedLesson?.split('_')[1]);
            const selectedLessonIndex = Number(selectedLesson?.split('_')[3]);
            const pagesLengthInLesson =
              chapters[selectedChapterIndex].visible_lessons[
                selectedLessonIndex
              ]?.pages.length;
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < pagesLengthInLesson; i++) {
              setValue(
                `chapter_${selectedChapterIndex}_lesson_${selectedLessonIndex}_page_${i}`,
                { isTrue: true }
              );
            }
          }
          setMode(ASSIGNMENT_MODE.DEFAULT);
        }
      },
      enabled: false,
    });
    const storedAssignmentData = useSelector(getAssignmentData);
    const [courseId, setCourseId] = useState('');
    const [urlCourseID, setUrlCourseId] = useState<number>(-1);

    useEffect(() => {
      if (Number(selectedCourseObj)) {
        // eslint-disable-next-line array-callback-return
        refetchCourseData();
        CourseDetails?.forEach((chapter: any, chaptInd: number) => {
          chapter?.visible_lessons?.forEach((vlesson: any, lindex: number) => {
            setValue(`chapter_${chaptInd}_lesson_${lindex}.isTrue`, undefined);
            vlesson.pages?.forEach((page: any, pageIndex: number) => {
              setValue(
                `chapter_${chaptInd}_lesson_${lindex}_page_${pageIndex}.isTrue`,
                undefined
              );
            });
          });
        });
      }
    }, [selectedCourseObj]);

    useEffect(() => {
      if (
        role.name === USER_TYPE.SCHOOL_ADMIN ||
        role.name === USER_TYPE.TEACHER
      ) {
        setValue('school_id', schoolData.school_id);
      } else {
        setValue('school_id', branchData?.school_data?.id);
      }
    }, [schoolData]);

    useEffect(() => {
      setValue('CourseDetails', JSON.parse(JSON.stringify(CourseDetails)));
    }, [CourseDetails]);

    const { isLoading, refetch: refetchData } = useGet({
      baseURL: SCHOOL_SERVICE,
      url: `schools-service/school-classes/?limit=1000&school_id=${schoolId}${role.name === USER_TYPE.BRANCH_ADMIN && branchData?.id ? `&branch_id=${branchData?.id}` : ``}`,
      onSuccess: (resp: any) => {
        const accData = resp?.data?.response?.results;
        const tempClassData: { label: string; value: string; id: number }[] =
          [];
        if (accData?.length) {
          accData.forEach((ele: any) => {
            tempClassData.push({
              label: ele.name,
              value: ele.name,
              id: ele.id,
            });
          });
        }
        tempClassData.sort((a: any, b: any) => a.value.localeCompare(b.value));
        setClasses(tempClassData);
      },
      onError: ({ response }: any) => {},
    });

    const { isLoading: studentLoading, mutate: mutatePostData } = usePost({
      baseURL: SCHOOL_SERVICE,
      url: `schools-service/school-classes/teacher/assigned-class`,
      onSuccess: (resp: any) => {
        const accData = resp?.data?.response;
        const tempClassData: { label: string; value: string; id: number }[] =
          [];
        if (accData?.length) {
          accData.forEach((ele: any) => {
            tempClassData.push({
              label: ele.name,
              value: ele.name,
              id: ele.class_id,
            });
          });
        }
        tempClassData.sort((a: any, b: any) => a.value.localeCompare(b.value));
        setClasses(tempClassData);
      },
      onError: ({ response }: any) => {},
    });

    const { isLoading: loadingStudentIdS } = useGet({
      baseURL: USER_SERVICE,
      url: `users-service/students/assigned/?limit=2000&${branchId ? `branch_id=${branchId}&` : ''}${schoolId ? `school_id=${role.name === USER_TYPE.SCHOOL_ADMIN || role.name === USER_TYPE.TEACHER ? schoolId : branchData?.school_data?.id}` : ''}${ClassId && ClassId !== -1 ? `&class_id=${ClassId}` : ''}`,
      onSuccess: (resp: any) => {
        const accData = resp?.data?.response;
        const respData = accData?.results;
        const tempIdLots: {
          label: string;
          value: string;
          id: number;
          user_id: number;
        }[] = [];
        if (respData?.length) {
          respData.forEach((ele: any) => {
            tempIdLots.push({
              label: `${ele.first_name} ${ele.last_name}`,
              value: `${ele.first_name} ${ele.last_name}`,
              id: ele.id,
              user_id: ele.user_id_id,
            });
          });
        }
        setValue('studentCheckboxList', [...tempIdLots]);
        setIdLots([...tempIdLots]);
      },
      enabled: !!(typeValue === 'Student' && ClassId !== -1),
    });

    const { isLoading: groupListLoading } = useGet({
      baseURL: USER_SERVICE,
      url: `users-service/groups-list/?limit=100&offset=0`,
      onSuccess: (resp: any) => {
        const accData = resp?.data?.response;
        const respData = accData?.results;
        const groupIdLots: {
          id: number;
          label: string;
          value: string;
          school_id: number;
        }[] = [];
        if (respData?.length) {
          respData.forEach((ele: any) =>
            groupIdLots.push({
              id: ele.id,
              label: `${ele.group_name}`,
              value: `${ele.group_name}`,
              school_id: ele.school_id,
            })
          );
        }
        setGroupList([...groupIdLots]);
      },
      enabled: typeValue === 'My Group',
    });

    const navigatToPreview = (
      chapterId: string,
      lessonId: number,
      urlCourseId: number,
      urlLessonId: number,
      chapterIndex: number,
      lessonIndex: number,
      pageName: string,
      contentUrl: string,
      page_number: number,
      pageIndex: number
    ) => {
      navigate(`/${schoolNameInURL}/course-preview`, {
        state: {
          courseId,
          chapterId,
          lessonId,
          urlCourseId,
          urlLessonId,
          chapterIndex,
          lessonIndex,
          pageIndex,
          assignButton: {
            grade: watch('select_grade'),
            grade_id: watch('select_grade_id'),
            components: watch('select_components'),
            component_id: watch('select_components_id'),
            volume: watch('select_volume'),
            volume_id: watch('select_volume_id'),
            course_name: watch('select_course'),
            courses_id: watch('select_course_id'),
          },
          isDueDatedExceeded: false,
          contentUrl,
          pageNumber: page_number,
          identifire: selectedLesson
            ? `/${schoolName}/assignment/create-assignment/${UrlFetchedCourseId}/${selectedLesson}/${course_name}/${grade_id}/${grade}/${component_id}/${components}/${volume_id}/${volume}`
            : `/${schoolName}/assignment/create-assignment/`,
        },
      });
    };

    const shouldShowError = watch('checkboxError');
    const StudentCheckboxError = watch('StudentCheckboxError');

    const onLessonClick = (e: any) => {
      const selectedBox = e?.target?.name;
      const selectedChapterIndex = selectedBox.split('_')[1];
      const selectedLessonIndex = selectedBox.split('_')[3].split('.')[0];
      const pagesLengthInLesson =
        CourseDetails[selectedChapterIndex]?.visible_lessons[
          selectedLessonIndex
        ]?.pages.length;
      if (e?.target?.value === true) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < pagesLengthInLesson; i++) {
          setValue(
            `chapter_${selectedChapterIndex}_lesson_${selectedLessonIndex}_page_${i}`,
            { isTrue: true }
          );
        }
      } else {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < pagesLengthInLesson; i++) {
          setValue(
            `chapter_${selectedChapterIndex}_lesson_${selectedLessonIndex}_page_${i}`,
            { isTrue: false }
          );
        }
      }
    };

    const onPageClick = (e: any) => {
      const selectedBox = e?.target?.name;
      const selectedChapterIndex = selectedBox.split('_')[1];
      const selectedLessonIndex = selectedBox.split('_')[3]; // .split('.')[0];
      const pagesLengthInLesson =
        CourseDetails[selectedChapterIndex]?.visible_lessons[
          selectedLessonIndex
        ]?.pages.length;
      if (e?.target?.value === false) {
        setValue(
          `chapter_${selectedChapterIndex}_lesson_${selectedLessonIndex}`,
          { isTrue: false }
        );
      } else {
        let isAllTrueExceptThisCheckbox = true;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < pagesLengthInLesson; i++) {
          const retrivedVal = getValues(
            `chapter_${selectedChapterIndex}_lesson_${selectedLessonIndex}_page_${i}`
          );
          if (
            retrivedVal &&
            (retrivedVal.isTrue === false || retrivedVal.isTrue === undefined)
          ) {
            isAllTrueExceptThisCheckbox = false;
          }
        }
        if (isAllTrueExceptThisCheckbox === true) {
          setValue(
            `chapter_${selectedChapterIndex}_lesson_${selectedLessonIndex}`,
            { isTrue: true }
          );
        }
      }
    };

    const setValuesInStore = () => {
      const courseCheckboxArray: any = [];
      CourseDetails?.forEach((chapter: any, chaptInd: number) => {
        chapter?.visible_lessons?.forEach((vlesson: any, lindex: number) => {
          const returnLesson = getValues(
            `chapter_${chaptInd}_lesson_${lindex}`
          );
          if (returnLesson?.isTrue) {
            courseCheckboxArray.push({
              [`chapter_${chaptInd}_lesson_${lindex}`]: { isTrue: true },
            });
          }
          vlesson.pages?.forEach((page: any, pageIndex: number) => {
            const returnPages = getValues(
              `chapter_${chaptInd}_lesson_${lindex}_page_${pageIndex}`
            );
            if (returnPages?.isTrue) {
              courseCheckboxArray.push({
                [`chapter_${chaptInd}_lesson_${lindex}_page_${pageIndex}`]: {
                  isTrue: true,
                },
              });
            }
          });
        });
      });

      const assignmentData = {
        assignment_name: getValues('assignment_name'),
        assignment_start_date: getValues('assignment_start_date'),
        assignment_due_date: getValues('assignment_due_date'),
        select_course: getValues('select_course'),
        select_course_id: selectedCourseObj,
        select_grade: getValues('select_grade'),
        select_components: getValues('select_components'),
        select_volume: getValues('select_volume'),
        CourseDetails,
        select_type: getValues('select_type'),
        select_class: getValues('select_class'),
        select_class_array: getValues('select_class_array'),
        typeValue,
        GroupList,
        Classes,
        idLots,
        single_access: getValues('single_access'),
        block_after_due_date: getValues('block_after_due_date'),
        comments: getValues('comments'),
        file: getValues('file'),
        studentCheckbox: getValues('studentCheckbox'),
        courseCheckboxArray,
        studentCheckboxList: getValues('studentCheckboxList'),
        assignment_type: getValues('assignment_type'),
        select_components_id: getValues('select_components_id'),
        select_grade_id: getValues('select_grade_id'),
        select_volume_id: getValues('select_volume_id'),
        selected_class_id: getValues('selected_class_id'),
        course_table_id: getValues('course_table_id'),
        course_id: getValues('course_id'),
        GradeArray: getValues('GradeArray'),
      };
      dispatch(setAssignmentData(assignmentData));
    };

    useEffect(() => {
      if (location.state?.prevPage) {
        if (storedAssignmentData?.courseCheckboxArray.length) {
          storedAssignmentData?.courseCheckboxArray.forEach((key: any) => {
            setValue(Object.keys(key)[0], Object.values(key)[0]);
          });
        }
        setValue('single_access', storedAssignmentData.single_access);
        setValue(
          'block_after_due_date',
          storedAssignmentData.block_after_due_date
        );
        setValue('assignment_name', storedAssignmentData.AssignmentName);
        setValue(
          'assignment_start_date',
          storedAssignmentData.AssignmentStartDate
        );
        setValue('assignment_due_date', storedAssignmentData.AssignmentDueDate);
        setValue('select_course', storedAssignmentData.SelectCourse);
        setValue('select_grade', storedAssignmentData.SelectGrade);
        setValue('select_components', storedAssignmentData.SelectComponents);
        setValue('select_volume', storedAssignmentData.SelectVolume);
        setCourseDetails(storedAssignmentData.CourseDetails);
        setValue('select_type', storedAssignmentData.select_type);
        setValue('select_class', storedAssignmentData.SelectClass);
        setValue('select_class_array', storedAssignmentData.select_class_array);
        setTypeValue(storedAssignmentData.typeValue);
        setGroupList(storedAssignmentData.GroupList);
        setClasses(storedAssignmentData.Classes);
        setIdLots(storedAssignmentData.idLots);
        setSelectedCourseObj(storedAssignmentData.select_course_id);
        setValue('comments', storedAssignmentData.comments);
        setValue('file', storedAssignmentData.file);
        setValue('studentCheckbox', storedAssignmentData.studentCheckbox);
        setValue(
          'studentCheckboxList',
          storedAssignmentData.studentCheckboxList
        );
        setValue('assignment_type', storedAssignmentData.assignment_type);
        setValue(
          'select_components_id',
          storedAssignmentData.select_components_id
        );
        setValue('select_grade_id', storedAssignmentData.select_grade_id);
        setValue('select_volume_id', storedAssignmentData.select_volume_id);
        setValue('selected_class_id', storedAssignmentData.selected_class_id);
        setValue('course_table_id', storedAssignmentData.course_table_id);
        setValue('course_id', storedAssignmentData.course_id);
        setValue('GradeArray', storedAssignmentData.GradeArray);
      }
    }, []);

    const handleOnChange = (val: any) => {
      setTypeValue(val.target.value);
      setValue('select_type', val.target.value);
      setValue('assignment_type', selObj[val.target.value]);
      setValue('selected_class_id', []);
      setValue('select_class', '');
      setValue('StudentCheckboxError', undefined);
      setValue('select_class_array', []);
      if (role.name === USER_TYPE.TEACHER) {
        mutatePostData({
          teacher_id: teacherID,
        });
      } else {
        refetchData();
      }
      clearSelectedStuents();
      setClassId(-1);
      setIdLots([]);
    };

    const handleOnChangeClass = (val: any) => {
      setValue('select_class', val.target.value);
      if (val?.target?.value) {
        const compareArray =
          typeValue === SELECT_TYPE.MYGROUP ? GroupList : Classes;
        const classId = compareArray.filter(
          (ele: any) => val.target.value === ele.value
        )[0].id;
        setClassId(classId);
        setValue('StudentCheckboxError', undefined);
        setValue('selected_class_id', [classId]);
        clearSelectedStuents();
      }
    };

    const handleOnChangeClassArray = (event: any) => {
      const selectClassArray = event?.target?.value;
      setValue('select_class_array', selectClassArray);
      const selectedClassId = Classes.filter((ele: { label: string }) =>
        selectClassArray.includes(ele.label)
      ).map((ele: { id: string }) => ele.id);
      setValue('selected_class_id', selectedClassId);
    };

    const bytesToMb = (fileSizeBytes: number) => {
      const fileSizeMB = fileSizeBytes / 1024 ** 2;
      return fileSizeMB;
    };

    const onChange = (files: FileList | File[]) => {
      if (files.length > 0) {
        const fileData = Array.from(files).map((item: File, index: number) => ({
          sr_no:
            watch('file') && watch('file').length > 0
              ? watch('file').length + (index + 1)
              : index + 1,
          document_name: item.name,
          file: item,
          document_ting: `${item.name}_${index}`,
          sizeInMb: bytesToMb(item.size),
          type: item.type,
        }));
        if (fileData && fileData[0]) {
          if (fileData[0].sizeInMb > 500) {
            setValue('fileError', 'File size excedding limit');
            setError('fileError', {
              type: 'size',
              message: 'File size excedding limit',
            });
          } else if (!AllowerdTypes.includes(fileData[0].type)) {
            setValue('fileError', 'File Type is not supported');
            setError('fileError', {
              type: 'size',
              message: 'File Type is not supported',
            });
          } else {
            setValue('fileError', '');
            clearErrors('fileError');
            setValue('file', fileData[0]);
          }
        }
      }
    };

    const clearSelectedStuents = () => {
      idLots?.forEach((ele: any, ind: number) => {
        resetField(`studentCheckbox.${ind}.isTrue`);
      });
    };

    const isFileError = watch('fileError') !== '';
    return (
      <>
        <>
          <div
            className={`w-full h-max p-6 overflow-auto ${shouldShowError ? `border-red-500 border border-solid` : ``}`}
          >
            {(loadingCourses || refetchLoadingCourses) && (
              <div className="h-4 relative">
                {' '}
                <Loader size={30} />{' '}
              </div>
            )}
            {!(loadingCourses || refetchLoadingCourses) &&
              selectedCourseObj !== 0 &&
              CourseDetails?.map((chapter: any, chaptInd: number) => (
                <React.Fragment key={chaptInd}>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                      sx={{
                        backgroundColor: '#BECCFF',
                      }}
                    >
                      <div className="font-bold">{chapter.chapter_name}</div>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className="w-full h-max">
                        <div className="space-x-6 items-center">
                          <div>
                            {chapter?.visible_lessons?.map(
                              (vlesson: any, lindex: number) => (
                                <React.Fragment key={lindex}>
                                  <div className="relative hover:bg-slate-200 mt-4">
                                    <CheckBox
                                      key="myCheckbox"
                                      control={control}
                                      label={vlesson.lesson_name}
                                      parentLabelClass="font-bold"
                                      {...register(
                                        `chapter_${chaptInd}_lesson_${lindex}.isTrue`,
                                        {
                                          onChange: (e) => {
                                            onLessonClick(e);
                                          },
                                        }
                                      )}
                                    />
                                    <Button
                                      size="large"
                                      type="button"
                                      sx={{
                                        position: 'absolute',
                                        right: '0px',
                                        top: '2px',
                                        fontWeight: '400',
                                      }}
                                      onClick={() => {
                                        setValuesInStore();
                                        navigatToPreview(
                                          chapter.chapter_id,
                                          vlesson.id,
                                          urlCourseID,
                                          vlesson.lesson_id,
                                          chaptInd,
                                          lindex,
                                          '',
                                          vlesson.content_url,
                                          -1,
                                          -1
                                        );
                                      }}
                                    >
                                      Preview
                                    </Button>
                                  </div>
                                  <div className="ml-4">
                                    {vlesson.pages?.map(
                                      (page: any, pageIndex: number) => (
                                        <div
                                          className="relative hover:bg-slate-200 mt-3"
                                          key={pageIndex}
                                        >
                                          <CheckBox
                                            control={control}
                                            label={page.name}
                                            {...register(
                                              `chapter_${chaptInd}_lesson_${lindex}_page_${pageIndex}.isTrue`,
                                              {
                                                onChange: (e) => {
                                                  onPageClick(e);
                                                },
                                              }
                                            )}
                                          />
                                          <Button
                                            size="large"
                                            type="button"
                                            className="absolute right-0 top-2"
                                            onClick={() => {
                                              setValuesInStore();
                                              navigatToPreview(
                                                chapter.chapter_id,
                                                vlesson.id,
                                                urlCourseID,
                                                vlesson.lesson_id,
                                                chaptInd,
                                                lindex,
                                                page.name,
                                                vlesson.content_url,
                                                page.page_number,
                                                pageIndex
                                              );
                                            }}
                                            sx={{
                                              position: 'absolute',
                                              right: '0px',
                                              top: '1px',
                                              fontWeight: '400',
                                            }}
                                          >
                                            Preview
                                          </Button>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </React.Fragment>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </React.Fragment>
              ))}
            {shouldShowError ? (
              <div className="text-red-500 -500 text-sm">
                {' '}
                Please select lesson{' '}
              </div>
            ) : null}
          </div>
        </>
        <>
          <div className="w-full h-max p-6 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 content-center gap-y-3 md:gap-x-6 pb-4">
              <div>
                <Select
                  control={control}
                  required={true}
                  name="select_type"
                  label="Select Type"
                  dataArray={[
                    { label: SELECT_TYPE.CLASS, value: SELECT_TYPE.CLASS },
                    { label: SELECT_TYPE.MYGROUP, value: SELECT_TYPE.MYGROUP },
                    { label: SELECT_TYPE.STUDENT, value: SELECT_TYPE.STUDENT },
                  ]}
                  onChange={(val: any) => handleOnChange(val)}
                />
              </div>
              <div className={typeValue === SELECT_TYPE.CLASS ? '' : 'hidden'}>
                <Select
                  ismultiple={true}
                  control={control}
                  required={true}
                  name="select_class_array"
                  label="Select Class"
                  dataArray={Classes}
                  value={watch('select_class_array') || []}
                  onChange={(val: any) => handleOnChangeClassArray(val)}
                />
              </div>
              <div className={typeValue !== SELECT_TYPE.CLASS ? '' : 'hidden'}>
                <Select
                  control={control}
                  required={true}
                  name="select_class"
                  label={
                    typeValue === SELECT_TYPE.MYGROUP
                      ? 'Select Group'
                      : 'Select Class'
                  }
                  dataArray={
                    typeValue === SELECT_TYPE.MYGROUP ? GroupList : Classes
                  }
                  onChange={(val: any) => handleOnChangeClass(val)}
                />
              </div>
            </div>
            {watch('select_class') &&
              typeValue === 'Student' &&
              idLots?.length === 0 && (
                <div className="text-red-600 text-xs">
                  {' '}
                  No student present in the class{' '}
                </div>
              )}
            <div
              className={`relative grid sm:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 max-h-60 overflow-y-auto ${typeValue === 'Student' && idLots.length !== 0 ? 'border' : ''} border-black ${StudentCheckboxError ? `border-red-500 border border-solid` : ``}`}
            >
              {typeValue === 'Student' &&
                idLots.map((ele: any, ind: number) => (
                  <div key={ind}>
                    <CheckBox
                      control={control}
                      label={ele.label}
                      {...register(`studentCheckbox.${ind}.isTrue`)}
                    />
                  </div>
                ))}
            </div>
            <div>
              {StudentCheckboxError ? (
                <div className="bottom-[-40px] text-red-500">
                  {' '}
                  <span> Please select students </span>{' '}
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 content-center gap-y-3 md:gap-x-6 py-4 border border-black my-4">
              <CheckBox
                control={control}
                name="single_access"
                label="Single Access"
              />
              <CheckBox
                control={control}
                name="block_after_due_date"
                label="Block Access after Due Date"
              />
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 content-center gap-y-3 md:gap-x-6">
              <div>
                <h4 className="text-base text-black font-bold pb-4">
                  Attach Your Files
                </h4>
                <div className="min-h-[100px]">
                  <FileSelect
                    ref={fileRef}
                    onChange={onChange}
                    parentContainerClass="h-[100px]"
                  />
                  <div> {watch('file') && watch('file').document_name} </div>
                  <div>
                    <div className="text-sm">File max size 500MB.</div>
                    <div className="text-sm">
                      File type XLSX, PPT,MP4, PNG,AVI,txt, html, MoV, ODP, PDF,
                      Docx, JPEG
                    </div>
                  </div>
                  {isFileError && (
                    <div className="text-red-500">{watch('fileError')}</div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-base text-black font-bold pb-4">
                  Comments
                </h4>
                <TextArea
                  customClass="bg-white"
                  control={control}
                  name="comments"
                />
              </div>
            </div>
          </div>
        </>
      </>
    );
  }
);

export default AccordianCheckbox;
