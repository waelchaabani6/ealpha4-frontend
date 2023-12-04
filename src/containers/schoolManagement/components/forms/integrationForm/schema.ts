import * as yup from 'yup';

export const thirdPartySchemaSchool = yup.object().shape({
  number_of_users: yup.string().min(1, 'required').matches(/[\d]/, 'invalid'),
  number_of_branches: yup.string().min(1, 'required').matches(/[\d]/, 'invalid'),
  storage: yup.string().min(1, 'required').matches(/[\d]/, 'invalid'),
  third_party_integrations: yup.array().of(
    yup.object().shape({
      flag: yup.bool(),
      name: yup.string().min(1, 'required'),
      role: yup.array().when('flag', {
        is: (exists: boolean) => exists,
        then: yup.array().min(1, 'required'),
        otherwise: yup.array().notRequired()
      }),
      number_of_licenses: yup.string().when('flag', {
        is: (exists: boolean) => exists,
        then: yup.string().min(1, 'required').matches(/[\d]/, 'invalid'),
        otherwise: yup.string().notRequired()
      })
    })
  )
});

export const thirdPartySchemaBranch = yup.object().shape({
  third_party_integrations: yup.array().of(
    yup.object().shape({
      flag: yup.bool(),
      name: yup.string().min(1, 'required'),
      role: yup.array().when('flag', {
        is: (exists: boolean) => exists,
        then: yup.array().min(1, 'required'),
        otherwise: yup.array().notRequired()
      }),
      number_of_licenses: yup.string().when('flag', {
        is: (exists: boolean) => exists,
        then: yup.string().min(1, 'required').matches(/[\d]/, 'invalid'),
        otherwise: yup.string().notRequired()
      })
    })
  )
});

export const integrationSchema = yup.object().shape({
  thirdthird_party_integrations: yup.array().of(
    yup.object().shape({
      contact_name: yup.string().min(1, 'required'),
      contact_email: yup.string().email('invalid').min(1, 'required'),
      contact_mobile: yup.string().min(1, 'required').matches(/[\d]/, 'invalid'),
      contact_designation: yup.string().min(1, 'required'),
      contact_others: yup.string().min(1, 'required')
    })
  )
});
