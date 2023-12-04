import { ALPHABET_AND_SPACE, ALPHABET_AND_SPACE_MESSAGE, FAX_REGEX, FAX_REGEX_MESSAGE, NAME_REGEX, NAME_REGEX_MESSAGE, PHONE_NUMBER_REGEX, URL_REGEX, ZIP_REGEX, ZIP_REGEX_MESSAGE } from '@constants/constants';
import * as yup from 'yup';

export default yup.object().shape({
  school_name: yup.string().min(1, 'Please Enter School Name').matches(NAME_REGEX, NAME_REGEX_MESSAGE),
  // school_url: yup.string().url('Invalid Url').notRequired(),
  school_url: yup.lazy((value) => {
    if (value) {
      return yup.string()
        .matches(URL_REGEX, 'Invalid URL');
    }
    return yup.string().notRequired();
  }),
  area_academic_year: yup.string().min(1, 'Please Select Area Academic Year'),
  activation_start_date: yup.string().min(1, 'Please Select Start Date').typeError('Please Select Start Date'),
  activation_end_date: yup.string().min(1, 'Please Select End Date').typeError('Please Select End Date'),
  academic_type: yup.string().min(1, 'Please Select Academic Type'),
  number_of_terms_or_semester: yup.string().min(1, 'Required').matches(/^[0-4]{1,}$/, 'Invalid'),
  academic_information: yup.array().of(
    yup.object().shape({
      term_or_semester_number: yup.number().required(),
      from_date: yup.string().min(1, 'Please Select From Date').typeError('Please Select From Date'),
      to_date: yup.string().min(1, 'Please Select To Date').typeError('Please Select To Date')
    })
  ),
  profile_information: yup.object().shape({
    email: yup.string().email('Please Enter Valid Email').min(1, 'Please Enter Email'),
    website: yup.string().required('Website is required').matches(URL_REGEX, 'Invalid URL'),
    // website: yup.lazy((value) => {
    //   if (value) {
    //     return yup.string()
    //       .matches(URL_REGEX, 'Invalid URL');
    //   }
    //   return yup.string().notRequired();
    // }),
    address: yup.string().notRequired(),
    city: yup.string(),
    zipcode: yup.lazy((value) => {
      if (value) {
        return yup.string().max(12, 'Too long')
          .matches(ZIP_REGEX, ZIP_REGEX_MESSAGE);
      }
      return yup.string().notRequired().nullable();
    }),

    country: yup.string().min(1, 'Please Select Country'),
    phone_number: yup.lazy((value) => {
      if (value) {
        return yup.string()
          .min(10, 'too short')
          .max(12, 'too long')
          .matches(PHONE_NUMBER_REGEX, 'Invalid Phone Number');
      }
      return yup.string().required('Please Enter Phone Number');
    }),
    fax: yup.lazy((value) => {
      if (value) {
        return yup.string()
          .max(12, 'too long')
          .matches(FAX_REGEX, FAX_REGEX_MESSAGE);
      }
      return yup.string().notRequired();
    }),
    school_type: yup.string().notRequired()
  }),
  contact_information: yup.array().of(
    yup.object().shape({
      contact_name: yup.string().min(1, 'Please Enter Name').matches(ALPHABET_AND_SPACE, ALPHABET_AND_SPACE_MESSAGE),
      contact_email: yup.string().email('Please Enter Valid Email').min(1, 'Please Enter Email'),
      contact_mobile: yup.lazy((value) => {
        if (value) {
          return yup.string()
            .min(10, 'too short')
            .max(12, 'too long')
            .matches(PHONE_NUMBER_REGEX, 'Invalid Phone Number');
        }
        return yup.string().required('Please Enter Mobile Number');
      }),
      contact_designation: yup.string(),
      contact_others: yup.string(),
      contact_mobile_alternate: yup.lazy((value) => {
        if (value) {
          return yup.string()
            .min(10, 'too short')
            .max(12, 'too long')
            .matches(PHONE_NUMBER_REGEX, 'Invalid Phone Number');
        }
        return yup.string();
      }),
      contact_email_alternate: yup.string().email('Please Enter Valid Email')
    })
  ),
  logo: yup.mixed(),
  documents: yup.mixed()
});
