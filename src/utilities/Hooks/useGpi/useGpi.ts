/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable prefer-template */
/* eslint-disable consistent-return */
/* eslint-disable comma-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable operator-linebreak */
/* eslint-disable no-console */
/* eslint-disable quotes */
// Source: https://github.com/nicholasglazer/useGapi
import { useEffect, useState } from 'react';
import useScript from './useScript';

export default function useGapi({
  apiKey,
  clientId,
  discoveryDocs,
  scope,
  script_url,
}: {
  apiKey: string;
  clientId: string;
  discoveryDocs?: string[];
  scope?: string;
  cookiePolicy?: string;
  script_url: string;
}) {
  if (!clientId) throw new Error('Please provide required fields: "clientId"');
  if (!apiKey) throw new Error('Please provide required fields: "apiKey"');

  const [client, setClient] = useState<any>({ undefined });
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Initial profile object
  const [profile, setProfile] = useState({
    auth: {
      tokenObj: undefined,
      tokenId: undefined,
      accessToken: undefined,
      scope: undefined,
      expiresAt: undefined,
    },
    p: {
      googleId: undefined,
      email: undefined,
      fullName: undefined,
      givenName: undefined,
      familyName: undefined,
      imageUrl: undefined,
    },
  });
  // status: "idle", "ready", "loading", "error"
  const status = useScript(script_url);
  if (status === 'error') {
    console.warn("Google script can't be loaded");
    return;
  }
  // Create user profile with auth metadata.
  const createUserProfileObject = (currentUser?: any) => {
    const user =
      currentUser || window.gapi.auth2.getAuthInstance().currentUser.get();
    const basicProfile = user.getBasicProfile();
    const auth = user.getAuthResponse();
    return {
      auth,
      p: {
        googleId: basicProfile.getId(),
        email: basicProfile.getEmail(),
        fullName: basicProfile.getName(),
        givenName: basicProfile.getGivenName(),
        familyName: basicProfile.getFamilyName(),
        imageUrl: basicProfile.getImageUrl(),
      },
    };
  };
  // Update sign-in status according to listener.
  const updateSigninStatus = (isUserSignedIn: any) => {
    if (isUserSignedIn) {
      setIsSignedIn(isSignedIn);
      const gProfile = createUserProfileObject();
      setProfile(gProfile);
    }
  };
  // Runs every time script status changes
  useEffect(() => {
    // Check if google script is ready.
    if (status === 'ready') {
      let listenerContext: any;
      window.gapi.load('client:auth2', () => {
        window.gapi.client
          .init({
            apiKey,
            clientId,
            discoveryDocs,
            scope,
          })
          .then(() => {
            console.log('entered');
            setClient(window.gapi.client);
            const auth = window.gapi.auth2.getAuthInstance();
            listenerContext = auth.isSignedIn.listen(updateSigninStatus);
            // Handle the initial sign-in state.
            updateSigninStatus(auth.isSignedIn.get());
          })
          .catch((err) => console.log(err));
      });
      return () => {
        // TODO change to listenerContext?.remove
        if (listenerContext?.remove) listenerContext?.remove();
      };
    }

    // return null;
  }, [status]);
  // Sign in function, accepting google options
  const signIn = async (options: any) => {
    console.log('signed in');
    try {
      const profileObject = await window.gapi.auth2
        .getAuthInstance()
        .signIn(options);
      console.log('profile object', profileObject);
      return createUserProfileObject(profileObject);
    } catch (err) {
      console.log(err);
      return err;
    }
  };
  // Sign out function
  const signOut = async () => {
    try {
      await window.gapi.auth2.getAuthInstance().signOut();
      // @ts-expect-error
      window.gapi.auth2.disconnect();
      return false;
    } catch (err) {
      return err;
    }
  };

  return { signIn, signOut, isSignedIn, profile, client };
}
