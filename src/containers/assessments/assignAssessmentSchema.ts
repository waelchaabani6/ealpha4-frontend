import { ONLY_NUMBERS, ONLY_NUMBERS_MESSAGE } from '@constants/constants';
import * as yup from 'yup';

export default yup
  .object()
  .shape({
    start_date: yup.date().required('Start date is required.').nullable(),
    end_date: yup.date().required('End date is required').nullable(),
    duration: yup.string().typeError('Duration must be a number').max(3, 'Too Long').required('Duration is required')
      .matches(ONLY_NUMBERS, ONLY_NUMBERS_MESSAGE)
  })
  .required();
