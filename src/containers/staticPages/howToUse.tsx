import React, { useMemo, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Button } from '@mui/material';
import RouteLayout from '@layout/routeLayout';
import VideoIcon from '@mui/icons-material/VideoLibrary';
import StaticHeader from './staticHeader';
import StaticFooter from './staticFooter';

export default function HowToUse() {
  const data = [
    {
      title: 'A Guide to eAlpha for Teachers',
      video: [
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_1_Dashboard.mp4', name: 'Teacher Dashboard' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial-Creating_Groups.mp4', name: 'Creating Groups' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial-Creating_Assignments.mp4', name: 'Creating Assignments' },
      ]
    },
    {
      title: 'A Guide to eAlpha for Students Using a Browser',
      video: [
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_Tutorial_1-Browser_Login.mp4', name: 'Student Login' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_Tutorial_2-Browser_Dashboard.mp4', name: 'Student Dashboard' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_Tutorial_3-Completing_Assignments.mp4', name: 'Completing Assignments' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_Tutorial_4_Completing_Assessments.mp4', name: 'Completing Assessments'}
      ]
    },
    {
      title: 'A Guide to eAlpha for Students Using the App',
      video: [
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_APP_Tutorial_1-Login.mp4', name: 'Student Login' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student_APP_Tutorial_2-The_Dashboard.mp4', name: 'Student Dashboard' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Student%20_APP_Tutorial_3_Assignments.mp4', name: 'Student Assignments'}
      ]
    },
/*    {
      title: 'A Guide to eAlpha for Parents – English Language ',
      video: [
          //{ url: 'http://ealphaclips.com/Videos/How%20to%20use%20Ealpha/1129.mp4', name: 'A Guide to eAlpha for Parents English Language' }
      ]
    },*/
    {
      title: 'A Guide to eAlpha for Parents – Standard Arabic Language (بالعربية الفصحى)',
      video: [
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Arabic_Tutorial_1_Introduction_to_Dashboard.mp4', name: 'Arabic Tutorial 1-Introduction to the Student Dashboard' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Arabic_Tutorial_2_My_Courses.mp4', name: 'Arabic Tutorial 2-My Courses for Students' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Arabic_Tutorial_3_Assignments.mp4', name: 'Arabic Tutorial 3-Assignments for Students' }
        // { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_1_Dashboard.mp4', name: 'Teacher Tutorial Dashboard' }
      ],
      label: 'eAlpha for Parents'
    }
    // Add other items here
  ];

  const content = [
    {
      title: 'Math',
      video: [
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_2_My_Courses_Math.mp4', name: 'Teacher Tutorial My Courses Math' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_3_Math_Teacher_Resources.mp4', name: 'Teacher Tutorial Math Teacher Resources' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_4_Math_SB_PB_Ancillaries.mp4', name: 'Teacher Tutorial Math SB PB Ancillaries' }
      ]
    },
    {
      title: 'Science',
      video: [
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_5_My_Courses_Science.mp4', name: 'Teacher Tutorial My Courses Science' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_6_Science_Teacher_Resources.mp4', name: 'Teacher Tutorial Science Teacher Resources' },
        { url: 'https://ealphaedu.com/Ealpha4/ealpha_video/Teacher_Tutorial_Science_SB_PB_Ancillaries.mp4', name: 'Teacher Tutorial Science SB PB Ancillaries'}
      ]
    },
    {
      title: 'ELA',
      video: []
    },
    {
      title: 'ELT',
      video: []
    }
  ];

  const renderAccordion = (items: any) => {
    const [expandedItem, setExpandedItem] = useState(null); // Initialize with 0

    const handleItemClick = (index: any) => {
      setExpandedItem(expandedItem === index ? null : index);
    };
    return useMemo(() => items.map((item: any, index: any) => (
      <Accordion key={index} expanded={(expandedItem === index)}>
        <AccordionSummary
          sx={{
            backgroundColor: 'var(--sandgray)',
            flexDirection: 'row-reverse'
          }}
          aria-controls={`panel${index}-content`}
          id={`panel${index}-header`}
          onClick={() => handleItemClick(index)}
        >
          <Button>
            {item.video && <VideoIcon fontSize="small" style={{ marginRight: '0.5rem' }} />}
            <p className="py-1" style={{ color: '#333' }}>{item.title}</p>
          </Button>
        </AccordionSummary>
        <AccordionDetails style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {item.video && Array.isArray(item.video) ? (
            item.video.map((video: any) => (
              <div key={index} className="video-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '60px', marginBottom: '10px', lineHeight: 2 }}>
                <a href={`${video.url}`}>
                  <img alt="" style={{ width: '120px' }} src="https://www.ealpha.info/media/img/howtouse/Assignments_clip.png" />
                </a>
                <p>
                  <a href={`${video.url}`}>
                    {video.name}
                  </a>
                </p>
                <a href={video.url} download={true} target="_blank" style={{ color: '#08c' }} rel="noreferrer">Click Here to Download Video</a>
              </div>
            ))
          ) : (
            <div className="video-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '60px', marginBottom: '10px', lineHeight: 2 }}>
              <a href={`${item.url}`}>
                <img alt="" style={{ width: '120px' }} src="https://www.ealpha.info/media/img/howtouse/Assignments_clip.png" />
              </a>
              <p>
                <a href={`${item.url}`}>
                  {item.title}
                </a>
              </p>
              <a href={item.video} download={true} target="_blank" style={{ color: '#08c' }} rel="noreferrer">Click Here to Download Video</a>
            </div>
          )}
        </AccordionDetails>
      </Accordion>
    )), [items, expandedItem]);
  };

  return (
    <RouteLayout navBack={false} overflow={true}>
      <StaticHeader />
      <h2 className="text-3xl my-4 pl-6 mt-28">How To Use</h2>
      <div className="p-6">
        <p className="font-semibold mb-2">Browsing the Content:</p>
        <div className="flex flex-col gap-y-3">
          {renderAccordion(content)}
        </div>
        <p className="font-semibold mb-2 mt-4">How To:</p>
        <div className="flex flex-col gap-y-3">
          {renderAccordion(data)}
        </div>
      </div>
      <StaticFooter />
    </RouteLayout>
  );
}
