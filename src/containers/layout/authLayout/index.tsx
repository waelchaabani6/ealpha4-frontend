import { Link, Outlet } from 'react-router-dom';
import React from 'react';
import { ReactComponent as Image3 } from '@images/login_image_3.svg';
import { ReactComponent as Image4 } from '@images/login_image_4.svg';
import { ReactComponent as Logo1 } from '@images/logo1.svg';
import { ReactComponent as Logo2 } from '@images/logo2.svg';
import UiAnimate from '@shared/animatedLayout/uiAnimate';
import Loader from '@shared/loader';
import { useSelector } from 'react-redux';
import { selectUser } from '@shared/store/userSlice';

export default function Index() {
  const { isLoggedIn } = useSelector(selectUser);
  if (isLoggedIn) {
    return <Loader />;
  }
  return (
    <UiAnimate>
      <div className="w-screen h-screen flex justify-center relative overflow-hidden">
        <div className="absolute w-full bottom-[9rem] left-0 -z-10">
          <div className="hidden md:flex items-center justify-between relative top-11">
            <Image3 className="opacity-0 sm:opacity-100" />
            <Image4 className="relative top-12" />
          </div>
          <div className="h-12 bg-sunlight mt-1" />
        </div>
        <div
          className="shadow-xl h-full w-full md:w-[574.5px] bg-white
           border-t-[16px] border-sunlight flex flex-col justify-between"
        >
          <div className="px-4 sm:px-20 h-full flex flex-col pt-8 overflow-hidden">
            <div className="flex justify-between mb-4">
              <Link to="/">
                <Logo1 />
              </Link>
              <Logo2 />
            </div>
            <hr className="bg-black h-px" />
            <div className="flex-1 overflow-auto">
              <React.Suspense fallback={<Loader />}>
                <Outlet />
              </React.Suspense>
            </div>
          </div>
        </div>
      </div>
    </UiAnimate>
  );
}
