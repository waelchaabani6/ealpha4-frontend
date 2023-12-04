/* eslint-disable import/prefer-default-export */
import { ONLY_NUMBERS, ONLY_NUMBERS_MESSAGE } from '@constants/constants';
import * as yup from 'yup';

export const extendExpiryDateSchema = yup
  .object()
  .shape({
    extend_start_date: yup.string().min(1, 'Please Select Start Date').typeError('Please Select Start Date'),
    extend_end_date: yup.string().min(1, 'Please Select End Date').typeError('Please Select End Date'),
    exten_add_edit_license: yup.string().required('Add/Edit License is required.').matches(ONLY_NUMBERS, ONLY_NUMBERS_MESSAGE).max(10, 'Too long')
  })
  .required();

export const extendLicenseSchema = yup
  .object()
  .shape({
    current_number_license: yup.string().required('Required.'),
    add_edit_number_license: yup.string().required('Add/Edit License is required.').matches(ONLY_NUMBERS, ONLY_NUMBERS_MESSAGE).max(10, 'Too long')
  })
  .required();
