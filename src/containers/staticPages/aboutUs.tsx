import RouteLayout from '@layout/routeLayout';
import React from 'react';
import Banner from '@images/staticPageImages/About-Us_Banner.jpg';
import AboutUsImage from '@images/staticPageImages/about-us.jpg';
import Logo from '@images/logo1.svg';
import { useGet } from '@shared/api/useApi';
import YellowLogo from '@images/staticPageImages/logo-yellow.png';
import TabLetImage from '@images/staticPageImages/Tab-Phone (1).png';
import StaticHeader from './staticHeader';
import StaticFooter from './staticFooter';

export default function AboutUs() {
  const { isLoading: pageLoading, data: pageContent } = useGet({
    baseURL: import.meta.env.VITE_APP_CMS_SERVICE_URL,
    url: `cms-service/page/3/`
  });
  return (
    <RouteLayout navBack={false} overflow={true}>
      <StaticHeader />
      {/* eslint-disable-next-line react/no-danger */}
      <div className="mt-24" dangerouslySetInnerHTML={{ __html: pageContent?.data?.response?.content }} />
      {/* <img src={Banner} alt="contact us" className="h-24 mt-24 md:h-auto w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 p-8">
        <div className="flex items-center px-20">
          <img src={AboutUsImage} alt="" loading="lazy" className="" />
        </div>
        <div className="space-y-4 px-4">
          <img src={Logo} alt="" loading="lazy" className="mt-4" />
          <p>
            <strong> eAlpha </strong>
            connects students and teachers, offering them a collaborative, interactive, and mobile teaming environment that impacts every aspect of education. Features and benefits include:
          </p>
          <ul className="pl-4 list-disc space-y-2">
            <li>Easy to use and intuitive eLearning platform.</li>
            <li>An engaging classroom environment with inclusion of tools to add and record student response to content, supported by a real-time poll feature.</li>
            <li>Ability to connect students and teachers using Windows, Mac OS, Linux, iOS, and Android devices with various screen resolutions.</li>
            <li>Intuitive assignment functionality with full capabilities for reporting and monitoring.</li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 p-8 mt-10">
        <div className="flex items-center px-20">
          <img src={TabLetImage} alt="" loading="lazy" className="" />
        </div>
        <div className="space-y-4 px-4">
          <img src={YellowLogo} alt="" loading="lazy" className="mt-4 h-20" />
          <p>
            <strong> eAlpha </strong>
            is an offline extension to eAlpha eLearning Platform enabling users to work with interactive content on any of their devices in an offline environment. Some of the features and benefits include:
          </p>
          <ul className="pl-4 list-disc space-y-2">
            <li>A set of offline applications allowing access to interactive content without Internet connection.</li>
            <li>Available for Windows, OSX, iOS and Android.</li>
            <li>Offers the on-demand download of individual lessons as well as whole courses and assignments.</li>
            <li>A complete synchronization of results produced both online and offline.</li>
          </ul>
        </div>
      </div> */}
      <StaticFooter />
    </RouteLayout>
  );
}
