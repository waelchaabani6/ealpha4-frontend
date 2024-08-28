/* eslint-disable react/jsx-curly-newline */
/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable implicit-arrow-linebreak */
import RouteLayout from '@layout/routeLayout';
import PageTitle from '@shared/pageTitle';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Loader from '@shared/loader';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { useGet } from '@shared/api/useApi';
import { useState, useEffect } from 'react';

function Volume() {
  const [courseFullNameDetails, setCourseFullNameDetails] = useState<any>({});
  const [courseDetails, setCourseDetails] = useState<any>([]);
  const [courseStaticPage, setCourseStaticPage] = useState<any>([]);
  const { schoolId, role } = useSelector(selectUser);

  const navigate = useNavigate();
  const location = useLocation();
  const { state: locationState } = useLocation();

  const { courseId = '', schoolName } = useParams();

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
          short_name: respData?.name.split(' -')[0],
          grade: respData?.name.split(' - ')[1],
        });
        setCourseDetails(respData?.course_chapters);
        setCourseStaticPage(respData?.course_static_pages);
      }
    },
    onError: () => {},
    enabled: false,
  });

  useEffect(() => {
    if (courseId) {
      volumeFetch();
    }
  }, [courseId]);

  const navigatToPreview = (
    chapterId: string,
    lessonId: number,
    urlCourseId: number,
    urlLessonId: number,
    contentUrl: string,
    pages: any,
    shortName: string,
    grade: string
  ) => {
    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    navigate(`/${schoolNameInURL}/course-preview`, {
      state: {
        courseId,
        chapterId,
        lessonId,
        urlCourseId,
        urlLessonId,
        assignButton: false,
        isDueDatedExceeded: !!locationState?.exitButton,
        moduleName: !locationState?.exitButton ? 'mycourse' : '',
        contentUrl,
        pageNumber:
          pages?.length > 0
            ? pages?.map((obj: any) => obj?.page_number).join(',')
            : '1',
        shortName,
        grade,
      },
    });
  };

  if (volumesLoading) {
    return (
      <div className="h-32">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <RouteLayout
        navBack={true}
        state={{
          page: location?.state?.pagination
            ? location?.state?.pagination
            : null,
        }}
        path={location?.state?.path || ``}
      >
        <PageTitle title={courseFullNameDetails?.name} />

        <div className="bg-white p-5 border border-[var(--linegray)] rounded-lg mt-4">
          <div className="mb-5"> Table of content</div>
          {!volumesLoading && !refetchVolume ? (
            courseDetails?.length ? (
              courseDetails?.map((item: any, i: number) => (
                <Accordion
                  key={i}
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
                  </AccordionSummary>
                  <AccordionDetails>
                    <div>
                      {item?.visible_lessons?.map((ele: any, ind: any) => (
                        <div
                          key={ind}
                          className="w-full flex items-center mb-2"
                        >
                          <span
                            role="presentation"
                            className="grow underline cursor-pointer text-sm font-medium"
                            onClick={() =>
                              navigatToPreview(
                                item?.chapter_id,
                                ele?.id,
                                courseFullNameDetails.course_id,
                                ele?.lesson_id,
                                ele?.content_url,
                                ele?.pages,
                                courseFullNameDetails?.short_name,
                                courseFullNameDetails?.grade
                              )
                            }
                          >
                            {ele?.lesson_name}
                          </span>
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
