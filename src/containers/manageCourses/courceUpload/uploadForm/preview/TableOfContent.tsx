import RouteLayout from '@layout/routeLayout';
import PageTitle from '@shared/pageTitle';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Loader from '@shared/loader';
import { useGet } from '@shared/api/useApi';
import { useState, useEffect } from 'react';

function Volume() {
  const [courseFullNameDetails, setCourseFullNameDetails] = useState<any>({});
  const [courseDetails, setCourseDetails] = useState<any>([]);
  const [courseStaticPage, setCourseStaticPage] = useState<any>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const { courseId = '' } = useParams();

  const { isLoading: volumesLoading, refetch: volumeFetch, isRefetching: refetchVolume } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `/course-code-service/courses/${courseId}/`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      setCourseFullNameDetails({ id: respData?.id, course_id: respData?.course_id, name: respData?.name });
      if (respData?.courses_chapter?.length || respData?.course_static_pages?.length) {
        setCourseDetails(respData?.courses_chapter);
        setCourseStaticPage(respData?.course_static_pages);
      }
    },
    onError: () => { },
    enabled: false
  });

  useEffect(() => {
    if (courseId) {
      volumeFetch();
    }
  }, [courseId]);

  const navigatToPreview = (chapterId: string, lessonId: number, urlCourseId: number, urlLessonId: number, contentUrl: string) => {
    // const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    navigate(`/manage-courses/upload-course/course-preview`,
      {
        state: {
          courseId,
          chapterId,
          lessonId,
          urlCourseId,
          urlLessonId,
          assignButton: false,
          isDueDatedExceeded: false,
          contentUrl
        }
      });
  };

  return (
    <div>
      <RouteLayout
        navBack={true}
      >
        <PageTitle title={courseFullNameDetails?.name} customStyle={{ marginTop: '10px' }} />
        <div className="bg-white p-5 border border-[var(--linegray)] rounded-lg mt-4">
          <div className="mb-5"> Table of content </div>
          {
            (!volumesLoading && !refetchVolume)
              ? courseDetails?.length
                ? courseDetails?.map((item: any, i: number) => (
                  <Accordion
                    key={i}
                    disableGutters={true}
                    sx={{
                      marginBottom: '17px',
                      '.MuiAccordionSummary-root': {
                        backgroundColor: 'var(--light-accent)',
                        border: '1px solid var(--linegray)',
                        fontSize: '14px',
                        minHeight: '34px'
                      },
                      '.MuiAccordion-root': {
                        border: '1px solid var(--linegray)',
                        borderRadius: '3px'
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id={`panel${i + 1}a-header`}
                      sx={{ '.MuiAccordionSummary-content': {
                        margin: '0px'
                      } }}
                    >
                      <div className="flex grow items-center">
                        {item?.chapter_name}
                      </div>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div>
                        {
                        item?.lesson_chapter?.map((ele: any, ind: any) => (
                          <div key={ind} className="w-full flex items-center mb-2">
                            <span
                              role="presentation"
                              className="grow underline cursor-pointer text-sm font-medium"
                              onClick={() => navigatToPreview(item?.chapter_id, ele?.id, courseFullNameDetails.course_id, ele?.lesson_id, ele?.content_url)}
                            >
                              {ele?.lesson_name}
                            </span>
                          </div>))
                      }
                      </div>
                    </AccordionDetails>
                  </Accordion>
                )) : courseStaticPage?.length ? (
                  <div>
                    {
                        courseStaticPage?.map((ele: any) => (
                          <div className="w-full flex items-center mb-2">
                            <span
                              role="presentation"
                              className="grow underline cursor-pointer text-sm font-medium"
                              onClick={() => {
                                const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
                                navigate(`/${schoolNameInURL}/static-page-preview`, {
                                  state: {
                                    staticUrl: ele?.access_link
                                  }
                                });
                              }}
                            >
                              {ele?.course}
                            </span>
                          </div>
                        ))
                      }
                  </div>
                ) : (
                  <div className="text-center">
                    No data found
                  </div>
                ) : (
                  <div className="h-32">
                    <Loader />
                  </div>
              )
            }
        </div>
      </RouteLayout>
    </div>
  );
}

export default Volume;
