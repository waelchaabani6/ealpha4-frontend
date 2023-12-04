import * as yup from 'yup';

export default yup
  .object()
  .shape({
    group_name: yup.string().required('Please Enter Group Name'),
    group_members: yup.array().of(
      yup.number()
    ).min(1, 'Please Select')
      .required('Please Select'),
    class_id: yup.string().required('Please select')
  });
