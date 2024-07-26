import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useGet } from '@shared/api/useApi';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { ReactComponent as Book } from '@images/book.svg';

import AlphaClips from '@images/gradebookIcons/alpha_clips.jpg';
import AssessmentImg from '@images/gradebookIcons/assesments.jpg';
import StudentBook from '@images/gradebookIcons/student_book.jpg';
import TeacherResource from '@images/gradebookIcons/teacher_resource.jpg';
import WorkBook from '@images/gradebookIcons/work_book.jpg';
import AlphaSims from '@images/gradebookIcons/alpha_sims.png';

import Loader from '@shared/loader';
import { CourseComponents } from '@constants/constants';

type Props = {
  shortName: string;
  gradeName: string;
  courseID: number;
  image: any;
  logo: any;
};

function GradeCard({ shortName, gradeName, courseID, image, logo }: Props) {
  const [componetDetails, setComponetDetails] = useState<any>([]);
  const { userId: userID } = useSelector(selectUser);

  const { isLoading: componentsLoading, refetch: componetsFetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/component-list/?keyword=${shortName}&grade_value=${gradeName}&user_id=${userID}`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      if (respData?.length) {
        setComponetDetails(respData);
      }
    },
    onError: () => {},
    enabled: false,
  });

  useEffect(() => {
    if (shortName && gradeName) {
      componetsFetch();
    }
  }, [shortName, gradeName]);

  if (componentsLoading) {
    return (
      <div className="h-32">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className="border border-solid border-green-500 m-5 rounded-2xl flex p-[10px] h-[300px]">
        <div className="w-[200px] p-4 m-2 bg-[#F7F7F7] h-max rounded-lg border-[#D2D2D2] border-solid border">
          {image || logo ? (
            <img src={image || logo} alt={gradeName} />
          ) : (
            <Book />
          )}
        </div>
        <div className="mt-10 flex overflow-x-auto overflow-y-hidden w-full mb-[-10px]">
          {componetDetails?.map((ele: any) => (
            <GradeSmallCard
              components={ele}
              shortName={shortName}
              courseID={courseID}
              gradeName={gradeName}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default GradeCard;

type componentProps = {
  components: any;
  shortName: string;
  gradeName: string;
  courseID: number;
};

function GradeSmallCard({
  components,
  shortName,
  gradeName,
  courseID,
}: componentProps) {
  const {
    TEACHER_RESOURCES,
    STUDENT_BOOK,
    WORK_BOOK,
    ALPHA_CLIPS,
    ASSESSMENTS,
    ALPHA_SIMS,
    PRACTICE_BOOK,
    STUDENT_EDITION,
    STUDENT_ANTHOLOGY,
    PUPIL_BOOK,
    ACTIVITY_BOOK,
    SIDE_KICK,
    HW_ACTIVITY_BOOK,
    STUDENT_SIDEKICKS,
    LITERARY_COMPANIONS,
    TEACHER_GUIDE,
    ANCILLARIES,
  } = CourseComponents;
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  const [len, setLen] = useState(0);
  const [volumeDetails, setVolumeDetails] = useState<any>([]);
  // useOnClickOutside(ref, () => setShow(false));
  const { userId: userID } = useSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();
  const { name = '', grade = '' } = useParams();

  const {
    isLoading: volumesLoading,
    isRefetching,
    refetch: volumesFetch,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/volume-list/?keyword=${shortName}&grade_value=${gradeName}&component_value=${components?.component}&user_id=${userID}`,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      setLen(respData?.length);
      if (respData?.length) {
        setVolumeDetails(respData);
      }
    },
    onError: () => {},
    enabled: false,
  });

  useEffect(() => {
    if (shortName && gradeName) {
      volumesFetch();
    }
  }, [shortName, gradeName]);

  if (volumesLoading || isRefetching) {
    return (
      <div className="h-32">
        <Loader />
      </div>
    );
  }

  const formatText = (text = ''): string =>
    text?.trim().toLowerCase().replace(/ /g, '');

  const renderComponent = () => {
    switch (formatText(components?.component)) {
      case formatText(TEACHER_RESOURCES):
      case formatText(TEACHER_GUIDE):
        return TeacherResource;

      case formatText(STUDENT_BOOK):
      case formatText(STUDENT_EDITION):
      case formatText(STUDENT_ANTHOLOGY):
      case formatText(PUPIL_BOOK):
        return StudentBook;

      case formatText(HW_ACTIVITY_BOOK):
      case formatText(WORK_BOOK):
      case formatText(ACTIVITY_BOOK):
      case formatText(STUDENT_SIDEKICKS):
      case formatText(LITERARY_COMPANIONS):
      case formatText(PRACTICE_BOOK):
      case formatText(SIDE_KICK):
        return WorkBook;

      case formatText(ALPHA_CLIPS):
        return AlphaClips;

      case formatText(ASSESSMENTS):
        return AssessmentImg;

      case formatText(ALPHA_SIMS):
        return AlphaSims;

      case formatText(ANCILLARIES):
        return AlphaSims;

      default:
        return TeacherResource;
    }
  };

  return (
    <div
      ref={ref}
      className="w-60 h-16 border border-solid border-gray-300 mr-4 rounded-xl"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div
        className="w-full h-full cursor-pointer flex justify-between items-center"
        role="list"
        onClick={() =>
          !volumeDetails.length ? navigate(`${courseID}`) : false
        }
      >
        <span
          className={`${!renderComponent() ? 'h-[60px] w-32 bg-[#BECCFF] flex justify-center items-center relative left-[-2px] rounded-xl' : 'h-full w-[92px]'}`}
        >
          {!renderComponent() && (
            <span className="absolute top-[21px] right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-[#BECCFF] border-r border-t" />
          )}
          <img
            src={
              components?.icon_file ||
              components?.icon_link ||
              renderComponent()
            }
            alt={components?.component}
            width={92}
            className="object-fill h-full p-[1px] rounded-xl"
          />
        </span>
        <span className="w-full mx-2 text-[14px] text-center font-semibold">
          {' '}
          {components?.component}{' '}
        </span>
      </div>
      {show ? (
        <div
          className={
            len > 0
              ? `bg-white-500 w-full border border-solid rounded-md overflow-auto max-h-[175px]`
              : ''
          }
        >
          {volumeDetails?.map((ele: any, ind: any) => (
            <div
              tabIndex={0}
              role="button"
              key={ind}
              className="border-b cursor-pointer border-solid text-[13px] p-[4px] font-semibold hover:bg-slate-100"
              onClick={() =>
                navigate(`${ele?.courses_id}`, {
                  state: {
                    volume: ele.volume,
                    courses_id: ele.courses_id,
                    volume_id: ele.volume_id,
                    course_name: name,
                    grade,
                    components: components.component,
                    component_id: components.component_id,
                    grade_id: location?.state?.grade_id,
                  },
                })
              }
            >
              {ele?.volume}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
