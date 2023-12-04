import UiAnimate from '@shared/animatedLayout/uiAnimate';
import React from 'react';
import Header from '@containers/header';
import Sidebar from '@containers/sidebar';
import Loader from '@shared/loader';
import { Link, Outlet } from 'react-router-dom';
import layoutHOC from '@layout/layoutHOC';
import moment from 'moment';
import LayoutWrapper from '@layout/layoutWrapper';

export default function LayoutOne() {
  return (
    <LayoutWrapper>
      <UiAnimate>
        <div className="h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <div className="flex-1 bg-gray-200 overflow-auto h-full px-6 py-3">
              <div id="app-top" />
              {/* //this is used to scroll tab to the top */}
              <React.Suspense fallback={<Loader />}>
                <Outlet />
              </React.Suspense>
            </div>
          </div>
          <div className="h-7 px-4 text-xs bg-black text-white flex items-center justify-between">
            <p>Powered by eAlpha4tech Copyright © 2024 Alpha Publishing.</p>
            {/* <p>Privacy Policy | Terms of Use.</p> */}
            <div className="flex gap-x-1">
              <Link to="/privacy-policy">Privacy Policy.</Link>
              |
              <Link to="/terms-of-use">Terms of use.</Link>
            </div>
          </div>
        </div>
      </UiAnimate>
    </LayoutWrapper>
  );
}

// export default layoutHOC(LayoutOne);
