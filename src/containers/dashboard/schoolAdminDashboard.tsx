/* eslint-disable no-else-return */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable curly */
/* eslint-disable eqeqeq */
/* eslint-disable no-useless-return */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
/* eslint-disable comma-dangle */
/* eslint-disable react/button-has-type */
import {
  BRANCHES,
  MANAGE_CLASSES,
  MANAGE_MEMBERS,
  PROMOTE_STUDENT,
} from '@constants/routes';
import { ReactComponent as AddClass } from '@images/smicons/Ic_addclass.svg';
import { ReactComponent as AddParent } from '@images/smicons/Ic_addparent.svg';
import { ReactComponent as AddStudent } from '@images/smicons/Ic_addstudent.svg';
import { ReactComponent as AddTeacher } from '@images/smicons/Ic_addteacher.svg';
import { ReactComponent as EditSchool } from '@images/smicons/Ic_edit-school2.svg';
import { ReactComponent as ManageAssignment } from '@images/smicons/Ic_manage-assignment.svg';
import { ReactComponent as ManageMembers } from '@images/smicons/Ic_managemembers.svg';
import { ReactComponent as Reports } from '@images/smicons/Ic_reports.svg';
import { ReactComponent as SchoolTimetable } from '@images/smicons/Ic_timetable.svg';
import { ReactComponent as ManageClasses } from '@images/smicons/Manage-classes.svg';
import { ReactComponent as Notification } from '@images/smicons/Noti.svg';
import { ReactComponent as GradeBook } from '@images/smicons/gradebook.svg';
import { ReactComponent as ManageAdmin } from '@images/smicons/manageAdminn1.svg';
import { ReactComponent as ManageAssessment } from '@images/smicons/manageassessment.svg';
import { ReactComponent as ManageBranch } from '@images/smicons/managebranch.svg';
import { ReactComponent as ManageCourcePermission } from '@images/smicons/managecourceper.svg';
import { ReactComponent as ICPractice } from '@images/smicons/ic_Practice.svg';
import { ReactComponent as GoogleClass } from '@images/smicons/google-classroom.svg';

import RouteLayout from '@layout/routeLayout';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectUser } from '@shared/store/userSlice';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import ToastMessage from '@containers/dashboard/ToastMessage';
import { useEffect, useState } from 'react';
import { Popover } from '@mui/material';

import { DISCOVERY_DOC } from '@constants/constants';
import toast from '@shared/toast';
import CustomizedDialogs from '@component/dialog/CustomDialog';
// import useGapi from '@utility/Hooks/useGpi/useGpi';
import GoogleClassroomList from './GoogleClassroomList';

const API_KEY = import.meta.env.VITE_APP_GOOGLE_CLASSROOM_KEY;
const CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLASSROOM_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/classroom.courses.readonly';

export default function SchoolAdminDashboard() {
  const { schoolId } = useSelector(selectUser);
  const { schoolName } = useParams();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [openClassroomPopup, setopenClassroomPopup] = useState<boolean>(false);
  const [classroomData, setClassroomData] = useState<any>({});
  const [googleToken, setGoogleToken] = useState<any>(null);
  const [clientToken, setClientToken] = useState<any>(null);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const cards = [
    {
      text: 'Add Class',
      link: `/${schoolName}/dashboard/${schoolId}/manage-classes?add=true`,
      img: <AddClass />,
    },
    {
      text: 'Add Teacher',
      link: `/${schoolName}/dashboard/${schoolId}/manage-members/add-teacher`,
      img: <AddTeacher />,
    },
    {
      text: 'Add Student',
      link: `/${schoolName}/dashboard/${schoolId}/manage-members/add-student`,
      img: <AddStudent />,
    },
    {
      text: 'Add Parent',
      link: `/${schoolName}/dashboard/${schoolId}/manage-members/add-parent`,
      img: <AddParent />,
    },
    {
      text: 'Manage Admin',
      link: `/${schoolName}/dashboard/${schoolId}/admin`,
      img: <ManageAdmin />,
    },
    {
      text: 'Manage Members',
      link: `/${schoolName}/dashboard/${schoolId}/${MANAGE_MEMBERS}`,
      img: <ManageMembers />,
    },
    {
      text: 'Manage Classes',
      link: `/${schoolName}/dashboard/${schoolId}/${MANAGE_CLASSES}`,
      img: <ManageClasses />,
    },
    {
      text: 'Manage Course Permissions',
      link: `/${schoolName}/dashboard/manage-course-permission`,
      img: <ManageCourcePermission />,
    },
    {
      text: 'Manage Assignments',
      link: `/${schoolName}/assignment`,
      img: <ManageAssignment />,
    },
    {
      text: 'Manage Assessments',
      link: `/${schoolName}/assessments`,
      img: <ManageAssessment />,
    },
    {
      text: 'Manage Branches',
      link: `/${schoolName}/dashboard/${schoolId}/${BRANCHES}`,
      img: <ManageBranch />,
    },
    {
      text: 'School Timetable',
      link: `/${schoolName}/time-table`,
      img: <SchoolTimetable />,
    },
    {
      text: 'Edit School Details',
      link: `/${schoolName}/dashboard/${schoolId}/edit`,
      img: <EditSchool />,
    },
    {
      text: 'Reports',
      link: `/${schoolName}/reports`,
      img: <Reports />,
    },
    {
      text: 'Gradebook',
      link: `/${schoolName}/dashboard/grade-book`,
      img: <GradeBook />,
    },
    {
      text: 'Email Server Setting',
      link: `/${schoolName}/dashboard/notification/smtp-server`,
      img: <Notification />,
    },
    {
      text: 'Push Notification',
      link: `/${schoolName}/dashboard/notification/push-notification`,
      img: <Notification />,
    },
    {
      text: 'Email Notification',
      link: `/${schoolName}/dashboard/notification/email-notification`,
      img: <Notification />,
    },
    {
      text: 'SMS Notification',
      link: `/${schoolName}/dashboard/notification/sms-notification`,
      img: <Notification />,
    },
    {
      text: 'Google Classroom',
      action: handleClick,
      img: <GoogleClass />,
    },
    {
      text: 'My Library',
      link: `/${schoolName}/digital-library`,
      img: <ICPractice />,
    },
  ];
  // if (id && user?.userId !== +id) {
  //   return <Navigate replace={true} to={`/${schoolName}/dashboard`} />;
  // }

  const handleClose = () => {
    setAnchorEl(null);
  };

  // // @ts-ignore
  // const { signIn, signOut, profile, client } = useGapi({
  //   apiKey: API_KEY,
  //   scope: SCOPES,
  //   clientId: CLIENT_ID,
  //   script_url: 'https://apis.google.com/js/api.js',
  //   discoveryDocs: [DISCOVERY_DOC],
  // });

  // useEffect(() => {
  //   if (profile?.auth?.access_token) {
  //     setToken(profile?.auth?.access_token);
  //     toast('success', 'You are logged in with google');
  //   } else {
  //     setToken(null);
  //     toast('error', 'You are logged out from google account');
  //   }
  // }, [profile]);

  // useEffect(() => {
  //   console.log(client, 'client');
  //   listCourses();
  // }, [client, profile]);

  // /**
  //  * Print the names of the first 10 courses the user has access to. If
  //  * no courses are found an appropriate message is printed.
  //  */
  // async function listCourses() {
  //   let response;
  //   try {
  //     response = await client.classroom.courses.list({
  //       pageSize: 10,
  //     });
  //   } catch (err: any) {
  //     if (document.getElementById('content'))
  //       // document.getElementById('content').innerText = err.message;
  //       // Todo: show error message
  //       return;
  //   }

  //   const courses = response.result.courses;

  //   setClassroomData(courses);

  //   if (!courses || courses.length == 0) {
  //     return;
  //   }
  // }

  // const handleSignout = () => {
  //   signOut().then(() => {
  //     console.log(profile);
  //     console.log('User signed out.');
  //   });
  // };

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
    <RouteLayout navBack={false}>
      <ToastMessage />
      <div className="sm-container">
        <HeaderMenus title="School Admin" />
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
    </RouteLayout>
  );
}
