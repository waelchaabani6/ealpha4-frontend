/* eslint-disable indent */
/* eslint-disable react/button-has-type */
/* eslint-disable prefer-destructuring */
/* eslint-disable comma-dangle */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { DISCOVERY_DOC } from '@constants/constants';
import GoogleClassroomList from '@containers/dashboard/GoogleClassroomList';
import RouteLayout from '@layout/routeLayout';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import LogoutIcon from '@mui/icons-material/Logout';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { useEffect, useState } from 'react';

/* eslint-disable no-console */
const API_KEY = import.meta.env.VITE_APP_GOOGLE_CLASSROOM_KEY;
const CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLASSROOM_CLIENT_ID;
const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.rosters',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.profile.emails'
].join(' ');
// NOTE: Ensure that the OAuth consent screen in the Google Cloud Console is properly configured
// with the required permissions for Google Classroom API access. All requested scopes must be added
// and approved in the OAuth consent screen, otherwise, the authentication process will fail with 
// 'invalid_scope' errors. Visit https://console.cloud.google.com/apis/credentials/consent for setup.

const GoogleClassroom = () => {
  const [classroomData, setClassroomData] = useState<any>({});
  const [googleToken, setGoogleToken] = useState<any>(null);
  const [clientToken, setClientToken] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch courses, rosters, and coursework for the authenticated user.
   */
  async function listCourses() {
    setLoading(true);
    let response;

    try {
      // @ts-expect-error
      response = await gapi.client.classroom.courses.list({
        pageSize: 10,
      });

      const courses = response?.result?.courses;
      setClassroomData(courses);

      if (courses && courses.length > 0) {
        for (const course of courses) {
          // Fetch rosters (students and teachers) for each course
          // @ts-expect-error
          const roster = await gapi.client.classroom.courses.students.list({
            courseId: course.id,
          });
          console.log('Roster:', roster);

          // Fetch coursework for each course
          // @ts-expect-error
          const coursework = await gapi.client.classroom.courses.courseWork.list({
            courseId: course.id,
          });
          console.log('Coursework:', coursework);
        }
      }
    } catch (err: any) {
      console.log('#Error', err);
    } finally {
      setLoading(false);
    }

    // const courses = response?.result?.courses;
    // setClassroomData(courses);
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
   * Sign in the user upon button click, handle token persistence.
   */
  function handleAuthClick() {
    clientToken.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        throw resp;
      } else {
        // Store token and set token expiration handling
        setGoogleToken(gapi.client.getToken());
        localStorage.setItem('googleToken', JSON.stringify(gapi.client.getToken()));
      }
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
   * Sign out the user upon button click, clear token.
   */
  function handleSignoutClick() {
    const token = gapi.client.getToken();

    if (token !== null) {
      // @ts-ignore
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken(null);
      setGoogleToken(null);
      setClassroomData([]);
      localStorage.removeItem('googleToken');
    }
  }

  /**
   * Persist token from local storage on load.
   */
  useEffect(() => {
    const savedToken = localStorage.getItem('googleToken');
    if (savedToken) {
      setGoogleToken(JSON.parse(savedToken));
      gapi.client.setToken(JSON.parse(savedToken));
    }
  }, []);

  useEffect(() => {
    gapiLoaded();
    gisLoaded();
  }, [API_KEY, CLIENT_ID, SCOPES]);

  const ADMIN_TOOLBAR_MENU = googleToken
    ? [
        {
          title: 'Sign out',
          icon: <LogoutIcon />,
        },
      ]
    : [
        {
          title: 'Sign in and sync',
          icon: <CloudSyncIcon />,
        },
      ];

  const handleToolbarAction = async (title: string) => {
    if (title === 'Sign in and sync') {
      handleAuthClick();
    }
    if (title === 'Sign out') {
      handleSignoutClick();
    }
  };

  useEffect(() => {
    console.log('watch token', googleToken);
    if (googleToken) {
      console.log('has google token');
      listCourses();
    }
  }, [googleToken]);

  // useEffect(() => {
  //   setGoogleToken(gapi?.client?.getToken());
  // }, [gapi?.client?.getToken()]);

  // useEffect(() => {
  //   const unloadCallback = (event) => {
  //     event.preventDefault();
  //     event.returnValue = '';
  //     return '';
  //   };

  //   window.addEventListener('beforeunload', unloadCallback);
  //   return () => window.removeEventListener('beforeunload', unloadCallback);
  // }, []);

  return (
    <RouteLayout>
      <HeaderMenus
        title="Google Classroom"
        menuArray={ADMIN_TOOLBAR_MENU}
        handleToolbarAction={handleToolbarAction}
      />
      {loading ? (
        <Loader />
      ) : (
        <div>
          {/* <div className="px-5 py-2 rounded-md border-2 border-[#4A9D2D]">
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
                //   onClick={() => setopenClassroomPopup(true)}
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
        </div> */}
          <GoogleClassroomList data={classroomData} />
        </div>
      )}
    </RouteLayout>
  );
};

export default GoogleClassroom;
