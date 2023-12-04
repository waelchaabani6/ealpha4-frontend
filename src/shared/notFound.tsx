import React from 'react';
import NotFoundImage from '@images/404.svg';
import { Link, useParams } from 'react-router-dom';
import { userRole } from '@utility/utility';
import { useSelector } from 'react-redux';
import { selectUser } from './store/userSlice';
import UiAnimate from './animatedLayout/uiAnimate';

type Props = {
  message?: string;
}

export default function NotFound(props: Props) {
  const currentOrganization = localStorage.getItem('organization');
  let navigatePath = '/';
  if (!(userRole().isSuperAdmin || userRole().isSubAdmin)) {
    navigatePath = `/${currentOrganization}`;
  }

  return (
    <UiAnimate>
      <div
        className="relative h-screen w-screen overflow-hidden flex items-center justify-center "
      >
        <div className="h-full w-full absolute top-0 left-0 rotate-90 md:rotate-0">
          <img src={NotFoundImage} alt="page not found" className="h-full w-full" />
        </div>
        <div className="relative text-center w-full h-max flex items-center justify-center flex-col gap-y-4">
          <p className="text-9xl font-extrabold text-accent">404</p>
          <p className="text-4xl font-normal">{props?.message || 'Page Not Found'}</p>
          <p>
            The
            {props?.message ? ' school ' : ' page '}
            you are looking for does not seem to exist
          </p>
          {
            !props?.message && <Link to={navigatePath} className="bg-accent text-white h-[40px] w-max p-[8px] rounded-md">Back to Home</Link>
          }
        </div>
      </div>
    </UiAnimate>
  );
}
