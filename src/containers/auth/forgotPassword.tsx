import { useState } from 'react';
import UiAnimate from '@shared/animatedLayout/uiAnimate';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import Input from '@shared/form/Input';
import Button from '@component/button/button';
import { useRAWApi } from '@shared/api/useApi';
import { useNavigate, useParams } from 'react-router-dom';
import toast from '@shared/toast';
import { resetPasswordSchema } from './schema';

export default function ForgotPassword(): JSX.Element {
  const [showSetPassword, setShowSetPassword] = useState<boolean>(false);
  const [username, setUsername] = useState<string | undefined>();
  const { schoolName } = useParams();
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    setError
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'all'
  });

  const { isLoading, mutate } = useRAWApi({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: showSetPassword
      ? 'users-service/reset/confirm-reset-password/'
      : 'users-service/reset/send-reset-password-code/',
    onSuccess: async ({ data }: any) => {
      if (!showSetPassword) {
        setShowSetPassword(true);
        toast('success', data.message);
      } else {
        await toast('success', data.message);
        navigate(schoolName ? `'/${schoolName}/auth'` : '/auth', {
          replace: true,
          state: {
            resetPassword: 'Password Reset Successfully'
          }
        });
      }
    },
    onError: ({ response }: any) => {
      if (response.data.message) {
        toast('error', response.data.message);
        setError('confirmation_code', { type: 'root.serverError', message: response.data.message });
      } else if (response.data.exception_msg) {
        toast('error', response.data.exception_msg);
      } else if (!showSetPassword) {
        toast('error', response.data.errors.username);
        Object.keys(response.data.errors).map((errorKey: string) => (
          setError(errorKey as any, { type: 'root.serverError', message: response.data.errors[errorKey] })
        ));
      }
    }
  });

  const onSubmit = (values: any) => mutate(values);

  return (
    <UiAnimate type="slideIn">
      <form className="h-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="text-xs font-light pt-5 relative pb-16">
          {showSetPassword
            ? (
              <UiAnimate type="slideIn">
                <p className="text-sm text-sunlight">Reset Password?</p>
              </UiAnimate>
            )
            : (
              <span className="text-sm">
                <p className="text-sunlight">Forgot Password?</p>
                <p>
                  Don’t worry! It happens. Please enter the email address
                  associated with your account.
                </p>
              </span>
            )}
        </div>
        <div className="flex flex-col justify-between gap-y-4">
          {showSetPassword
            ? (
              <>
                <Input
                  control={control}
                  name="password"
                  variant="standard"
                  icon={false}
                  placeholder="New Password"
                  size="medium"
                  type="password"
                />
                <Input
                  control={control}
                  name="confirm_password"
                  variant="standard"
                  icon={false}
                  placeholder="Confirm Password"
                  size="medium"
                  type="password"
                />
                <Input
                  control={control}
                  name="confirmation_code"
                  variant="standard"
                  icon={false}
                  placeholder="OTP"
                  size="medium"
                  type="number"
                />
              </>
            )
            : (
              <Input
                control={control}
                name="username"
                variant="standard"
                icon={false}
                placeholder="Username/Mobile number"
                size="medium"
              />
            )}
          <div className="pt-10 flex flex-col items-center justify-center">
            <Button
              loading={isLoading}
              type="submit"
              sx={{
                width: '135px'
              }}
            >
              {
                showSetPassword ? 'Save' : 'Submit'
              }
            </Button>
            <p className="text-xs text-gray-500 font-normal text-center py-5">
              Terms of use. Privacy policy.
            </p>
          </div>
        </div>
      </form>
    </UiAnimate>
  );
}
