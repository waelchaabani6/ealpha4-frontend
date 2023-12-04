import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGet } from '@shared/api/useApi';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { ReactComponent as Book } from '@images/book.svg';
import Loader from '@shared/loader';
import { useOnClickOutside } from '@shared/useOnClickOutside';
import SmallBook from './SmallBook';

type Props = {
  ind: number;
  shortName: string;
  courseContents: any;
  image: any;
  logo: any;
}

function SmallCard({ ind, shortName, courseContents, image, logo }: Props) {
  const [show, setShow] = useState(false);
  const [courseName, setCourseName] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showFromLeft, setShowFromLeft] = useState(false);
  const [isCloserToCenter, setCloserToCenter] = useState(false);
  const [gradesDetails, setGradesDetails] = useState<any>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { userId: userID } = useSelector(selectUser);

  const handleOpen = (name: string) => {
    setShow(true);
    setCourseName(name);
  };

  const handleClick = (index: number) => {
    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    navigate(`/${schoolNameInURL}/MySubject/${courseName}/${gradesDetails[index].grade}`, { state: { grade_id: gradesDetails[index].grade_id } });
  };

  const { isLoading: gradesLoading, refetch: gradesFetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/grade-list/?keyword=${courseName}&user_id=${userID}`,
    cacheTime: 2000,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      setGradesDetails(respData);
    },
    onError: () => { },
    enabled: false
  });

  useEffect(() => {
    if (courseName) {
      gradesFetch();
    }
  }, [courseName]);

  useOnClickOutside(ref, () => setShow(false));

  useEffect(() => {
    if (cardRef.current && show) {
      const elementRect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportCenterX = viewportWidth / 2;
      const distanceToCenterX = Math.abs(elementRect.left + elementRect.width / 2 - viewportCenterX);
      const isCloseToCenterX = distanceToCenterX + 100 < ((viewportWidth / 4));

      if (isCloseToCenterX) {
        setCloserToCenter(true);
      } else {
        const midpoint = viewportWidth / 2;
        const isCloserToLeft = Math.abs(elementRect.left - midpoint) < Math.abs(elementRect.right - midpoint);
        setShowFromLeft(isCloserToLeft);
      }
    }
  }, [show]);

  return (
    <div className="mr-6 mb-6 ml-6">
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div key={ind} onClick={() => handleOpen(shortName)} className="flex flex-col relative cursor-pointer" ref={cardRef}>
        <div
          className="w-48 shrink-0 flex justify-center flex-col items-center bg-[#F7F7F7] mb-6 h-max rounded-lg border-[#D2D2D2] border-solid border box-shadow: 0px 0px 20px 0px #00000029;"
          style={show ? { boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.16)' } : { boxShadow: 'none' }}
        >
          <div>
            {
              (image || logo) ? <img className="h-[200px] w-[163px] p-2" src={image || logo} alt={shortName} /> : <Book height={204} />
            }
          </div>
          <div className="my-3 w-[90%] text-sm font-medium text-center bg-[#EEFBED] h-[50px] flex justify-center items-center ">
            <span>
              {' '}
              {shortName}
              {' '}
            </span>
          </div>
        </div>
        {show
          ? (
            <div className={`flex relative top-[-10px] flex-wrap sm:absolute sm:top-unset sm:flex-nowrap -bottom-16 ${isCloserToCenter ? 'left-1/2 transform -translate-x-1/2' : `${(showFromLeft ? 'right-0 justify-end' : '')}`}  `} ref={ref}>
              {gradesDetails?.map((ele: any, index: any, array: any) => {
                let isTopCenter = false;
                const isEmpty = false;
                let leftArraw = false;
                if (isCloserToCenter) {
                  isTopCenter = false;
                } else if (showFromLeft === false) {
                  if (index === 0) {
                    isTopCenter = true;
                  } else {
                    leftArraw = true;
                  }
                } else if (index === array.length - 1) {
                  isTopCenter = true;
                } else if (index === 0) {
                  leftArraw = false;
                } else {
                  leftArraw = true;
                }
                return (<SmallBook handleClick={handleClick} leftArraw={leftArraw} isTopCenter={isTopCenter} isEmpty={isEmpty} showFromLeft={showFromLeft} gradesName={ele} index={index} image={ele?.icon_file} logo={ele?.icon_link} />);
              }
              )}
            </div>) : null}
      </div>
    </div>
  );
}

export default SmallCard;
