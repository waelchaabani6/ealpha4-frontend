/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable comma-dangle */
/* eslint-disable implicit-arrow-linebreak */
import React, { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
} from '@mui/material';
import RouteLayout from '@layout/routeLayout';
import VideoIcon from '@mui/icons-material/VideoLibrary';
import StaticHeader from './staticHeader';
import StaticFooter from './staticFooter';
import Pdf from '../../assets/Documents/How to run Android apps in Windows.pdf';

const content = [
  {
    title: 'Alpha Mathematics',
    video: [
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_2_My_Courses_Math.mp4',
        name: 'My Course Resources',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_3_Math_Teacher_Resources.mp4',
        name: 'Math Teacher Resources',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_4_Math_SB_PB_Ancillaries.mp4',
        name: 'Math Student Resources',
      },
    ],
  },
  {
    title: 'Alpha Science',
    video: [
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_5_My_Courses_Science.mp4',
        name: 'My Course Resources',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_6_Science_Teacher_Resources.mp4',
        name: 'Science Teacher Resources',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_Science_SB_PB_Ancillaries.mp4',
        name: 'Science Student Resources',
      },
    ],
  },
  // {
  //   title: 'Alpha Reading & Literature',
  //   video: [],
  // },
  // {
  //   title: 'Alpha ELT',
  //   video: [],
  // },
  {
    title: 'Task Navigation',
    video: [
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_1_Dashboard.mp4',
        name: 'The Teacher Dashboard',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial-Creating_Groups.mp4',
        name: 'Creating Groups',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial-Creating_Assignments.mp4',
        name: 'Creating Assignments',
      },
      // {
      //   url: '',
      //   name: 'Creating Assessments',
      // },
      // {
      //   url: '',
      //   name: 'Viewing Student Assignments',
      // },
      // {
      //   url: '',
      //   name: 'Viewing Student Assessments',
      // },
      // {
      //   url: '',
      //   name: 'Viewing Reports',
      // },
    ],
  },
];

const studentContent = [
  {
    title: 'Using a Browser',
    video: [
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_Tutorial_1-Browser_Login.mp4',
        name: 'Student Login',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_Tutorial_2-Browser_Dashboard.mp4',
        name: 'Student Dashboard',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_Tutorial_3-Completing_Assignments.mp4',
        name: 'Completing Assignments',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_Tutorial_4_Completing_Assessments.mp4',
        name: 'Completing Assessments',
      },
      // {
      //   url: '',
      //   name: 'Viewing Reports',
      // },
    ],
  },
  {
    title: 'Using the App',
    video: [
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_APP_Tutorial_1-Login.mp4',
        name: 'Student Login',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_APP_Tutorial_2-The_Dashboard.mp4',
        name: 'Student Dashboard',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student%20_APP_Tutorial_3_Assignments.mp4',
        name: 'Student Assignments',
      },
    ],
  },
];

const parentContent = [
  {
    title: 'Arabic Tutorials',
    video: [
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Arabic_Tutorial_1_Introduction_to_Dashboard.mp4',
        name: 'Introduction to the Student Dashboard - مُقدِّمة إلى لوحة التُّحكُّم الخاصَّة بالطَّالب',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Arabic_Tutorial_2_My_Courses.mp4',
        name: 'My Courses for Students - دليل موادُّ الطَّالب الدِّراسيَّة',
      },
      {
        url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Arabic_Tutorial_3_Assignments.mp4',
        name: 'Assignments for Students - دليل واجبات الطَّالب',
      },
      // {
      //   url: '',
      //   name: 'Assessments for Students - دليل تقييم الطَّالب',
      // },
    ],
  },
];

export default function HowToUse() {
  const renderAccordion = (items: any) => {
    const [expandedItem, setExpandedItem] = useState(null); // Initialize with 0

    const handleItemClick = (index: any) => {
      setExpandedItem(expandedItem === index ? null : index);
    };

    return useMemo(
      () =>
        items.map((item: any, index: any) => (
          <Accordion key={index} expanded={expandedItem === index}>
            <AccordionSummary
              sx={{
                backgroundColor: 'var(--sandgray)',
                flexDirection: 'row-reverse',
              }}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
              onClick={() => handleItemClick(index)}
            >
              <Button>
                {item.video && (
                  <VideoIcon
                    fontSize="small"
                    style={{ marginRight: '0.5rem' }}
                  />
                )}
                <p className="py-1" style={{ color: '#333' }}>
                  {item.title}
                </p>
              </Button>
            </AccordionSummary>
            <AccordionDetails
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}
            >
              {item.video && Array.isArray(item.video) ? (
                item.video.map((video: any) => (
                  <div
                    key={index}
                    className="video-container"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      marginRight: '60px',
                      marginBottom: '10px',
                      lineHeight: 2,
                    }}
                  >
                    <a href={`${video.url}`}>
                      <img
                        alt="video"
                        style={{ width: '120px' }}
                        src="https://www.ealpha.info/media/img/howtouse/Assignments_clip.png"
                      />
                    </a>
                    <p>
                      <a href={`${video.url}`}>{video.name}</a>
                    </p>

                    <a
                      href={video.url}
                      download={true}
                      target="_blank"
                      style={{ color: '#08c' }}
                      rel="noreferrer"
                    >
                      Click Here to Download Video
                    </a>
                  </div>
                ))
              ) : (
                <div
                  className="video-container"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginRight: '60px',
                    marginBottom: '10px',
                    lineHeight: 2,
                  }}
                >
                  <a href={`${item.url}`}>
                    <img
                      alt=""
                      style={{ width: '120px' }}
                      src="https://www.ealpha.info/media/img/howtouse/Assignments_clip.png"
                    />
                  </a>
                  <p>
                    <a href={`${item.url}`}>{item.title}</a>
                  </p>
                  <a
                    href={item.video}
                    download={true}
                    target="_blank"
                    style={{ color: '#08c' }}
                    rel="noreferrer"
                  >
                    Click Here to Download Video
                  </a>
                </div>
              )}
            </AccordionDetails>
          </Accordion>
        )),
      [items, expandedItem]
    );
  };

  return (
    <RouteLayout navBack={false} overflow={true}>
      <StaticHeader />
      <h2 className="text-3xl my-4 pl-6 mt-28">How To Use</h2>
      <div className="p-6">
        <p className="font-bold mb-2">Guide for Teachers :</p>
        <div className="flex flex-col gap-y-3">{renderAccordion(content)}</div>

        <p className="font-bold mb-2 mt-4">Guide for Students :</p>
        <div className="flex flex-col gap-y-3">
          {renderAccordion(studentContent)}
        </div>

        <p className="font-bold mb-2 mt-4">Guide for Parents :</p>
        <div className="flex flex-col gap-y-3">
          {renderAccordion(parentContent)}
        </div>
      </div>

      <h2 className="text-3xl my-4 pl-6 mt-8">
        How To Use Mobile App on Windows
      </h2>

      <div className="p-6 ">
        <div
          style={{
            boxShadow:
              '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
          }}
          className="bg-sandgray min-h-[44px] py-5 px-4 rounded"
        >
          <p className="font-bold cursor-pointer hover:underline">
            <a href={Pdf} target="_blank" rel="noopener noreferrer">
              Open pdf file - How to run Android apps in Windows
            </a>
          </p>
        </div>
      </div>
      <StaticFooter />
    </RouteLayout>
  );
}
