/* eslint-disable consistent-return */
/* eslint-disable arrow-parens */
/* eslint-disable no-useless-return */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable prefer-const */
/* eslint-disable semi */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable object-shorthand */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/button-has-type */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable no-else-return */
/* eslint-disable curly */
/* eslint-disable comma-dangle */
import { ReactComponent as ICReport } from '@images/smicons/Ic_reports.svg';
import { ReactComponent as ICStudent } from '@images/smicons/ic_StudentBooks.svg';
import { ReactComponent as ICPractice } from '@images/smicons/ic_Practice.svg';
import { ReactComponent as ManageCourcePermission } from '@images/smicons/managecourceper.svg';
import { ReactComponent as ICCourses } from '@images/smicons/Ic_Courses.svg';
import { ReactComponent as ICAssessments } from '@images/smicons/ic_Assessments.svg';
import { ReactComponent as ICAssignments } from '@images/smicons/ic_Assignments.svg';
import { ReactComponent as ICAlphaSims } from '@images/smicons/ic_AlphaSims.svg';
import { ReactComponent as ICAlphaClips } from '@images/smicons/ic_AlphaClips.svg';
import { ReactComponent as TimeTable } from '@images/smicons/Ic_attendance.svg';
import { ReactComponent as AttenDance } from '@images/smicons/gradebook.svg';
import { ReactComponent as GoogleClass } from '@images/smicons/google-classroom.svg';
import { Link } from 'react-router-dom';
import { selectUser } from '@shared/store/userSlice';
import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { Popover } from '@mui/material';
import CustomizedDialogs from '@component/dialog/CustomDialog';
import { DISCOVERY_DOC } from '@constants/constants';
import GoogleClassroomList from '../GoogleClassroomList';

const API_KEY = import.meta.env.VITE_APP_GOOGLE_CLASSROOM_KEY;
const CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLASSROOM_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/classroom.courses.readonly';

function TeacherIconContainer() {
  const {
    role: { name: role },
  } = useSelector(selectUser);
  const { schoolData } = useSelector((state: any) => state?.school);
  const schoolName = schoolData?.school_name || '';

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [openClassroomPopup, setopenClassroomPopup] = useState<boolean>(false);
  const [classroomData, setClassroomData] = useState<any>({});
  const [googleToken, setGoogleToken] = useState<any>(null);
  const [clientToken, setClientToken] = useState<any>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const cards = [
    {
      text: 'School Timetable',
      link: `/${schoolName}/time-table`,
      img: <TimeTable />,
    },
    {
      text: 'Attendance',
      link: `/${schoolName}/attandance`,
      img: <AttenDance />,
    },
    {
      text: 'My Courses',
      link: `/${schoolName}/MySubject`,
      img: <ICCourses />,
    },
    {
      text: 'Alpha Clips',
      link: `/${schoolName}/coming-soon`,
      img: <ICAlphaClips />,
    },
    {
      text: 'Alpha Sims',
      link: `/${schoolName}/coming-soon`,
      img: <ICAlphaSims />,
    },
    {
      text: 'Online Resources',
      link: `/${schoolName}/coming-soon`,
      img: <ManageCourcePermission />,
    },
    {
      text: 'My Library',
      link: `/${schoolName}/digital-library`,
      img: <ICPractice />,
    },
    {
      text: 'Assignments',
      link: `/${schoolName}/assignment`,
      img: <ICAssignments />,
    },
    {
      text: 'Assessments',
      link: `/${schoolName}/assessments`,
      img: <ICAssessments />,
    },
    {
      text: 'Reports',
      link: `/${schoolName}/reports`,
      img: <ICReport />,
    },
    {
      text: 'Google Classroom',
      action: handleClick,
      img: <GoogleClass />,
    },
    {
      text: 'Grade Book',
      link: `/${schoolName}/grade-book`,
      img: <ICStudent />,
    },
  ];

  const index = cards.findIndex((obj: any) => obj?.text === 'Grade Book');
  if (index !== -1 && role === 'Student') {
    cards.splice(index, 1);
  }

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Print the names of the first 10 courses the user has access to. If
   * no courses are found an appropriate message is printed.
   */
  async function listCourses() {
    console.log('list courses called');
    let response;
    try {
      // @ts-expect-error
      response = await window.gapi.client.classroom.courses.list({
        pageSize: 10,
      });
    } catch (err: any) {
      if (document.getElementById('content'))
        // Todo: show error message
        return;
    }

    const courses = response.result.courses;
    setClassroomData(courses);

    if (!courses || courses.length == 0) {
      return;
    }
  }

  /**
   * Callback after api.js is loaded.
   */
  function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
  }

  /**
   * Callback after the API client is loaded. Loads the
   * discovery doc to initialize the API.
   */
  async function initializeGapiClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
  }

  /**
   * Callback after Google Identity Services are loaded.
   */
  function gisLoaded() {
    // @ts-ignore
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined later
    });
    setClientToken(tokenClient);
  }

  /**
   *  Sign in the user upon button click.
   */
  function handleAuthClick() {
    clientToken.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        throw resp;
      }

      setGoogleToken(gapi.client.getToken());
      await listCourses();
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      clientToken.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      clientToken.requestAccessToken({ prompt: '' });
    }
  }

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick() {
    const token = gapi.client.getToken();
    console.log(token);

    if (token !== null) {
      // @ts-ignore
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken(null);
      setGoogleToken(null);
    }
  }

  useEffect(() => {
    gapiLoaded();
    gisLoaded();
  }, [API_KEY, CLIENT_ID, SCOPES]);

  return (
    <div className="sm-container mb-7">
      <div className="card-container">
        {cards.map((i: any, key: number) => {
          if (i?.action) {
            return (
              <div key={i?.text} className="cards">
                {i?.img}
                <div className="flex items-baseline gap-3">
                  <span>{i?.text}</span>

                  <button onClick={i?.action}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="8" cy="8" r="8" fill="#51A12C" />
                      <path
                        d="M3.47818 8.3479L11.826 8.3479"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.65201 4.17456L7.65201 11.8267"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          } else
            return (
              <Link key={i?.text} to={i?.link} className="cards">
                {i?.img}
                <span>{i?.text}</span>
              </Link>
            );
        })}
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div className="px-5 py-2 rounded-md border-2 border-[#4A9D2D]">
          {googleToken ? (
            <>
              <button
                className="font-semibold text-xs hover:border-b-2 border-b-[#4A9D2D]"
                onClick={() => {
                  handleSignoutClick();
                }}
              >
                Sign out
              </button>
              <hr />
              <button
                className="font-semibold text-xs hover:border-b-2 border-b-[#4A9D2D]"
                onClick={() => setopenClassroomPopup(true)}
              >
                Create class
              </button>
            </>
          ) : (
            <button
              id="customBtn"
              className="font-semibold text-xs hover:border-b-2 border-b-[#4A9D2D]"
              onClick={() => handleAuthClick()}
            >
              Sign in
            </button>
          )}
        </div>
      </Popover>
      <CustomizedDialogs
        title="Classroom Navigation"
        open={openClassroomPopup}
        setOpen={setopenClassroomPopup}
        onclose={() => setopenClassroomPopup(false)}
      >
        <GoogleClassroomList data={classroomData} />
      </CustomizedDialogs>
    </div>
  );
}

export default TeacherIconContainer;
