import * as yup from 'yup';

export const addNewAdminSchema = yup
  .object()
  .shape({
    admin_type: yup.string().required('required'),
    branch_id: yup.string().required('required'),
    exisitng_user: yup.bool().oneOf([true, false]).default(false),
    first_name: yup.string().when('exisitng_user', {
      is: false,
      then: yup.string().required('required'),
      otherwise: yup.string().optional()
    }),
    last_name: yup.string().when('exisitng_user', {
      is: false,
      then: yup.string().required('required'),
      otherwise: yup.string().optional()
    }),
    user_name: yup.string().when('exisitng_user', {
      is: false,
      then: yup.string().required('required'),
      otherwise: yup.string().optional()
    }),
    email: yup.string().when('exisitng_user', {
      is: false,
      then: yup.string().email().required('required'),
      otherwise: yup.string().email().optional()
    }),
    phone_number: yup.mixed().when('exisitng_user', {
      is: false,
      then: yup.number().typeError('Invalid').required('required'),
      otherwise: yup.string().optional()
    }),
    password: yup.string().when('exisitng_user', {
      is: false,
      then: yup.string().matches(/[\d]/, 'Invalid').min(1, 'required'),
      otherwise: yup.string().optional()
    }),
    admin_user: yup.string().when('exisitng_user', {
      is: true,
      then: yup.string().required('required'),
      otherwise: yup.string().optional()
    })
  });

export const test = 90;
