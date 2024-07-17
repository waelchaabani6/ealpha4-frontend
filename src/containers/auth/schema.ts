/* eslint-disable comma-dangle */
import { PHONE_NUMBER_REGEX } from '@constants/constants';
import * as yup from 'yup';

export const loginSchema = yup
  .object()
  .shape({
    username: yup.string().min(1, 'Please enter username'),
    password: yup.string().min(1, 'Please enter password'),
  })
  .required();

export const registerSchema = yup.object().shape({
  first_name: yup.string().required('Please Enter First Name'),
  last_name: yup.string().required('Please Enter Last Name'),
  email: yup
    .string()
    .email('Invalid Email')
    .required('Please Enter First Name'),
  password: yup
    .string()
    .matches(/[\d]/, 'Invalid Password')
    .min(1, 'Password is required'),
  phone_number: yup.lazy((value) => {
    if (value) {
      return yup.string().matches(PHONE_NUMBER_REGEX, 'Invalid Phone Number');
    }
    return yup.string().required('Please Enter Phone Number');
  }),
  profile_type: yup.string().required('Please select Profile Type'),
  gender: yup.string().oneOf(['male', 'female'], 'Please Select Gender'),
});

export const resetPasswordSchema = yup
  .object()
  .shape({
    username: yup.string().when({
      is: (exists: string) => !exists,
      then: yup.string().required('Please Enter Username'),
      otherwise: yup.string().optional(),
    }),
    password: yup.string().when('username', {
      is: (exists: string) => !!exists,
      then: yup.string().min(1, 'Please Enter New Password'),
      otherwise: yup.string().optional(),
    }),
    confirm_password: yup.string().when('username', {
      is: (exists: string) => !!exists,
      then: yup
        .string()
        .min(1, 'Please Enter Confirm Password')
        .oneOf([yup.ref('password'), null], 'Passwords Must Match'),
      otherwise: yup.string().optional(),
    }),
    confirmation_code: yup.string().when('username', {
      is: (exists: string) => !!exists,
      then: yup.string().min(1, 'Please Enter OTP').matches(/[\d]/, 'invalid'),
      otherwise: yup.string().optional(),
    }),
  })
  .required();
