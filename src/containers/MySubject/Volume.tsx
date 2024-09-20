/* eslint-disable operator-linebreak */
/* eslint-disable react/jsx-curly-newline */
/* eslint-disable comma-dangle */
/* eslint-disable implicit-arrow-linebreak */
import RouteLayout from '@layout/routeLayout';
import PageTitle from '@shared/pageTitle';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@component/button/button';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useGet, usePatch } from '@shared/api/useApi';
import toast from '@shared/toast';
import Loader from '@shared/loader';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { useEffect, useState } from 'react';

function Volume() {
  const [courseFullNameDetails, setCourseFullNameDetails] = useState<any>({});
  const [courseDetails, setCourseDetails] = useState<any>([]);
  const [courseStaticPage, setCourseStaticPage] = useState<any>([]);
  const { schoolId, role, branchId } = useSelector(selectUser);

  const navigate = useNavigate();
  const location = useLocation();

  const { courseId = '', schoolName, grade, name } = useParams();

  const {
    isLoading: volumesLoading,
    refetch: volumeFetch,
    isRefetching: refetchVolume,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/course-content-listing/${courseId}/?school_id=${schoolId}&role=${role.name}`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      if (
        respData?.course_chapters?.length ||
        respData?.course_static_pages?.length
      ) {
        setCourseFullNameDetails({
          id: respData?.id,
          course_id: respData?.course_id,
          name: respData?.name,
        });
        setCourseDetails(respData?.course_chapters);
        setCourseStaticPage(respData?.course_static_pages);
      }
    },
    onError: () => {},
    enabled: false,
  });

  const { isLoading: loadingLessonVisible, mutate: mutateLessonVisible } =
    usePatch({
      baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
      url: `course-code-service/courses/course-content-hide/${courseId}/`,
      onSuccess: (response: any) => {
        volumeFetch();
        toast('success', 'Updated successfully');
      },
      onError: ({ response }: any) => {
        volumeFetch();
        toast('error', response?.statusText || 'Error');
      },
    });

  const hideLessonHandler = (
    chapterId: string,
    courseID: number,
    lessonId: number,
    lessonHide: boolean
  ) => {
    const payload = {
      school_id: schoolId,
      chapter_id: chapterId,
      course_id: courseID,
      lesson_id: [`${lessonId}`],
      is_visible: !lessonHide,
    };
    mutateLessonVisible(payload);
  };

  const hideAllLessonHandler = (
    chapterId: string,
    courseID: number,
    lessonId: any
  ) => {
    const lessonIds = lessonId?.map((obj: any) => obj.lesson_id);
    const isVisible = lessonId?.some((obj: any) => obj?.status === false);
    const payload = {
      school_id: schoolId,
      chapter_id: chapterId,
      course_id: courseID,
      lesson_id: lessonIds,
      is_visible: isVisible,
    };
    mutateLessonVisible(payload);
  };

  const navigatToPreview = (
    chapterMainId: number,
    chapterId: string,
    lessonId: number,
    urlCourseId: number,
    urlLessonId: number,
    chapterIndex: number,
    lessonIndex: number,
    contentUrl: string,
    shortName: string,
    grade: string
  ) => {
    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    console.log('grade', grade);
    navigate(`/${schoolNameInURL}/course-preview`, {
      state: {
        ...location?.state,
        courseId,
        chapterMainId,
        chapterId,
        lessonId,
        urlCourseId,
        urlLessonId,
        chapterIndex,
        lessonIndex,
        assignButton: location.state,
        isDueDatedExceeded: false,
        moduleName: 'mycourse',
        contentUrl,
        shortName,
        grade: grade,
      },
    });
  };

  const navigatToAssign = (chapterIndex: number, lessonIndex: number) => {
    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    const {
      // grade,
      grade_id,
      components,
      component_id,
      volume,
      volume_id,
      course_name,
      courses_id,
    } = location.state;
    navigate(
      `/${schoolNameInURL}/assignment/create-assignment/${courses_id}/chapter_${chapterIndex}_lesson_${lessonIndex}/${course_name}/${grade_id}/${grade}/${component_id}/${components}/${volume_id}/${volume}`
    );
  };

  useEffect(() => {
    if (courseId) {
      volumeFetch();
    }
  }, [courseId]);

  console.log('location', location.state);

  return (
    <div>
      <RouteLayout
        navBack={true}
        state={location?.state}
        path={location?.state?.path || ``}
      >
        <PageTitle
          title={courseFullNameDetails?.name}
          customStyle={{ marginTop: '10px' }}
        />
        <div className="bg-white p-5 border border-[var(--linegray)] rounded-lg mt-4">
          <div className="mb-5"> Table of content</div>
          {!volumesLoading && !refetchVolume ? (
            courseDetails?.length ? (
              courseDetails?.map((item: any, i: number) => (
                <Accordion
                  disableGutters={true}
                  sx={{
                    marginBottom: '17px',
                    '.MuiAccordionSummary-root': {
                      backgroundColor: 'var(--light-accent)',
                      border: '1px solid var(--linegray)',
                      fontSize: '14px',
                      minHeight: '34px',
                    },
                    '.MuiAccordion-root': {
                      border: '1px solid var(--linegray)',
                      borderRadius: '3px',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id={`panel${i + 1}a-header`}
                    sx={{
                      '.MuiAccordionSummary-content': {
                        margin: '0px',
                      },
                    }}
                  >
                    <div className="flex grow items-center">
                      {item?.chapter_name}
                    </div>
                    <div className="px-4">
                      <Button
                        type="button"
                        size="small"
                        onClick={() =>
                          hideAllLessonHandler(
                            item?.chapter_id,
                            courseFullNameDetails?.id,
                            item?.visible_lessons
                          )
                        }
                      >
                        {!item?.visible_lessons.some(
                          (obj: any) => obj?.status === false
                        )
                          ? 'Unhide'
                          : 'Hide'}
                      </Button>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="hover:bg-gray-100 transition-all duration-300 rounded-md">
                      {item?.visible_lessons?.map((ele: any, index: any) => (
                        <div className="w-full flex items-center mb-2">
                          <span
                            role="presentation"
                            className="grow underline cursor-pointer text-sm font-medium"
                            onClick={() =>
                              navigatToPreview(
                                item?.id,
                                item?.chapter_id,
                                ele?.id,
                                courseFullNameDetails.course_id,
                                ele?.lesson_id,
                                i,
                                index,
                                ele?.content_url,
                                name,
                                grade
                              )
                            }
                          >
                            {ele?.lesson_name}
                          </span>
                          <div className="px-4">
                            <Button
                              type="button"
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                hideLessonHandler(
                                  item?.chapter_id,
                                  courseFullNameDetails?.id,
                                  ele?.lesson_id,
                                  ele?.status
                                )
                              }
                            >
                              {ele?.status ? 'Unhide' : 'Hide'}
                            </Button>
                          </div>
                          <Button
                            type="button"
                            className=""
                            onClick={() => navigatToAssign(i, index)}
                            size="small"
                          >
                            Assign
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : courseStaticPage?.length ? (
              <div>
                {courseStaticPage?.map((ele: any) => (
                  <div className="w-full flex items-center mb-2">
                    <span
                      role="presentation"
                      className="grow underline cursor-pointer text-sm font-medium"
                      onClick={() => {
                        const schoolNameInURL = decodeURIComponent(
                          location.pathname.split('/')[1]
                        );
                        navigate(`/${schoolNameInURL}/static-page-preview`, {
                          state: {
                            staticUrl: ele?.access_link,
                          },
                        });
                      }}
                    >
                      {ele?.course}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">No data found</div>
            )
          ) : (
            <div className="h-32">
              <Loader />
            </div>
          )}
        </div>
      </RouteLayout>
    </div>
  );
}

export default Volume;
