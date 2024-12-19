/* eslint-disable linebreak-style */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
/* eslint-disable operator-linebreak */
import Logo2 from '@images/logo2.svg';
import { usePatch, usePost } from '@shared/api/useApi';
import { useState, useEffect, useRef } from 'react';
import toast from '@shared/toast';
import { USER_TYPE } from '@constants/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import RouteLayout from '@layout/routeLayout';
import Loader from '@shared/loader';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import Button from '@component/button/button';
import CoursesFilter from './CourseFilters';

const baseURL = import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL;

const CoursePreview = () => {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [resizeContent, setResizeContent] = useState([900, 1000]);
  const [actionConfirmPopup, setActionConfirmPopup] = useState(false);
  const [formObject, setFormObject] = useState<any>(null);

  const {
    schoolId,
    role,
    user_profile_id: userID,
    branchId,
    userId,
  } = useSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();
  const { state: locationState } = useLocation();

  const token = localStorage.getItem('token');

  const navigatToAssign = () => {
    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    const {
      grade,
      grade_id,
      components,
      component_id,
      volume,
      volume_id,
      course_name,
      courses_id,
    } = locationState.assignButton;
    window.location.href = `/${schoolNameInURL}/assignment/create-assignment/${courses_id}/chapter_${locationState.chapterIndex}_lesson_${locationState.lessonIndex}${locationState?.pageIndex !== undefined && locationState?.pageIndex !== -1 ? `_page_${locationState?.pageIndex}` : ''}/${course_name}/${grade_id}/${grade}/${component_id}/${components}/${volume_id}/${volume}`;
  };

  const handleFullScreenClick = () => {
    const iframe = ref.current;
    if (!iframe) {
      return;
    }
    if (document.fullscreenElement === iframe) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    } else if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
      setIsFullScreen(true);
    } else {
      // eslint-disable-next-line no-console
      console.log('Fullscreen not supported in this browser.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showIframe) {
        setIsLoading(false);
      }
    }, 2000);
    return () => {
      clearInterval(timer);
    };
  }, [showIframe]);

  useEffect(() => {
    // Data required for API calling in the coursemodule
    if (role?.name === USER_TYPE.SUPER_ADMIN) {
      onDefaultHandler();
    } else {
      onSendDataHandler();
    }
    window.addEventListener('message', receiveMessageHandler);

    return () => {
      // clearInterval(timer);
      window.removeEventListener('message', receiveMessageHandler);
    };
  }, [showIframe]);

  // API call for saving the Course Score
  const { isLoading: isLoadingMyCourse, mutate: mutateMyCourse } = usePost({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: 'course-code-service/courses/course-progress/',
    onSuccess: ({
      data: {
        response: { data },
      },
    }: any) => {
      toast('success', 'Data stored successfully');
      navigate(-1);
    },
    onError: ({ response }: any) => {
      const errorText = response?.data?.message;
      toast('error', errorText);
    },
  });

  // API call for saving the Course Score
  const { isLoading: isLoadingAssignment, mutate: mutateAssignment } = usePost({
    baseURL: import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL,
    url: 'assignments-service/assignments/progress-save/',
    onSuccess: ({
      data: {
        response: { data },
      },
    }: any) => {
      toast('success', 'Data stored successfully');
      navigate(-1);
    },
    onError: ({ response }: any) => {
      const errorText = response?.data?.message;
      toast('error', errorText);
    },
  });

  const isValidJson = (data: any) => {
    try {
      JSON.parse(data);
    } catch (e) {
      return false;
    }
    return true;
  };

  const receiveMessageHandler = (event: any) => {
    // console.log(event, '#event');
    if (typeof event?.data === 'string' && event?.data.startsWith('RESIZE:')) {
      const values = event?.data.replace('RESIZE:', '').split(';');
      // eslint-disable-next-line no-restricted-globals
      if (values.length === 2 && values.every((val: any) => !isNaN(val))) {
        setResizeContent(values.map((val: any) => parseInt(val, 10)));
      }
    }

    if (event?.data === 'PAGE_LOADED') {
      setShowIframe(true);
    }

    if (isValidJson(event?.data) && 'course_data' in JSON.parse(event?.data)) {
      //  Once the scores are received call the API to store the data.
      if (locationState.moduleName === 'mycourse') {
        let objMyCourse = {};
        if (branchId) {
          objMyCourse = {
            course_id: `${locationState?.courseId}`,
            chapter_id: `${locationState?.chapterId}`,
            lessons: `${locationState?.lessonId}`,
            course_state: JSON.parse(event?.data)?.course_data,
            created_by: `${userID}`, // userId
            updated_by: `${userID}`, // userId
            school_id: `${schoolId}`,
            user_role: `${role?.name}`,
            user_id: `${userID}`,
            branch_id: `${branchId}`,
            json_data: JSON.parse(event?.data)?.json_data,
          };
        } else {
          objMyCourse = {
            course_id: `${locationState?.courseId}`,
            chapter_id: `${locationState?.chapterId}`,
            lessons: `${locationState?.lessonId}`,
            course_state: JSON.parse(event?.data)?.course_data,
            created_by: `${userID}`, // userId
            updated_by: `${userID}`, // userId
            school_id: `${schoolId}`,
            user_role: `${role?.name}`,
            user_id: `${userID}`,
            json_data: JSON.parse(event?.data)?.json_data,
          };
        }
        mutateMyCourse(objMyCourse);
      } else if (locationState?.moduleName === 'assignment') {
        const objAssignment = {
          assign_assignment: `${locationState?.assignmentId}`,
          text_data: JSON.parse(event?.data)?.course_data,
          json_data: JSON.parse(event?.data)?.json_data,
          lesson_id: `${locationState?.urlLessonId}`,
          chapter_id: `${locationState?.chapterMainId}`,
          // page_number: `${locationState?.pageNumber}`
        };
        mutateAssignment(objAssignment);
      }
    }
  };

  // onSendDataHandler is used to send the school_id, course_id, lesson, course_id and use_role
  const onSendDataHandler = () => {
    let obj = {};
    if (locationState?.moduleName === 'assignment') {
      obj = {
        school_id: `${schoolId}`,
        course_id: `${locationState?.courseId}`,
        lesson: `${locationState?.lessonId}`,
        user_id: `${userID}`,
        user_role: `${role?.name}`,
        baseUrl: import.meta.env.VITE_APP_ASSIGNMENT_SERVICE_URL,
        moduleName: `${locationState?.moduleName}`,
        assignmentId: `${locationState?.assignmentId}`,
        urlLessonId: `${locationState?.urlLessonId}`,
        chapterMainId: `${locationState?.chapterMainId}`,
        pageNumber: `${locationState?.pageNumber}`,
        pageName: `${locationState?.pageName}`,
        scormData: JSON.stringify(locationState),
        userToken: token,
      };
    } else if (locationState?.moduleName === 'mycourse') {
      obj = {
        school_id: `${schoolId}`,
        course_id: `${locationState?.courseId}`,
        lesson: `${locationState?.lessonId}`,
        user_id: `${userID}`,
        user_role: `${role?.name}`,
        baseUrl: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
        moduleName: `${locationState?.moduleName}`,
        pageNumber: `${locationState?.pageNumber}`,
        userToken: token,
      };
    } else if (locationState?.pageNumber) {
      obj = {
        user_id: `${userID}`,
        pageNumber: `${locationState?.pageNumber}`,
      };
    }
    const iframe = document.querySelector('iframe');
    iframe?.contentWindow?.postMessage(JSON.stringify(obj), '*');
  };

  const onDefaultHandler = () => {
    const message = 'default';
    const iframe = document.querySelector('iframe');
    iframe?.contentWindow?.postMessage(message, '*');
  };

  const onSaveAndExitHandler = () => {
    if (
      locationState?.moduleName === 'assignment' &&
      locationState?.isSingleAccess
    ) {
      setActionConfirmPopup(true);
      return;
    }

    saveAndExit();
  };

  const saveAndExit = () => {
    const message = 'save';
    const iframe = document.querySelector('iframe');
    iframe?.contentWindow?.postMessage(message, '*');
  };

  const handlePrint = () => {
    const message = 'print';
    const iframe = document.querySelector('iframe');
    iframe?.contentWindow?.postMessage(message, '*');
  };

  const navigateBack = () => {
    navigate(-1);
  };

  const statusChange = async (Status: string) => {
    const passObj: { state: string } = { state: Status };
    const userFd = new FormData();
    userFd.append('state', passObj.state);
    setFormObject(userFd);

    saveAndExit();
  };

  useEffect(() => {
    if (formObject !== null && locationState?.studentId !== -1) {
      updateStatus(formObject);

      setTimeout(() => {
        navigateBack();
      }, 2000);
    }
  }, [formObject]);

  const { isLoading: updateLoading, mutate: updateStatus } = usePatch({
    baseURL,
    url: `assignments-service/assignments/student/${locationState?.studentId}/change-status/`,
    onSuccess: (response: any) => {
      toast('success', response?.data?.message);
    },
    onError: (response: any) => {
      toast('error', response?.response?.data?.message);
    },
  });

  console.log('locationState?.contentUrl', locationState);

  return (
    <RouteLayout
      navBack={true}
      state={{ prevPage: location.state?.identifire }}
      path={location?.state?.identifire ? location?.state?.identifire : ``}
    >
      <CoursesFilter
        shortName={locationState?.shortName}
        grade={locationState?.grade}
      />

      <div className="previewWrapper pt-2">
        <div id="learnosity_assess" />
        {role?.name !== USER_TYPE.SUPER_ADMIN &&
        role?.name !== USER_TYPE.SCHOOL_ADMIN &&
        role?.name !== USER_TYPE.TEACHER ? (
          <div className="header">
            <div className="grow">
              {locationState?.isDueDatedExceeded ? (
                <button
                  className="c_button_1"
                  type="button"
                  onClick={navigateBack}
                >
                  Exit
                </button>
              ) : (
                <button
                  className="c_button_1"
                  type="button"
                  onClick={onSaveAndExitHandler}
                >
                  Save & Exit
                </button>
              )}
            </div>
            <button
              className="c_button_1"
              type="button"
              onClick={handleFullScreenClick}
            >
              Full Screen
            </button>
            <button className="c_button_1" type="button" onClick={handlePrint}>
              Print
            </button>
          </div>
        ) : (
          <div className="header flexn justify-between">
            <div className="flex justify-start">
              {(role?.name !== USER_TYPE.SCHOOL_ADMIN ||
                role?.name !== USER_TYPE.TEACHER) &&
              locationState?.assignButton ? (
                <button
                  className="c_button_1"
                  type="button"
                  onClick={navigatToAssign}
                >
                  Assign
                </button>
              ) : (
                ''
              )}
            </div>
            <div className="flex justify-end">
              <button
                className="c_button_1"
                type="button"
                onClick={handleFullScreenClick}
              >
                Full Screen
              </button>
              <button
                className="c_button_1 ml-2"
                type="button"
                onClick={handlePrint}
              >
                Print
              </button>
            </div>
          </div>
        )}
        <div className="body">
          <div
            style={{
              display: isLoading ? 'block' : 'none',
              width: '900px',
              height: '1000px',
            }}
          >
            <div className="h-full relative">
              <Loader />
            </div>
          </div>
          <div style={{ display: showIframe ? 'block' : 'none' }}>
            <iframe
              ref={ref}
              title="Course"
              src={`${locationState?.contentUrl}?user_id=${userId}&role=${role?.name}`}
              width={resizeContent[0]}
              height={resizeContent[1]}
            />
          </div>
        </div>
        <div className="footer justify-between">
          <img src={Logo2} alt="Logo" className="w-[103px]" />
          <p className="text-xs text-black">
            Copyright © 2024 Alpha Publishing.
          </p>
        </div>
      </div>

      <CustomizedDialogs
        open={actionConfirmPopup}
        maxwidth="sm"
        setOpen={(parameter: any) => {
          setActionConfirmPopup(false);
        }}
        title="Select Action"
      >
        <div>Are you sure you want to submit the assignment ?</div>

        <div className="flex justify-end items-center mt-12">
          <Button
            onClick={async () => {
              setActionConfirmPopup(false);
              statusChange('Submitted');
              // onsubmitHandler();
            }}
            sx={{ marginRight: '10px' }}
          >
            Yes
          </Button>

          <Button
            onClick={() => {
              setActionConfirmPopup(false);
            }}
          >
            No
          </Button>
        </div>
      </CustomizedDialogs>
    </RouteLayout>
  );
};

export default CoursePreview;
