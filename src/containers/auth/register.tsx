import Button from '@component/button/button';
import { GENDERS } from '@constants/constants';
import { yupResolver } from '@hookform/resolvers/yup';
import UiAnimate from '@shared/animatedLayout/uiAnimate';
import Input from '@shared/form/Input';
import RadioGroup from '@shared/form/RadioGroup';
import Select from '@shared/form/Select';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Navigate, useMatches } from 'react-router-dom';
import { registerSchema } from './schema';

type Inputs = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  profile_type: string;
  gender: 'male' | 'female';
}

export default function Register() {
  const match = useMatches();
  const {
    handleSubmit,
    control,
    setError,
    setValue,
    watch
  } = useForm<Inputs>({
    resolver: yupResolver(registerSchema)
  });
  // if (!match[0].params?.schoolName) {
  //   return <Navigate to={match[0].pathname} />;
  // }
  const onSubmit: SubmitHandler<Inputs> = (values) => false;
  return (
    <UiAnimate type="slideIn">
      <p className="text-xs font-light text-center py-4">
        Welcome Please Register
      </p>
      <form className="w-full h-full overflow-auto space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center flex-col md:flex-row md:gap-x-4 gap-y-4">
          <Input
            control={control}
            name="first_name"
            variant="outlined"
            icon={false}
            placeholder="First Name"
            size="small"
          />
          <Input
            control={control}
            name="last_name"
            variant="outlined"
            icon={false}
            placeholder="Last Name"
            size="small"
          />
        </div>
        <Input
          control={control}
          name="email"
          variant="outlined"
          icon={false}
          placeholder="Email"
          size="small"
        />
        <Input
          control={control}
          name="password"
          variant="outlined"
          type="password"
          placeholder="Password"
          size="small"
        />
        <Input
          control={control}
          name="phone_number"
          variant="outlined"
          icon={false}
          placeholder="Phone Number"
          size="small"
        />
        <div className="flex items-center flex-col md:flex-row md:gap-x-4 gap-y-4">
          <Select
            control={control}
            name="profile_type"
            dataArray={[]}
          />
          <div className="self-end w-full">
            <RadioGroup
              required={true}
              control={control}
              name="gender"
              dataArray={GENDERS}
            />
          </div>

        </div>
        <Button
          sx={{
            width: '100%'
          }}
        >
          Register
        </Button>
        <p className="text-gray-500 text-xs font-normal text-center my-4">
          Terms of use. Privacy policy.
        </p>
      </form>
    </UiAnimate>
  );
}
