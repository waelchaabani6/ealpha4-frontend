import React from 'react';

const FAQ = React.lazy(() => import('@containers/staticPages/FAQ'));
const AlphaPrograms = React.lazy(() => import('@containers/staticPages/alphaPrograms'));
const HowToUse = React.lazy(() => import('@containers/staticPages/howToUse'));
const PrivacyPolicy = React.lazy(() => import('@containers/staticPages/privacyPolicy'));
const TermsOfUse = React.lazy(() => import('@containers/staticPages/termsOfUse'));
const ContactUs = React.lazy(() => import('@containers/staticPages/contactUs'));
const GetApp = React.lazy(() => import('@containers/staticPages/getApp'));
const AboutUs = React.lazy(() => import('@containers/staticPages/aboutUs'));

export default [
  {
    path: '/alpha-program',
    element: <AlphaPrograms />
  },
  {
    path: '/contact-us',
    element: <ContactUs />
  },
  {
    path: '/FAQ',
    element: <FAQ />
  },
  {
    path: '/how-to-use',
    element: <HowToUse />
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicy />
  },
  {
    path: '/terms-of-use',
    element: <TermsOfUse />
  },
  {
    path: '/get-app',
    element: <GetApp />
  },
  {
    path: '/about-us',
    element: <AboutUs />
  }
];
