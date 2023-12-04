import * as yup from 'yup';
// .matches(/[\d]/, 'invalid')

const selectClassYupSchema = yup.object().shape({
  assignment_name: yup.string().min(1, 'Please Enter Assignment Name'),
  assignment_start_date: yup.string().min(1, 'Please Select Assignment Strat Date').typeError('Please Select Assignment Strat Date'),
  assignment_due_date: yup.string().min(1, 'Please Select Assignment Due Date').typeError('Please Select Assignment Due Date'),
  select_course: yup.string().min(1, 'Please Select Course'),
  select_volume: yup.string().min(1, 'Please Select Volume'),
  select_type: yup.string().min(1, 'Please Select Components'),
  select_class: yup.string().min(1, 'Please Select Value'),
  documents: yup.mixed()
});

const selectClassArrayYupSchema = yup.object().shape({
  assignment_name: yup.string().min(1, 'Please Enter Assignment Name'),
  assignment_start_date: yup.string().min(1, 'Please Select Assignment Strat Date').typeError('Please Select Assignment Strat Date'),
  assignment_due_date: yup.string().min(1, 'Please Select Assignment Due Date').typeError('Please Select Assignment Due Date'),
  select_course: yup.string().min(1, 'Please Select Course'),
  select_volume: yup.string().min(1, 'Please Select Volume'),
  select_type: yup.string().min(1, 'Please Select Components'),
  select_class_array: yup.array().min(1, 'Please Select Value'),
  documents: yup.mixed()
});

export { selectClassYupSchema, selectClassArrayYupSchema };
