import { NAME_REGEX, NAME_REGEX_MESSAGE } from '@constants/constants';
import * as yup from 'yup';
// .matches(/[\d]/, 'invalid')

export default yup.object().shape({
  assignment_name: yup.string().min(1, 'Please Enter Assessment Name').max(100, 'Too Long').matches(NAME_REGEX, NAME_REGEX_MESSAGE),
  select_course: yup.string().min(1, 'Please Select Course'),
  // select_grade: yup.string().min(1, 'Please Select Grade'),
  documents: yup.mixed()
});
