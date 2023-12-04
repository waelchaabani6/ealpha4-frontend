/* eslint-disable import/prefer-default-export */
import * as yup from 'yup';

export const extendLicenseSchema = yup
  .object()
  .shape({
    start_date: yup.string().min(1, 'required').typeError('Required'),
    end_date: yup.string().min(1, 'required').typeError('Required')
  })
  .required();
