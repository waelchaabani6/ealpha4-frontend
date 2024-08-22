/* eslint-disable react/jsx-curly-newline */
/* eslint-disable no-confusing-arrow */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable comma-dangle */
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import { useGet, api } from '@shared/api/useApi';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';
import Loader from '@shared/loader';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { ReactComponent as Book } from '@images/book.svg';

type Props = {
  ind: number;
  shortName: string;
  courseContents: any;
  image: any;
  logo: any;
};

const backgroundColor = [
  'var(--light-accent)',
  '#BECCFF',
  '#FFF9BE',
  '#FCD4C6',
  '#B4DEFF',
];

function SmallCard({ ind, shortName, courseContents, image, logo }: Props) {
  const [showIndex, setIndex] = useState(-1);
  const [componetDetails, setComponetDetails] = useState<any>([]);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { userId: userID } = useSelector(selectUser);
  const grade = courseContents.find(
    (ele: any) => ele.course_selection === 'Grade'
  );

  const getLocation = (href: string) => {
    const l = document.createElement('a');
    l.href = href;
    return l;
  };

  const {
    isLoading: categoriesLoading,
    data,
    isSuccess,
  } = useGet({
    baseURL: import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL,
    url: `course-code-service/courses/component-list/?keyword=${shortName}&grade_value=${grade.category}&user_id=${userID}`,
  });

  const getAllComponetsDetails = (componentArray: any) => {
    const resultAPIs = componentArray?.map((items: any) =>
      api(import.meta.env.VITE_APP_COURSE_CODE_SERVICE_URL)
        .get(
          `course-code-service/courses/volume-list/?keyword=${shortName}&grade_value=${grade.category}&component_value=${items.component}&user_id=${userID}`
        )
        .then((volumeData: any) => ({
          component: items.component,
          courses_id: items.courses_id,
          volumeData,
        }))
    );
    Promise.allSettled(resultAPIs).then((res: any) => {
      setIsLoading(false);
      if (res?.length) {
        const componetsAndVolumes: any = [];
        res?.forEach((element: any, i: any) => {
          componetsAndVolumes.push({
            component: element?.value?.component,
            bgColor: backgroundColor[i],
            courseID: element?.value?.courses_id,
            volumeData: Array.isArray(
              element?.value?.volumeData?.data?.response
            )
              ? element?.value?.volumeData?.data?.response
              : [],
          });
        });
        setComponetDetails(componetsAndVolumes);
      }
    });
  };

  useEffect(() => {
    if (isSuccess) {
      getAllComponetsDetails(data?.data?.response);
    }
  }, [isSuccess]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    const urlObj: any = getLocation(window.location.href);
    setRedirectUrl(urlObj.pathname);
  }, []);

  // useOnClickOutside(ref, () => setIndex(-1));

  if (categoriesLoading || isLoading) {
    return (
      <div className="h-32">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-row mt-5">
      <div className="flex flex-col relative">
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div className="w-48 shrink-0 flex justify-center flex-col items-center bg-[#F7F7F7] mr-4 mb-6 ml-6 rounded-lg border-[#D2D2D2] border-solid border cursor-pointer">
          <div>
            {/* <Book /> */}
            <div className="mt-2">
              {image || logo ? (
                <img
                  className="h-[215px]"
                  src={image || logo}
                  alt={shortName}
                />
              ) : (
                <Book height={204} />
              )}
            </div>
            {/* <img src="/src/assets/images/book.svg" alt="course-pic" /> */}
          </div>
          <div className="flex min-w-[174px] min-h-[35px] my-4 mx-2 rounded-lg items-center justify-center text-center bg-[#EEFBED]">
            <span>
              {shortName}
              {' - '}
              {grade.category}
            </span>
          </div>
        </div>
      </div>
      <div className="w-[170px]" ref={ref}>
        {componetDetails?.map((ele: any, index: any) => (
          <Accordion
            key={index}
            sx={{ marginBottom: '10px' }}
            disableGutters={true}
            expanded={ele?.volumeData?.length ? showIndex === index : false}
            onMouseEnter={() => setIndex(index)}
            onMouseLeave={() => setIndex(-1)}
          >
            <AccordionSummary
              sx={{
                backgroundColor: ele?.bgColor,
                cursor: 'pointer',
              }}
              // expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
              onClick={() =>
                !ele?.volumeData?.length
                  ? navigate(`${redirectUrl}/${ele?.courseID}`)
                  : false
              }
            >
              <span
                className="w-full text-[14px] text-center font-semibold"
                style={{ backgroundColor: ele?.bgColor }}
              >
                {ele?.component}
              </span>
            </AccordionSummary>
            <AccordionDetails>
              <div className="text-[12px]  cursor-pointer">
                {ele?.volumeData?.map((innerEle: any, i: any) => (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                  <div
                    key={i}
                    className="w-full text-[14px] text-center p-1"
                    onClick={() => {
                      navigate(`${redirectUrl}/${innerEle?.courses_id}`);
                    }}
                  >
                    {innerEle?.volume}
                  </div>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </div>
  );
}

export default SmallCard;
