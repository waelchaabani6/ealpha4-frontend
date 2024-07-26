/* eslint-disable react/button-has-type */
/* eslint-disable comma-dangle */
/* eslint-disable no-console */
/* eslint-disable operator-linebreak */
/* eslint-disable react/jsx-one-expression-per-line */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGet } from '@shared/api/useApi';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import { ReactComponent as Book } from '@images/book.svg';
import { Fade, Popover, Popper, PopperPlacementType } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

import SmallBook from './SmallBook';

type Props = {
  ind: number;
  shortName: string;
  courseContents: any;
  image: any;
  logo: any;
};

function SmallCard({ ind, shortName, courseContents, image, logo }: Props) {
  const [show, setShow] = useState(false);
  const [courseName, setCourseName] = useState('');

  const [showFromLeft, setShowFromLeft] = useState(false);
  const [isCloserToCenter, setCloserToCenter] = useState(false);
  const [gradesDetails, setGradesDetails] = useState<any>([]);

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { userId: userID } = useSelector(selectUser);

  const handleOpen = (
    name: string,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    setAnchorEl(null);
    setCourseName(name);
    // setAnchorEl(e.currentTarget);
    setAnchorEl(anchorEl ? null : e.currentTarget);
  };

  const handleClick = (index: number) => {
    const schoolNameInURL = decodeURIComponent(location.pathname.split('/')[1]);
    navigate(
      `/${schoolNameInURL}/MySubject/${courseName}/${gradesDetails[index].grade}`,
      { state: { grade_id: gradesDetails[index].grade_id } }
    );
  };

  const { isLoading: gradesLoading, refetch: gradesFetch } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/grade-list/?keyword=${courseName}&user_id=${userID}`,
    cacheTime: 2000,
    onSuccess: (res: any) => {
      const respData = res?.data?.response;
      setGradesDetails(respData);
    },
    onError: () => {},
    enabled: false,
  });

  useEffect(() => {
    if (courseName) {
      gradesFetch();
    }
  }, [courseName]);

  // useOnClickOutside(ref, () => {
  //   setShow(false);
  //   setAnchorEl(null);
  // });

  // useEffect(() => {
  //   if (cardRef.current && show) {
  //     const elementRect = cardRef.current.getBoundingClientRect();

  //     const viewportWidth = window.innerWidth;
  //     const viewportCenterX = viewportWidth / 2;
  //     const distanceToCenterX = Math.abs(
  //       elementRect.left + elementRect.width / 2 - viewportCenterX
  //     );
  //     const isCloseToCenterX = distanceToCenterX + 100 < viewportWidth / 4;
  //     if (isCloseToCenterX) {
  //       setCloserToCenter(true);
  //     } else {
  //       const isCloserToLeft =
  //         Math.abs(elementRect.left - viewportCenterX) <
  //         Math.abs(elementRect.right - viewportCenterX);
  //       setShowFromLeft(isCloserToLeft);
  //     }
  //   }
  // }, [show]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  // const [placement, setPlacement] = useState<PopperPlacementType>();
  // const [open, setOpen] = useState(false);
  // const uid = uuidv4();

  return (
    <div className="mr-6 mb-6 ml-6">
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        key={ind}
        aria-describedby={shortName}
        onClick={(e) => handleOpen(shortName, e)}
        className="flex flex-col relative cursor-pointer"
        // ref={cardRef}
      >
        <div
          className={`w-48 shrink-0 flex justify-center flex-col items-center bg-[#F7F7F7] mb-6 h-max rounded-lg  ${open ? 'border-gray-700' : 'border-[#D2D2D2]'} border-solid border`}
          style={
            open
              ? { boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.16)' }
              : { boxShadow: 'none' }
          }
        >
          <div>
            {image || logo ? (
              <img
                className="h-[200px] w-[163px] p-2"
                src={image || logo}
                alt={shortName}
              />
            ) : (
              <Book height={204} />
            )}
          </div>
          <div className="my-3 w-[90%] text-sm font-medium text-center bg-[#EEFBED] h-[50px] flex justify-center items-center ">
            <span> {shortName} </span>
          </div>
        </div>
      </div>

      <Popover
        id={shortName}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div className={`flex flex-wrap `}>
          {gradesDetails?.map((ele: any, index: any, array: any) => {
            let isTopCenter = false;
            const isEmpty = false;
            let leftArrow = false;

            if (isCloserToCenter) {
              isTopCenter = false;
            } else if (showFromLeft === false) {
              if (index === 0) {
                isTopCenter = true;
              } else {
                leftArrow = true;
              }
            } else if (index === array.length - 1) {
              isTopCenter = true;
            } else if (index === 0) {
              leftArrow = false;
            } else {
              leftArrow = true;
            }
            return (
              <SmallBook
                handleClick={handleClick}
                leftArrow={leftArrow}
                isTopCenter={isTopCenter}
                isEmpty={isEmpty}
                gradesName={ele}
                index={index}
                image={ele?.icon_file}
                logo={ele?.icon_link}
              />
            );
          })}
        </div>
      </Popover>

      {/* <Popper
        id={ind.toString()}
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
      >
        <div className={`flex flex-wrap  `}>
          {gradesDetails?.map((ele: any, index: any, array: any) => {
            let isTopCenter = false;
            const isEmpty = false;
            let leftArrow = false;

            if (isCloserToCenter) {
              isTopCenter = false;
            } else if (showFromLeft === false) {
              if (index === 0) {
                isTopCenter = true;
              } else {
                leftArrow = true;
              }
            } else if (index === array.length - 1) {
              isTopCenter = true;
            } else if (index === 0) {
              leftArrow = false;
            } else {
              leftArrow = true;
            }
            return (
              <SmallBook
                handleClick={handleClick}
                leftArrow={leftArrow}
                isTopCenter={isTopCenter}
                isEmpty={isEmpty}
                gradesName={ele}
                index={index}
                image={ele?.icon_file}
                logo={ele?.icon_link}
              />
            );
          })}
        </div>
      </Popper> */}
    </div>
  );
}

export default SmallCard;
