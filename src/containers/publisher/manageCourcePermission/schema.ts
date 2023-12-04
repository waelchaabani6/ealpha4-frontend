/* eslint-disable import/prefer-default-export */
import * as yup from 'yup';

export const schoolManagePermission = yup
  .object()
  .shape({
    assigned_to: yup.string().required('Please select assign'),
    users_id: yup.array().min(1, 'Please select a user').required('Please select a user.')
  })
  .required();

export const managePermission = yup
  .object()
  .shape({
    school_id: yup.string().required('Please select school'),
    branch_id: yup.string().optional(),
    code_name: yup.string().required('Course code is required.'),
    assigned_to: yup.string().required('Please select assign'),
    users_id: yup.array().min(1, 'Please select a user').required('Please select a user.')
  })
  .required();
