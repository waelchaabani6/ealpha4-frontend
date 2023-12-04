import Logo2 from '@images/logo2.svg';
import Logo1 from '@images/logo1.svg';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { usePost } from '@shared/api/useApi';
import { resetStoreBranch, resetStoreSchool, selectSchoolData } from '@shared/store/schoolSlice';
import { forceLogout, resetUser, selectUser, setUserLoader } from '@shared/store/userSlice';
import { userRole } from '@utility/utility';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useClickAway } from 'react-use';
import toast from '@shared/toast';

export default function Index(): JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const user = useSelector(selectUser);
  const ref = React.useRef(null);
  const dispatch = useDispatch();

  useClickAway(ref, () => {
    setOpen(false);
  });

  const { mutate } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: 'users-service/logout/',
    onSuccess: (res: any) => {
      localStorage.removeItem('token');
      localStorage.removeItem('RefreshToken');
      dispatch(resetUser());
      dispatch(resetStoreSchool());
      dispatch(resetStoreBranch());
      dispatch(forceLogout(true));
      window.location.reload();
    },
    onError: ({ response }: any) => {
      toast('error', response?.data?.exception_msg || response.data.message);
      dispatch(setUserLoader(false));
    }
  }) as any;

  const logoutHandler = () => {
    dispatch(setUserLoader(true));
    mutate();
  };
  return (
    <div className="h-14 flex items-center justify-between px-4">
      <div className="flex-1 h-full py-2">
        <div className="h-full w-max flex items-center">
          <img src={Logo2} alt="" className={`${(schoolData?.logo || branchData?.school_data?.logo) ? '' : 'mr-9'} h-full w-[100px]`} />
          {!userRole().isSuperAdmin
            && <img src={schoolData?.logo || branchData?.school_data?.logo || Logo1} alt="" className="h-full w-[100px] object-contain" />}
        </div>
      </div>
      <div className="w-max h-full flex items-center gap-x-3 justify-between">
        <div className="hidden md:flex items-center text-xs divide-x">
          {
            !userRole().isSuperAdmin && (
              <>
                <Link className="px-2 hover:font-semibold hover:text-accent" to="/alpha-program">Alpha Programs</Link>
                <Link className="px-2 hover:font-semibold hover:text-accent" to="/get-app">Get App</Link>
                <Link className="px-2 hover:font-semibold hover:text-accent" to="/faq">FAQ</Link>
                <Link className="px-2 hover:font-semibold hover:text-accent" to="/how-to-use">How to Use eAlpha</Link>
                <Link className="px-2 hover:font-semibold hover:text-accent" to="/contact-us">Contact Us</Link>
              </>
            )
          }
        </div>
        <p className="pl-[100px] font-semibold text-[15px] text-lime-700">{`${user?.first_name} ${user?.last_name}`}</p>
        {/* {
          !userRole().isSuperAdmin && (
            <NotificationsIcon className="cursor-pointer hover:text-gray-500" />
          )
        } */}
        {/* <Link to={`/${schoolName}/my-notification`}>
        </Link> */}
        <button
          type="button"
          className="h-8 w-8 rounded-full grid place-items-center overflow-hidden border bg-sandgray"
          onClick={() => setOpen(!open)}
        >
          {
            user?.profile_picture
              ? (
                <img
                  loading="lazy"
                  src={user.profile_picture}
                  alt="user"
                  className="h-full w-full object-cover"
                />
              )
              : <AccountCircle className="h-full w-full scale-125 opacity-50" />
          }

        </button>
      </div>
      <AnimatePresence>
        {
          open && (
            <motion.div
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{
                type: 'spring',
                stiffness: 700,
                damping: 35,
                delay: 0.1
              }}
              ref={ref}
              className="w-32 h-max p-1 absolute flex text-base cursor-pointer
      flex-col gap-y-2 right-4 top-10 z-50 bg-sandgray shadow-md rounded-md font-medium"
              onClick={() => setOpen(false)}
            >
              <Link to="profile" className="p-1 rounded-md hover:bg-linegray">Profile</Link>
              <div role="presentation" onClick={logoutHandler} className="p-1 rounded-md hover:bg-linegray">Logout</div>
            </motion.div>
          )
        }
      </AnimatePresence>
    </div>
  );
}
