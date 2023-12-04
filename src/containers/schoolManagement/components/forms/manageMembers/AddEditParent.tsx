import Button from '@component/button/button';
import { ALPHABET_AND_SPACE, ALPHABET_AND_SPACE_MESSAGE, GENDERS, ONLY_ALPHABETS_MESSAGE, ONLY_ALPHABETS_REGEX, PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE, PHONE_NUMBER_REGEX, USERNAME_REGEX, USERNAME_REGEX_MESSAGE } from '@constants/constants';
import { BRANCH, SCHOOL, SCHOOL_MANAGEMENT } from '@constants/routes';
import { yupResolver } from '@hookform/resolvers/yup';
import RouteLayout from '@layout/routeLayout';
import MuiButton from '@mui/material/Button';
import UiAnimate from '@shared/animatedLayout/uiAnimate';
import { useGet, usePatch, usePost } from '@shared/api/useApi';
import Input from '@shared/form/Input';
import RadioGroup from '@shared/form/RadioGroup';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectSchoolData } from '@shared/store/schoolSlice';
import toast from '@shared/toast';
import { passwordGenerator, userRole } from '@utility/utility';
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

interface ParentType {
  relationship: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  nationality: string;
  gender: string;
}
interface FormInputs {
  user_name: string;
  password: string;
  parent: ParentType[];
}

export default function ParentForm() {
  const navigate = useNavigate();
  const { id, branchId, userID, schoolName } = useParams();
  const { schoolData, branchData } = useSelector(selectSchoolData);
  const [redirectTo, setRedirectTo] = useState(true);
  const userServiceBaseURL = import.meta.env.VITE_APP_USER_SERVICE_URL;

  let shape = {
    user_name: yup.string().matches(USERNAME_REGEX, USERNAME_REGEX_MESSAGE).required('Username is required'),
    password: yup.string().matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
    parent: yup.array().of(
      yup.object().shape({
        relationship: yup.string().required('Please Enter Realtionship').matches(ONLY_ALPHABETS_REGEX, ONLY_ALPHABETS_MESSAGE),
        first_name: yup.string().required('Please Enter First Name').matches(ALPHABET_AND_SPACE, ALPHABET_AND_SPACE_MESSAGE),
        last_name: yup.string().required('Please Enter Last Name').matches(ALPHABET_AND_SPACE, ALPHABET_AND_SPACE_MESSAGE),
        email: yup.string().email('Invalid Email').required('Please Enter Email'),
        nationality: yup.string().max(20, 'Maximum 20 characters are allowed').matches(ONLY_ALPHABETS_REGEX, ONLY_ALPHABETS_MESSAGE),
        phone_number: yup.string().matches(PHONE_NUMBER_REGEX, 'Invalid phone number.').max(12, 'Phone number cannot be more than 12 ')
      })
    )
  };
  if (userID) {
    shape = {
      ...shape,
      password: yup.string().when('password', {
        is: (val: any) => val?.length,
        then: yup.string().matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
        otherwise: yup.string().optional()
      })
    };
  }

  const parentFormSchema = yup
    .object()
    .shape(shape, [
      ['password', 'password']
      // ['alternative_phone_number', 'alternative_phone_number']
      // ['nationality', 'nationality']
    ]);

  const { control, handleSubmit, setValue, clearErrors, reset, setError } = useForm<FormInputs>({
    resolver: yupResolver(parentFormSchema),
    mode: 'all',
    defaultValues: {
      parent: [
        {
          relationship: '',
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
          nationality: '',
          gender: ''
        }
      ]
    }
  });
  const name = 'parent';
  const { fields, append, remove } = useFieldArray({
    control,
    name
  });

  const addNew = useCallback(() => {
    append({
      relationship: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      nationality: '',
      gender: ''
    }, { shouldFocus: true });
  }, [fields]);

  const removeHandler = (index: number) => {
    remove(index);
    document.getElementById(`${name}_${index - 1}`)?.scrollIntoView();
  };

  const onSubmit = (values: any) => {
    const payload = {
      ...values,
      school_id: id || branchData?.school_id
    };
    if (branchData) {
      payload.branch_id = branchData.id;
    }
    if (userID) {
      mutateUpdateParent(payload);
    } else {
      mutateAddParent(payload);
    }
  };
  const generateRandomPass = () => {
    const pass = passwordGenerator();
    setValue('password', pass);
    clearErrors('password');
  };

  const handleErrorResponse = (errorObj: any) => {
    Object.keys(errorObj).forEach((key1: any) => {
      if (key1 === 'parent') {
        errorObj[key1].forEach((key2: any, value: any) => {
          Object.keys(key2).forEach((key3: any) => {
            setError(`parent.${value}.${key3}` as any, { type: 'manual', message: key2?.[key3]?.[0] });
          });
        });
      } else {
        setError(key1, { type: 'manual', message: errorObj[key1][0] });
      }
    });
  };

  const handleToolbarAction = () => {
    let navigateLink = `/${schoolName}/dashboard/${id}/bulk-upload/parent`;
    if (userRole().isSchoolAdmin || userRole().isBranchAdmin) {
      if (branchId) {
        navigateLink = `/${schoolName}/dashboard/branch/${branchId}/bulk-upload/parent`;
      }
      navigate(navigateLink);
    } else {
      navigate(`${SCHOOL_MANAGEMENT}/${branchId ? BRANCH : SCHOOL}/${id || branchId}/bulk-upload/parent`);
    }
  };

  // -----------------------------API-------------------------------
  // Get Parent Details
  const { isRefetching: parentDetailLoading, refetch: fetchParentDetail } = useGet({
    baseURL: userServiceBaseURL,
    url: `users-service/parent-registration/${userID}/`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response;
      reset({
        parent: resp?.parent?.map((item: any) => ({
          id: item.id,
          relationship: item.relationship ?? '',
          first_name: item.first_name ?? '',
          last_name: item.last_name ?? '',
          email: item.email ?? '',
          phone_number: item.phone_number ?? '',
          nationality: item.nationality ?? '',
          gender: item.gender
        })),
        user_name: resp?.user_name
      });
    },
    onError: () => { },
    enabled: false
  });

  // Post Add New Parent
  const { isLoading: LoadAddParent, mutate: mutateAddParent } = usePost({
    baseURL: userServiceBaseURL,
    url: `users-service/parent-registration/`,
    onSuccess: (response: any) => {
      toast('success', 'Parent added successfully');
      if (redirectTo) {
        // let navigateTo = `${SCHOOL_MANAGEMENT}/${branchId ? `${BRANCH}/${branchId}` : `${SCHOOL}/${id}`}/${MANAGE_MEMBERS}?tabType=Parents`;
        // if (userRole().isSchoolAdmin) {
        //   navigateTo = `/${schoolName}/dashboard/${branchId || id}/manage-members?tabType=Parents`;
        // }
        setTimeout(() => {
          navigate(-1);
        }, 500);
      } else {
        reset();
      }
    },
    onError: ({ response }: any) => {
      toast('error', response?.status === 400 ? 'Parent already exists' : response?.statusText || 'Error');
      handleErrorResponse(response?.data?.errors);
    }
  });

  // Update Parent
  const { isLoading: loadingUpdateParent, mutate: mutateUpdateParent } = usePatch({
    baseURL: userServiceBaseURL,
    url: `users-service/parent-registration/${userID}/`,
    onSuccess: (response: any) => {
      toast('success', 'Parent Updated successfully');
      if (redirectTo) {
        // let navigateTo = `${SCHOOL_MANAGEMENT}/${branchId ? `${BRANCH}/${branchId}` : `${SCHOOL}/${id}`}/${MANAGE_MEMBERS}?tabType=Parents`;
        // if (userRole().isSchoolAdmin) {
        //   navigateTo = `/${schoolName}/dashboard/${branchId || id}/manage-members?tabType=Parents`;
        // }
        setTimeout(() => {
          navigate(-1);
        }, 500);
      }
    },
    onError: ({ response }: any) => {
      toast('error', response?.status === 400 ? 'Parent already exists' : response?.statusText || 'Error');
      handleErrorResponse(response?.data?.errors);
    }
  });

  // ----------------------------------------------END API---------------------------------

  useEffect(() => {
    if (userID) {
      fetchParentDetail();
    }
  }, [userID]);

  if (parentDetailLoading) {
    return (<Loader />);
  }

  return (
    <RouteLayout>
      <div className="flex items-center justify-between">
        <HeaderMenus
          title={userID ? 'Edit Parent' : 'Add Parent'}
          subtitle={`School : ${schoolData?.school_name || branchData?.school_data?.school_name}`}
          subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ''}
        />
        <Button onClick={() => { handleToolbarAction(); }}>Bulk Upload</Button>
      </div>
      <div className="mt-6 px-6 bg-white scroll-shadow rounded-md border border-accent">
        <div className="flex justify-between items-center ">
          <h4 className="text-base font-bold py-4">Login Information1</h4>
          <p className="text-sm text-red-500 opacity-80">All (*) marked fields are mandatory</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 grid grid-cols-1 gap-y-4 md:grid-cols-3 md:gap-x-7 mb-4">
            <Input control={control} name="user_name" label="Username" required={true} />
            <Input control={control} name="password" label="Password" required={!userID} />
            <div className="pt-8 w-full">
              <MuiButton
                variant="outlined"
                onClick={generateRandomPass}
                sx={{
                  borderColor: 'var(--accent)',
                  color: 'black',
                  height: '40px',
                  width: '100%',
                  fontWeight: 500
                }}
              >
                Generate Password

              </MuiButton>
            </div>
          </div>
          <h4 className="text-base font-bold py-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {
              fields.map((field, index) => (
                <UiAnimate type="fadeIn" key={field?.id}>
                  <div className="w-full bg-[#F7F7F7] flex flex-col gap-y-7 p-4 rounded-md">
                    <Input required={true} control={control} name={`${name}[${index}].relationship`} label="Relationship Type" />
                    <Input required={true} control={control} name={`${name}[${index}].first_name`} label="First Name" />
                    <Input required={true} control={control} name={`${name}[${index}].last_name`} label="Last Name" />
                    <Input required={true} control={control} name={`${name}[${index}].email`} label="Email Id" />
                    <Input required={true} control={control} name={`${name}[${index}].phone_number`} label="Contact Number" />
                    <Input required={true} control={control} name={`${name}[${index}].nationality`} label="Nationality" />
                    <div className="flex items-center justify-between">
                      <RadioGroup
                        label="Gender"
                        control={control}
                        name={`${name}[${index}].gender`}
                        dataArray={GENDERS}
                      />
                      {
                        (index > 0) && (
                          <div className="col-span-3 flex justify-end items-center">
                            <p
                              role="presentation"
                              onClick={() => removeHandler(index)}
                              className="w-8 h-8 grid place-items-center text-white text-2xl cursor-pointer
                   font-bold rounded-full bg-red-500"
                            >
                              -
                            </p>
                          </div>
                        )
                      }
                    </div>
                  </div>
                </UiAnimate>
              ))
            }
          </div>
          <div className="stickyBottom space-x-5 flex justify-end items-center">
            <p className="text-base text-accent font-medium underline cursor-pointer" onClick={addNew}>Add Alternative Contact</p>
            {
              !userID
                ? <Button loading={LoadAddParent || loadingUpdateParent} variant="outlined" onClick={() => setRedirectTo(false)}>Save and Add New</Button>
                : null
            }
            <Button loading={LoadAddParent || loadingUpdateParent} onClick={() => setRedirectTo(true)}>{userID ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </RouteLayout>
  );
}
