/* eslint-disable import/prefer-default-export */
import { ONLY_NUMBERS, PASSWORD_REGEX, PHONE_NUMBER_REGEX } from '@constants/constants';
import * as yup from 'yup';

export const pushNotificationSchema = yup
  .object()
  .shape({
    school_id: yup.string().required('Please select school'),
    branch_id: yup.string(),
    roles: yup.array().min(1, 'Please select a user').required('Please select a user.'),
    class_id: yup.string().required('Please select class'),
    start_date: yup.date().nullable().required('Please select start date.'),
    end_date: yup.date().nullable().min(
      yup.ref('start_date'),
      'End date can\'t be before start date'
    ).required('Please select end date.'),
    recurring_on: yup.string().required('Please select'),
    repeating_every: yup.array().min(1, 'Please select days').required('Please select days'),
    attached_file: yup.mixed().optional(),
    description: yup.string().min(1, 'Please enter description').required('Please enter description')
  })
  .required();

export const emailPushNotificationSchema = yup
  .object()
  .shape({
    school_id: yup.string().required('Please select school'),
    branch_id: yup.string(),
    roles: yup.array().min(1, 'Please select a user').required('Please select a user.'),
    class_id: yup.string().required('Please select class'),
    recurring_on: yup.string().required('Please select'),
    repeating_every: yup.array().min(1, 'Please select days').required('Please select days'),
    start_date: yup.date().nullable().required('Please select start date.'),
    end_date: yup.date().nullable().min(
      yup.ref('start_date'),
      'End date can\'t be before start date'
    ).required('Please select end date.'),
    email: yup.string().when('csv_file', {
      is: (value: string) => !value,
      then: yup.string().email('Enter valid email').required('Please enter email'),
      otherwise: yup.string().optional()
    }),
    csv_file: yup.mixed().optional(),
    mail_subject: yup.string().required('Please enter subject'),
    mail_body: yup.string().min(1, 'Please enter email body').required('Please enter email body')
  })
  .required();

export const smsNotificationSchema = yup
  .object()
  .shape({
    school_id: yup.string().required('Please select school'),
    branch_id: yup.string(),
    // roles: yup.array().min(1, 'Please select a user').required('Please select a user.'),
    roles: yup.array().of(
      yup.string()
    ).required('Please select user'),
    class_id: yup.string().required('Please select class'),
    contact_number_prirority: yup.string().min(1, 'Please select priority').required('Please select priority'),
    contact_number: yup
      .array()
      .of(
        yup.object().shape({
          country_code: yup.string().required('Please select country'),
          number: yup.lazy((value) => {
            if (value) {
              return yup.string()
                .max(12, 'Too long')
                .matches(PHONE_NUMBER_REGEX, 'Invalid Phone Number');
            }
            return yup.string().required('Please  enter contact number');
          })
        })
      ).required(),
    sms_body: yup.string().required('Please enter SMS')
  })
  .required();
export const emailServerSettingSchema = yup
  .object()
  .shape({
    login: yup.string().required('Please enter login'),
    password: yup
      .string()
      .required('Please enter password')
      .matches(PASSWORD_REGEX, 'Password must contain at least 8 characters, one uppercase, one number and one special case character'),
    host_name: yup.string().required('Please enter Host Name'),
    username: yup.string().required('Please enter Username'),
    port: yup
      .string()
      .required('Please enter port number')
      .matches(ONLY_NUMBERS, 'Invalid port number'),
    smtp_host_name: yup.string().required('Please enter SMTP Host Name'),
    smtp_username: yup.string().required('Please enter SMTP Username'),
    smtp_password: yup
      .string()
      .required('Please enter smtp password'),
    is_secure_connection: yup.boolean(),
    use_auth: yup.boolean(),
    school_id: yup.string().required('Please select school')
  })
  .required();
