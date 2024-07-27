/* eslint-disable comma-dangle */
/* eslint-disable import/no-named-default */
import Button from '@component/button/button';
import Checkbox from '@component/checkbox';
import FileSelect from '@component/fileUpload';
import { CustomInput } from '@component/input';
import {
  ALPHABET_AND_SPACE,
  ALPHABET_AND_SPACE_MESSAGE,
  GENDERS,
  NAME_REGEX,
  PASSWORD_REGEX,
  PASSWORD_REGEX_MESSAGE,
  PHONE_NUMBER_REGEX,
  USERNAME_REGEX,
  USERNAME_REGEX_MESSAGE,
} from '@constants/constants';
import { BRANCH, SCHOOL, SCHOOL_MANAGEMENT } from '@constants/routes';
import { yupResolver } from '@hookform/resolvers/yup';
import RouteLayout from '@layout/routeLayout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import MuiButton from '@mui/material/Button';
import { useGet, usePatch, usePost } from '@shared/api/useApi';
import Input from '@shared/form/Input';
import { default as CustomRadio } from '@shared/form/RadioGroup';
import Loader from '@shared/loader';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import PageTitle from '@shared/pageTitle';
import { selectSchoolData } from '@shared/store/schoolSlice';
import toast from '@shared/toast';
import { passwordGenerator, userRole } from '@utility/utility';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

type FormInputTypes = {
  password?: any;
  user_name?: any;
  first_name?: any;
  last_name?: any;
  email?: any;
  phone_number?: any;
  nationality?: any;
  gender?: any;
};

export default function AddEditTeacher() {
  const imageRef = useRef<any>();
  const navigate = useNavigate();
  const { id, branchId, userID, schoolName } = useParams();
  const { schoolData, branchData } = useSelector(selectSchoolData);
  let shape = {
    user_name: yup
      .string()
      .matches(USERNAME_REGEX, USERNAME_REGEX_MESSAGE)
      .required('Username is required'),
    password: yup.string().matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
    first_name: yup
      .string()
      .required('First name is required')
      .matches(ALPHABET_AND_SPACE, ALPHABET_AND_SPACE_MESSAGE),
    last_name: yup
      .string()
      .required('Last name is required')
      .matches(ALPHABET_AND_SPACE, ALPHABET_AND_SPACE_MESSAGE),
    email: yup.string().email().required('Email is required'),
    phone_number: yup.string().when('phone_number', {
      is: (val: any) => val?.length,
      then: yup
        .string()
        .matches(PHONE_NUMBER_REGEX, 'Invalid phone number.')
        .max(12, 'Phone number cannot be more than 12 '),
      otherwise: yup.string().optional(),
    }),
    nationality: yup.string().when('nationality', {
      is: (val: any) => val?.length,
      then: yup
        .string()
        .matches(ALPHABET_AND_SPACE, ALPHABET_AND_SPACE_MESSAGE)
        .max(20, 'Maximum 20 characters are allowed'),
      otherwise: yup.string().optional(),
    }),
  };
  if (userID) {
    shape = {
      ...shape,
      password: yup.string().when('password', {
        is: (val: any) => val?.length,
        then: yup.string().matches(PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE),
        otherwise: yup.string().optional(),
      }),
    };
  }
  const teacherSchema = yup.object().shape(shape, [
    ['phone_number', 'phone_number'],
    ['nationality', 'nationality'],
    ['password', 'password'],
  ]);

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
    reset,
  } = useForm<FormInputTypes>({
    resolver: yupResolver(teacherSchema),
  });

  const [propPic, setPropPic] = useState<any>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubjects, setselectedSubjects] = useState<string[]>([]);
  const [classArray, setClassArray] = useState<any>([]);
  const [newClass, setNewClass] = useState('');
  const [newSubject, setnewSubject] = useState('');
  const [redirectTo, setRedirectTo] = useState(true);
  const schoolServiceBaseURL = import.meta.env.VITE_APP_SCHOOL_SERVICE_URL;
  const userServiceBaseURL = import.meta.env.VITE_APP_USER_SERVICE_URL;

  const onSubmit: SubmitHandler<FormInputTypes> = (values: any) => {
    const formData = new FormData();
    formData.append('user_name', values?.user_name);
    if (values?.password) {
      formData.append('password', values?.password);
    }
    formData.append('first_name', values?.first_name);
    formData.append('last_name', values?.last_name);
    formData.append('email', values?.email);
    formData.append('phone_number', values?.phone_number);
    formData.append('nationality', values?.nationality);
    formData.append('gender', values?.gender);
    formData.append('school_id', id || branchData?.school_id || '');
    if (branchId) {
      formData.append('branch_id', branchId || '');
    }
    formData.append('profile_pic', typeof propPic === 'string' ? '' : propPic);
    formData.append('class_id', selectedClass);
    formData.append(
      'subjects_id_list',
      JSON.stringify(selectedSubjects) as any
    );
    if (userID) {
      mutateUpdateStudent(formData);
    } else {
      mutateAddStudent(formData);
    }
  };
  const onChange = (files: FileList | File[]) => {
    setPropPic(files[0]);
  };
  const handleErrorResponse = (errorObj: any) => {
    Object.keys(errorObj).forEach((key1: any) => {
      setError(key1, { type: 'manual', message: errorObj[key1][0] });
    });
  };

  const addClassHandler = () => {
    if (!newClass) {
      return toast('error', 'Please enter class name');
    }
    const dt = {
      name: newClass,
      school_id: id || branchData?.school_id,
      branch_id: branchId || undefined,
    };
    mutateAddClass(dt);
    return false;
  };

  const addSubjectHandler = () => {
    if (!newSubject) {
      return toast('error', 'Please enter subject name');
    }
    const dt = {
      name: newSubject,
      school_id: id || branchData?.school_id,
      branch_id: branchId || undefined,
    };
    mutateAddSubject(dt);
    return false;
  };

  const generateRandomPass = () => {
    const pass = passwordGenerator();
    setValue('password', pass);
    clearErrors('password');
  };

  const formReset = () => {
    reset();
    setSelectedClass('');
    setselectedSubjects([]);
    setPropPic('');
  };

  // --------------------------------API---------------------------------------

  // Get Subjects
  const {
    data: subjectList,
    isLoading: subjectLoading,
    isRefetching,
    refetch: refetchSubjects,
  } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/schools/subject-list/?school_id=${schoolData?.id || branchData?.school_data?.id || ''}&branch_id=${branchData?.id || ''}`,
    enabled: !!schoolData?.id || !!branchData?.id,
  });

  // Get Student Details
  const { isRefetching: studentDetailLoading, refetch: fetchStudentDetail } =
    useGet({
      baseURL: userServiceBaseURL,
      url: `users-service/student/${userID}/details/`,
      onSuccess: (res: any) => {
        const resp = res?.data?.response;
        setValue('user_name', resp?.user_name);
        setValue('first_name', resp?.first_name);
        setValue('last_name', resp?.last_name);
        setValue('email', resp?.email);
        setValue('phone_number', resp?.phone_number);
        setValue('nationality', resp?.nationality);
        setValue('gender', resp?.gender);
        setPropPic(resp?.profile_picture || '');
        setSelectedClass(resp?.class_id);
        setselectedSubjects(resp?.subject_id || []);
      },
      onError: () => {},
      enabled: false,
    });

  // Get Classes
  const { isRefetching: classLoading, refetch: fetchClasses } = useGet({
    baseURL: schoolServiceBaseURL,
    url: `schools-service/school-classes/?school_id=${id || branchData?.school_id}&branch_name=${branchData?.name || ''}&limit=200`,
    onSuccess: (res: any) => {
      const resp = res?.data?.response?.results;
      const body: any = [];
      resp?.map((i: any) => {
        body.push({
          label: i?.name,
          value: i?.id,
        });
        return true;
      });
      setClassArray(body);
    },
    onError: () => {},
    enabled: false,
  });

  // Post Add New Student
  const { isLoading: LoadAddStudent, mutate: mutateAddStudent } = usePost({
    baseURL: userServiceBaseURL,
    url: `users-service/students/add`,
    onSuccess: (response: any) => {
      toast('success', 'Student added successfully');
      if (redirectTo) {
        // let navigateTo = `${SCHOOL_MANAGEMENT}/${branchId ? `${BRANCH}/${branchId}` : `${SCHOOL}/${id}`}/${MANAGE_MEMBERS}?tabType=Students`;
        // if (userRole().isSchoolAdmin) {
        //   navigateTo = `/${schoolName}/dashboard/${branchId || id}/manage-members?tabType=Students`;
        // }
        setTimeout(() => {
          navigate(-1);
        }, 500);
      } else {
        formReset();
      }
    },
    onError: ({ response }: any) => {
      toast('error', response?.statusText || 'Error');
      handleErrorResponse(response?.data?.errors);
    },
  });

  // Update Student
  const { isLoading: loadingUpdateStudent, mutate: mutateUpdateStudent } =
    usePatch({
      baseURL: userServiceBaseURL,
      url: `users-service/students/${userID}/edit`,
      onSuccess: (response: any) => {
        toast('success', 'Student Updated successfully');
        if (redirectTo) {
          // let navigateTo = `${SCHOOL_MANAGEMENT}/${branchId ? `${BRANCH}/${branchId}` : `${SCHOOL}/${id}`}/${MANAGE_MEMBERS}?tabType=Students`;
          // if (userRole().isSchoolAdmin) {
          //   navigateTo = `/${schoolName}/dashboard/${branchId ? `${BRANCH}/` : ''}${branchId || id}/manage-members?tabType=Students`;
          // }
          setTimeout(() => {
            navigate(-1);
          }, 500);
        }
      },
      onError: ({ response }: any) => {
        toast('error', response?.statusText || 'Error');
        handleErrorResponse(response?.data?.errors);
      },
    });

  // Add New Class
  const { isLoading: AddClassLoader, mutate: mutateAddClass } = usePost({
    baseURL: schoolServiceBaseURL,
    url: 'schools-service/school-classes/',
    onSuccess: (res: any) => {
      toast('success', 'School Class Created');
      setNewClass('');
      fetchClasses();
    },
    onError: (res: any) => {
      const errMessage = res?.response?.data?.message;
      toast('error', errMessage || 'Error');
    },
  });

  // Add New Subject
  const { isLoading: AddSubjectLoader, mutate: mutateAddSubject } = usePost({
    baseURL: schoolServiceBaseURL,
    url: 'schools-service/schools/create-subject/',
    onSuccess: (res: any) => {
      toast('success', res?.data?.message || 'Subject Added');
      setnewSubject('');
      refetchSubjects();
    },
    onError: (res: any) => {
      const errMessage = res?.response?.data?.message;
      toast('error', errMessage || 'Error');
    },
  });

  // --------------------------------API---------------------------------------

  const onClassSelect = useCallback(
    (value: string) => {
      setSelectedClass(value);
    },
    [selectedClass]
  );

  const onSubjectSelect = useCallback(
    (value: string) => {
      if (selectedSubjects.includes(value)) {
        setselectedSubjects(
          selectedSubjects.filter((ele: string) => ele !== value)
        );
      } else {
        setselectedSubjects([...selectedSubjects, value]);
      }
    },
    [selectedSubjects]
  );

  const handleToolbarAction = () => {
    let navigateLink = `/${schoolName}/dashboard/${id}/bulk-upload/student`;
    if (userRole().isSchoolAdmin || userRole().isBranchAdmin) {
      if (branchId) {
        navigateLink = `/${schoolName}/dashboard/branch/${branchId}/bulk-upload/student`;
      }
      navigate(navigateLink);
    } else {
      navigate(
        `${SCHOOL_MANAGEMENT}/${branchId ? BRANCH : SCHOOL}/${id || branchId}/bulk-upload/student`
      );
    }
  };
  const subjectCheckboxes = (
    <div className="bg-white border border-linegray rounded h-[180px] p-6 overflow-auto">
      {subjectLoading || isRefetching ? (
        <Loader size={20} />
      ) : (
        <div className="grid justify-start items-start lg:grid-cols-3 md:grid-cols-1 sm:grid-cols-1 grid-cols-1">
          {(subjectList?.data?.response?.results || [])?.map((ele: any) => {
            const checked = selectedSubjects.includes(ele?.id);
            return (
              <div
                className="flex w-[100px]"
                key={ele.id}
                style={{ alignItems: 'flex-start' }}
              >
                <Checkbox
                  checked={checked}
                  size="small"
                  onChange={() => onSubjectSelect(ele?.id)}
                />
                <span
                  role="presentation"
                  onClick={() => onSubjectSelect(ele.id)}
                  className="cursor-pointer text-sm font-light capitalize pt-[8px]"
                >
                  {ele.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  const classCheckboxes = (
    <div className="bg-white border border-linegray rounded h-[180px] p-6 overflow-auto">
      {classLoading ? (
        <Loader size={20} />
      ) : (
        <RadioGroup
          row={true}
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
          onChange={(e: any) => onClassSelect(e.target.value)}
          value={selectedClass}
        >
          {classArray.map((ele: any) => (
            <div className="w-[150px]" key={ele?.value}>
              <FormControlLabel
                value={ele?.value}
                control={<Radio color="success" size="small" />}
                label={ele?.label}
              />
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  );

  useEffect(() => {
    if (userID) {
      fetchStudentDetail();
    }
  }, [userID]);

  useEffect(() => {
    if (branchData?.school_id) {
      fetchClasses();
    } else if (id) {
      fetchClasses();
    }
  }, [branchData?.school_id, id]);

  if (studentDetailLoading) {
    return <Loader />;
  }

  return (
    <RouteLayout>
      <div className="flex items-center justify-between">
        <HeaderMenus
          title={userID ? 'Edit Student' : 'Add Student'}
          subtitle={`School : ${schoolData?.school_name || branchData?.school_data?.school_name}`}
          subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ''}
        />
        <Button
          onClick={() => {
            handleToolbarAction();
          }}
        >
          Bulk Upload
        </Button>
      </div>
      <div className="mt-6 px-6 bg-white scroll-shadow rounded-md border border-accent">
        <div className="flex justify-between items-center ">
          <h4 className="text-base font-bold py-4">Login Information</h4>
          <p className="text-sm text-red-500 opacity-80">
            All (*) marked fields are mandatory
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-7 mb-4">
            {/* <Input control={control} name="user_name" label="Username" required={true} disabled={!!userID} /> */}
            <Input
              required={true}
              control={control}
              name="user_name"
              label="Username"
              disabled={!!userID}
              sxClass={{
                'input[type="text"]': {
                  textTransform: 'lowercase',
                },
              }}
              tolowercase={true}
            />
            <Input
              control={control}
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              required={!userID}
            />
            <div className="pt-8 w-full">
              <MuiButton
                variant="outlined"
                onClick={generateRandomPass}
                sx={{
                  borderColor: 'var(--accent)',
                  color: 'black',
                  height: '40px',
                  width: '100%',
                  fontWeight: 500,
                }}
              >
                Generate Password
              </MuiButton>
            </div>
          </div>
          <h4 className="text-base font-bold py-4">Basic Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-7 md:gap-x-6 mb-4">
            <Input
              control={control}
              name="first_name"
              label="First Name"
              required={true}
            />
            <Input
              control={control}
              name="last_name"
              label="Last Name"
              required={true}
            />
            <Input
              control={control}
              name="email"
              label="Email id"
              required={true}
            />
            <Input control={control} name="phone_number" label="Phone Number" />
            <Input control={control} name="nationality" label="nationality" />
            <div className="flex items-end">
              <CustomRadio
                control={control}
                name="gender"
                label="Gender"
                dataArray={GENDERS}
              />
            </div>
          </div>
          <h4 className="text-base font-bold py-4">Upload Profile Picture</h4>
          <div className="flex items-center gap-3 mb-4">
            <div>
              {!propPic ? (
                <AccountCircle
                  style={{
                    fontSize: '170px',
                    opacity: '0.1',
                  }}
                />
              ) : (
                <div className="propicPreview">
                  <img
                    src={
                      typeof propPic === 'string'
                        ? propPic
                        : URL.createObjectURL(propPic)
                    }
                    alt=""
                    loading="lazy"
                  />
                </div>
              )}
            </div>
            <div className="w-full">
              <FileSelect
                placeholder="Drag your picture here or"
                ref={imageRef}
                type="image"
                onChange={onChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-y-3 gap-x-7 md:gap-x-6 mb-4">
            <div>
              <PageTitle title="Assign Class" />
              <div className="bg-grey p-5 mt-5">
                <p className="pb-2.5">Select Class</p>
                {classCheckboxes}
                <h4 className="text-base font-bold py-4">Or</h4>
                <div className="flex flex-col sm:flex-row items-end gap-2">
                  <CustomInput
                    value={newClass}
                    onChange={(e: any) => {
                      const reg = NAME_REGEX;
                      if (e.target.value !== '') {
                        if (
                          reg.test(e.target.value) &&
                          e.target.value.length <= 10
                        ) {
                          setNewClass(e.target.value);
                        }
                      } else {
                        setNewClass('');
                      }
                    }}
                    label="Add New Class"
                    name="addNewClass"
                    size="small"
                    sx={{
                      background: 'white',
                      height: '38px',
                    }}
                  />
                  <div>
                    <Button
                      onClick={addClassHandler}
                      loading={AddClassLoader}
                      type="button"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <PageTitle title="Assign Subjects" />
              <div className="bg-grey p-5 mt-5">
                <p className="pb-2.5">Select Subjects</p>
                {subjectLoading ? <Loader /> : subjectCheckboxes}
                <h4 className="text-base font-bold py-4">Or</h4>
                <div className="flex flex-col sm:flex-row items-end gap-2">
                  <CustomInput
                    value={newSubject}
                    onChange={(e: any) => {
                      const reg = NAME_REGEX;
                      if (e.target.value !== '') {
                        if (
                          reg.test(e.target.value) &&
                          e.target.value.length <= 40
                        ) {
                          setnewSubject(e.target.value);
                        }
                      } else {
                        setnewSubject('');
                      }
                    }}
                    label="Add New Subject"
                    name="addNewClass"
                    size="small"
                    sx={{
                      background: 'white',
                      height: '38px',
                    }}
                  />
                  <div>
                    <Button
                      onClick={addSubjectHandler}
                      loading={AddSubjectLoader}
                      type="button"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="stickyBottom space-x-5">
            {!userID ? (
              <Button
                loading={LoadAddStudent || loadingUpdateStudent}
                variant="outlined"
                onClick={() => setRedirectTo(false)}
              >
                Save and Add New
              </Button>
            ) : null}
            <Button
              loading={LoadAddStudent || loadingUpdateStudent}
              onClick={() => setRedirectTo(true)}
            >
              {userID ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </RouteLayout>
  );
}
