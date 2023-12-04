import * as yup from 'yup';

export const addCategorySchema = yup
  .object()
  .shape({
    name: yup.string().required('Please Enter Category')
  });

export const addSubjectSchema = yup
  .object()
  .shape({
    selection: yup.string().required('Please Select Any Item.'),
    content: yup.string().required('This field is Required.')
  });
