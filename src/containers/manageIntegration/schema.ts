import * as yup from 'yup';

export default yup
  .object()
  .shape({
    name: yup.string().min(1, 'Please enter integration name'),
    integration_type: yup.string().min(1, 'Please select integration type'),
    assigned_roles: yup.array().of(
      yup.string().min(1, 'Please select assigned to')
    ),
    integration_through: yup.string().min(1, 'Please select integration through'),
    description: yup.string().min(1, 'Please enter description'),
    logo_url: yup.mixed().required('Please select logo')
  })
  .required();
