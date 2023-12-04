import { AloneLoader } from '@shared/loader';
import { selectUser } from '@shared/store/userSlice';
import UseGetProfile from '@utility/Hooks/UseGetProfile';
import { ComponentType, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default (Component: ComponentType) => (props: any) => {
  const [loader, setLoader] = useState<boolean>(true);
  const { isLoggedIn, userId } = useSelector(selectUser);
  const { getUser } = UseGetProfile();

  useEffect(() => {
    if (isLoggedIn && !userId) {
      getUser();
    }
  }, [isLoggedIn, userId]);
  useEffect(() => {
    if ((userId && loader) || !isLoggedIn) {
      setLoader(false);
    }
  }, [isLoggedIn, userId]);
  return loader
    ? (
      <div className="h-screen w-screen grid place-items-center">
        <AloneLoader size={40} />
      </div>
    )
    : <Component />;
};
