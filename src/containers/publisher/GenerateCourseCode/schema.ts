import * as yup from 'yup';

export default yup
  .object()
  .shape({
    code_type: yup.string().required('Code Type is required'),
    code_name: yup.string().required('Course code name is required.'),
    license_count: yup.string().required('License number is required.'),
    start_date: yup.date().required('Start date is required.').nullable(),
    end_date: yup.date().required('End date is required').nullable()
  })
  .required();
