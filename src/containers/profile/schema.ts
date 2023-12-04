import { ALPHABET_AND_SPACE, ALPHABET_AND_SPACE_MESSAGE, PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE, PHONE_NUMBER_REGEX, ZIP_REGEX, ZIP_REGEX_MESSAGE } from '@constants/constants';
import * as yup from 'yup';

export const basicDetailsSchema = yup
  .object()
  .shape({
    first_name: yup.string().required('Please enter First Name').max(50, 'Too Long').matches(ALPHABET_AND_SPACE, ALPHABET_AND_SPACE_MESSAGE),
    last_name: yup.string().required('Please enter Last Name').max(50, 'Too Long').matches(ALPHABET_AND_SPACE, ALPHABET_AND_SPACE_MESSAGE),
    phone_number: yup.string().max(15, 'Too long').matches(PHONE_NUMBER_REGEX, 'Invalid Phone Number'),
    alternative_phone_number: yup.lazy((value) => {
      if (value) {
        return yup.string()
          .max(15, 'Too long')
          .matches(PHONE_NUMBER_REGEX, 'Invalid Phone Number');
      }
      return yup.string();
    }),
    email: yup.string().email('Please enter a valid email').max(100, 'Too Long').required('Email is required'),
    alternate_email: yup.string().email('Please enter a valid email'),
    address: yup.string().max(200, 'Too Long'),
    street: yup.string().max(200, 'Too Long'),
    area: yup.string().max(200, 'Too Long'),
    city: yup.string(),
    zip_code: yup.string().matches(ZIP_REGEX, ZIP_REGEX_MESSAGE),
    country: yup.string().required('Please Select Country')
  })
  .required();

export const changePasswordSchema = yup
  .object()
  .shape(
    {
      old_password: yup.string().max(50, 'Too Long').required('Please Enter Old Password').matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
      new_password: yup.string().when('user', {
        is: (exists: string) => !exists,
        then: yup
          .string()
          .max(50, 'Too Long')
          .required('Please Enter New Password')
          .matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
        otherwise: yup.string().optional()
      }),
      confirm_password: yup.string().when('user', {
        is: (exists: string) => !exists,
        then: yup
          .string()
          .required('Please Enter Confirm New Password')
          .max(50, 'Too Long')
          .matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE)
          .oneOf([yup.ref('new_password'), null], 'Passwords Must Match'),
        otherwise: yup.string().optional()
      })
    }
  )
  .required();
