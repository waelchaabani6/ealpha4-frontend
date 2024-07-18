/* eslint-disable import/no-extraneous-dependencies */
// SignInToClassroomForm

/* eslint-disable comma-dangle */
import * as React from 'react';

import Input from '@shared/form/Input';
import { useForm } from 'react-hook-form';
import Button from '@component/button/button';
import { Checkbox, FormControlLabel } from '@mui/material';
import { Link } from 'react-router-dom';

export default function SignInToClassroomForm() {
  const [remember, setRemember] = React.useState<boolean>(false);

  // eslint-disable-next-line operator-linebreak
  const { handleSubmit, control, setError, setValue, watch, setFocus } =
    useForm({
      // resolver: yupResolver(loginSchema)
    });

  return (
    <div className="max-w-[450px] m-auto">
      <h2 className="mb-6 text-center text-[25px] font-semibold">
        Sign in to Google Classroom
      </h2>
      <p className="text-center text-sm max-w-[320px] m-auto">
        Please sign in to Google Classroom with your school email and password
      </p>
      <form>
        <div className="flex flex-col justify-between gap-y-2 mt-14">
          <Input
            control={control}
            name="email"
            icon={false}
            placeholder="Email"
          />
          <Input
            control={control}
            name="password"
            icon={false}
            placeholder="Password"
            type="password"
          />
          <div className="flex items-center justify-between py-2">
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(_, checked) => setRemember(checked)}
                />
              }
              label="Remember Me"
            />
            <Link
              //  to={`${pathname}/forgot-password`}
              to="/"
              className="text-sunlight"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <div className="pt-10">
          <div className="flex items-center justify-center gap-x-5  ">
            <Button
              sx={{
                width: '135px',
              }}
              // disabled={isLoading}
              // loading={isLoading}
              // onClick={signIn}
            >
              Login
            </Button>
          </div>
        </div>

        <div className="flex text-xs font-normal py-4 justify-center">
          <div className="text-gray-500 flex gap-x-2">
            <Link to="/terms-of-use">Terms of use.</Link>
            <Link to="/privacy-policy">Privacy policy.</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
