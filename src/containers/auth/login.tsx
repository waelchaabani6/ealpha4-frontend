import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import UiAnimate from '@shared/animatedLayout/uiAnimate';
import Button from '@component/button/button';
import Input from '@shared/form/Input';
import Checkbox from '@component/checkbox';
import { FormControlLabel } from '@mui/material';
import { useRAWApi } from '@shared/api/useApi';
import { useDispatch } from 'react-redux';
import { setLoggedIn, setUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import { loginSchema } from './schema';

type Inputs = {
  username: string;
  password: string;
}

export default function Login(): JSX.Element {
  const { state: locationState, pathname } = useLocation();
  const { schoolName } = useParams();
  const navigate = useNavigate();
  const [remember, setRemember] = useState<boolean>(false);
  
  useEffect(() => {
    const savedUser = localStorage.getItem('rememberUser');
    if (savedUser) {
      const usr = JSON.parse(savedUser);
      if (usr && usr?.remember) {
        setValue('username', usr?.username || '');
        setValue('password', usr?.password || '');
        setRemember(usr.remember);
      }
    }
    setFocus('username');
  }, []);

  useEffect(() => {
    if (locationState) {
      toast('success', locationState.message);
    }
    return () => {
      window.history.replaceState({}, document.title);
    };
  }, [locationState]);

  const dispatch = useDispatch();
  const {
    handleSubmit,
    control,
    setError,
    setValue,
    watch,
    setFocus
  } = useForm<Inputs & { school_name: string }>({
    resolver: yupResolver(loginSchema)
  });

  const { isLoading, mutate, reset } = useRAWApi({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: 'users-service/login/',
    onSuccess: ({ data: { response: { data } } }: any) => {
      localStorage.setItem('token', `Bearer ${data.AccessToken}`);
      localStorage.setItem('RefreshToken', `${data.RefreshToken}`);
      if (remember) {
        localStorage.setItem('rememberUser', JSON.stringify({
          username: watch('username'),
          password: watch('password'),
          remember
        }));
      } else {
        localStorage.removeItem('rememberUser');
      }
      window.location.reload();
      // dispatch(setLoggedIn(true));
    },
    onError: ({ response }: any) => {
      reset();
      if (response?.data?.exception_msg) {
        toast('error', response?.data?.exception_msg);
      } else if (response?.data?.errors?.non_field_errors[0] === 'Reset password') {
        toast('info', 'Reset password');
        navigate('forgot-password');
      } else if (response?.data?.errors?.non_field_errors[0] === 'The username or password is incorrect') {
        toast('error', 'The username or password is incorrect');
        [
          {
            type: 'root.serverError',
            name: 'username',
            message: 'Please Enter Valid Username'
          },
          {
            type: 'root.serverError',
            name: 'password',
            message: 'Please Enter Valid Password'
          }
        ].forEach(({ name, type, message }) => (
          setError(name as any, { type, message })
        ));
      } else {
        toast('error', response.data.message);
      }
    }
  });

  const onSubmit: SubmitHandler<Inputs & { school_name: string }> = (values) => mutate(values);

  return (
    <UiAnimate type="slideIn">
      <form className="overflow-auto" onSubmit={handleSubmit(onSubmit)}>
        <br />
        <p className="text-xs font-light text-center relative">
          Welcome back! Please login to your account.
        </p>
        <br />
        <br />
        <div className="flex flex-col justify-between gap-y-2">
          <Input
            control={control}
            name="username"
            variant={schoolName ? 'outlined' : 'standard'}
            icon={false}
            placeholder="Username"
            size={schoolName ? 'small' : 'medium'}
          />
          <Input
            control={control}
            name="password"
            variant={schoolName ? 'outlined' : 'standard'}
            icon={false}
            placeholder="Password"
            size={schoolName ? 'small' : 'medium'}
            type="password"
          />
          <div className="flex items-center justify-between py-2">
            <FormControlLabel control={<Checkbox checked={remember} onChange={(_, checked) => setRemember(checked)} />} label="Remember Me" />
            <Link to={`${pathname}/forgot-password`} className="text-sunlight">
              Forgot Password?
            </Link>
          </div>
          <div className="pt-10">
            <div className="flex items-center justify-center gap-x-5  ">
              {
                schoolName && (
                  <Button
                    disabled={isLoading}
                    type="button"
                    variant="outlined"
                    sx={{
                      width: '135px'
                    }}
                  >
                    Register
                  </Button>
                )
              }

              <Button
                sx={{
                  width: '135px'
                }}
                disabled={isLoading}
                loading={isLoading}
              >
                Login
              </Button>
            </div>
            <div className={`flex text-xs font-normal py-4 ${schoolName ? 'justify-between' : 'justify-center'}`}>
              {
                schoolName && <Link to={`${pathname}/register`} className="text-black">Don’t have an Account ? Sign Up</Link>
              }

              <div className="text-gray-500 flex gap-x-2">
                <Link to="/terms-of-use">Terms of use.</Link>
                <Link to="/privacy-policy">Privacy policy.</Link>
              </div>
            </div>
            
          </div>
        </div>
      </form>
      <div className="flex justify-center mt-2">
              <Button
                sx={{
                  width: '200px'
                }}
                variant="contained"
                onClick={() => navigate('/system-requirements')}
              >
                System Requirements
              </Button>
            </div>
      <div className="shadow-xl bg-white p-4 rounded-lg">
        <p className="text-xs font-light mb-2">
          We made a recent update to the LMS Application both Web and Mobile APPS. Aimed at enhancing your overall experience, providing you with a more reliable browsing experience and better performance.
        </p>
        <div className="text-xs font-light mb-3">
          If you encounter any login issues, please follow the steps below.
          We also recommend uninstalling the current app version and installing the latest version of the eAlpha4 mobile app from the Android and iOS Stores.
        </div>

        <div className="text-xs font-light mb-2">
          {`We're committed to providing you with the best possible experience, and this update is just one of the many ways we're striving to achieve that goal. As always, if you have any questions, concerns, or feedback, don't hesitate to reach out to us.`}
        </div>
        <div className="text-xs font-light mb-2">
          <a
            href="mailto:digital.accounts@alphapublishing.com, technical.support@alphapublishing.com"
            className="text-blue-500 underline ml-1"
          >
            digital.accounts@alphapublishing.com, technical.support@alphapublishing.com
          </a>
        </div>
        <div className="text-xs font-light mb-2">
          Your satisfaction is our top priority!
        </div>
      </div>
    </UiAnimate>
  );
}
