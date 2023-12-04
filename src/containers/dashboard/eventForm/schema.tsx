import * as yup from 'yup';

export default yup
  .object()
  .shape({
    event_name: yup.string().min(1, 'Please enter event name'),
    start_date: yup.string().min(1, 'Please Select start date').typeError('Please Select starty date'),
    end_date: yup.string().min(1, 'Please Select end date').typeError('Please Select end date'),
    description: yup.string().min(1, 'Please enter description')
  })
  .required();
