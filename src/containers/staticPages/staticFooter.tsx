import React from 'react';
// import Logo from '@images/logo1.svg';
import Logo from '@images/logo-orange-2.png';
import FaceboolLogo from '@images/staticPageImages/facebook.svg';
import YoutubeLogo from '@images/staticPageImages/youtube.svg';
import LinkedInLogo from '@images/staticPageImages/linkedin.svg';
import TwitterLogo from '@images/staticPageImages/twitter.svg';
import GooglePlay from '@images/staticPageImages/google-play.svg';
import AppleStore from '@images/staticPageImages/app-store.svg';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';

const socials = [
  {
    link: 'https://www.facebook.com/alphapublishinguae/',
    img: FaceboolLogo,
  },
  {
    link: 'https://twitter.com/alphapubuae',
    img: TwitterLogo,
  },
  {
    link: 'https://www.linkedin.com/company/alpha-publishing/',
    img: LinkedInLogo,
  },
  {
    link: 'https://www.youtube.com/channel/UC8IdHfyD30ttE4iWueLsxKQ',
    img: YoutubeLogo,
  },
];

export default function StaticFooter() {
  const { userId } = useSelector(selectUser);
  if (userId) {
    return null;
  }
  return (
    <div className="bg-black text-white p-8 cmsFooter">
      <div className="grid grid-cols-1 gap-y-4 md:grid-cols-3 md:gap-x-8 mb-2">
        <div className="space-y-2">
          <img
            src={Logo}
            loading="lazy"
            alt=""
            width="200px"
            className="mb-10"
          />
          <p>
            eAlpha connects students and teachers, offering them a
            collaborative, interactive, and mobile learning environment that
            impacts every aspect of education.
          </p>
          <div className="flex gap-x-2 py-10">
            {socials.map((itm: any) => (
              <a
                key={itm.link}
                target="_blank"
                href={itm.link}
                rel="noreferrer"
              >
                <img src={itm.img} loading="lazy" alt="Facebool" />
              </a>
            ))}
          </div>
        </div>
        <div className="space-y-2 max-w-[150px]" style={{ margin: '0 auto' }}>
          <h4 className="text-xl font-semibold">Quick Links</h4>
          <ul className="space-y-2 list-disc pl-4 text-sm">
            <li>
              <Link to="/faq">About eAlpha</Link>
            </li>
            <li>
              <Link to="/contact-us">Contact Us</Link>
            </li>
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms-of-use">Term of Use</Link>
            </li>
          </ul>
        </div>
        <div className="mb-4" style={{ margin: '0 auto' }}>
          <h4 className="text-xl font-semibold">Download Our App</h4>
          <div className="flex h-10 gap-2 pt-2">
            <a
              target="_blank"
              href="https://play.google.com/store/apps/details?id=com.ealpha.tsp.edu&pcampaignid=web_share"
              rel="noreferrer"
            >
              <img
                className="scale-75"
                src={GooglePlay}
                alt="Google Play Store"
              />
            </a>
            <a
              target="_blank"
              href="https://apps.apple.com/us/app/ealpha4/id6451000301"
              rel="noreferrer"
            >
              <img className="scale-75" src={AppleStore} alt="App Store" />
            </a>
          </div>
        </div>
      </div>
      <p>Powered by eAlpha4tech Copyright © 2024 Alpha Publishing.</p>
    </div>
  );
}
