import React from 'react';
import RouteLayout from '@layout/routeLayout';
import StaticImage from '@images/staticPageImages/Tab-Phone.png';
import Logo from '@images/logo1.svg';
import GooglePlay from '@images/staticPageImages/google-play.svg';
import AppleStore from '@images/staticPageImages/app-store.svg';
import StaticHeader from './staticHeader';

export default function GetApp() {
  return (
    <RouteLayout navBack={false} overflow={true}>
      <StaticHeader />
      <h2 className="text-3xl my-4 mt-28 pl-6">Get App</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
        <div className="grid place-items-center">
          <img src={StaticImage} alt="app" className="h-[400px] aspect-auto" />
        </div>
        <div>
          <img src={Logo} alt="eAlpha" />
          <p className="text-gray-800 pt-3">eAlpha is an offline extension to eAlpha eLearning Platform, enabling users to work with interactive content on any of their devices in an offline environment. Some of the features and benefits include:</p>
          <ul className="list-disc pl-5 pt-2 space-y-2 text-gray-800">
            <li>A set of offline applications allowing access to interactive content without Internet connection.</li>
            <li>Available for iOS and Android.</li>
            <li>Offers the on-demand download of individual lessons as well as whole courses and assignments.</li>
            <li>A complete synchronization of results produced both online and offline.</li>
          </ul>
          <div className="flex h-10 gap-2 pt-2">
            <a target="_blank" href="https://play.google.com/store/apps/details?id=com.ealpha.tsp.edu&pcampaignid=web_share" rel="noreferrer">
              <img className="scale-75" src={GooglePlay} alt="Google Play Store" />
            </a>
            <a target="_blank" href="https://apps.apple.com/us/app/ealpha4/id6451000301" rel="noreferrer">
              <img className="scale-75" src={AppleStore} alt="App Store" />
            </a>
          </div>
        </div>
      </div>
    </RouteLayout>
  );
}
