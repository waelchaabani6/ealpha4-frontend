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
const SCOPES = 'https://www.googleapis.com/auth/classroom.courses';

const GoogleClassroom = () => {
  const [classroomData, setClassroomData] = useState<any>({});
  const [googleToken, setGoogleToken] = useState<any>(null);
  const [clientToken, setClientToken] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Print the names of the first 10 courses the user has access to. If
   * no courses are found an appropriate message is printed.
   */
  async function listCourses() {
    setLoading(true);
    let response;

    try {
      // @ts-expect-error
      response = await window.gapi.client.classroom.courses.list({
        pageSize: 10,
      });
    } catch (err: any) {
      console.log('#Error', err);
    } finally {
      setLoading(false);
    }

    const courses = response?.result?.courses;
    setClassroomData(courses);
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

    if (token !== null) {
      // @ts-ignore
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken(null);
      setGoogleToken(null);
      setClassroomData([]);
    }
  }

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

  useEffect(() => {
    setGoogleToken(gapi?.client?.getToken());
  }, [gapi?.client?.getToken()]);

  useEffect(() => {
    const unloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', unloadCallback);
    return () => window.removeEventListener('beforeunload', unloadCallback);
  }, []);

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
