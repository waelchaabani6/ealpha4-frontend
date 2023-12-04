import Input from '@shared/form/Input';
import CaneraIcon from '@images/camera.svg';
import React, { useEffect, useRef, useState } from 'react';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { yupResolver } from '@hookform/resolvers/yup';
import { Control, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useGet } from '@shared/api/useApi';
import toast from '@shared/toast';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUserProfile } from '@shared/store/userSlice';
import Loader from '@shared/loader';
import { toast as reactToast } from 'react-toastify';
import { DEFAULT_IMAGE_SIZE, USER_TYPE } from '@constants/constants';
import RouteLayout from '../layout/routeLayout';
import Tabs from './tabs';
import { basicDetailsSchema } from './schema';

export type ProfileInputs = {
  first_name: string;
  last_name: string;
  phone_number: number;
  alternative_phone_number: number;
  email: string;
  alternate_email: string;
  address: string;
  street: string;
  area: string;
  city: string;
  zip_code: number;
  country: string;
}

export type ProfileDetailsProps = {
  data: ProfileInputs;
  control: Control<any, any>;
  handleSubmit: SubmitHandler<any>;
}

export default function Index(): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { userId, ...userData } = useSelector(selectUser);
  const methods = useForm({
    mode: 'all',
    resolver: yupResolver(basicDetailsSchema)
  });
  const onChangeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    const PROFILE_IMAGE_SIZE = 500000;
    if (ev.target.files && imageRef.current) {
      if (ev.target.files[0].type.split('/')[0] !== 'image') {
        toast('error', 'Please select Image');
      } else if (ev.target.files[0].size > PROFILE_IMAGE_SIZE) {
        reactToast.dismiss();
        toast('info', 'Image size is too large');
      } else {
        setImage(URL.createObjectURL(ev.target.files[0]));
        methods.setValue('profile_picture', ev.target.files[0]);
      }
    }
  };

  const selectImageClick = (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (inputRef?.current) {
      inputRef.current.click();
    }
  };

  const { isLoading, data } = useGet({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: `users-service/admin/${userId}/`
  });

  useEffect(() => {
    methods.reset({
      first_name: data?.data.response.first_name || '',
      last_name: data?.data.response.last_name || '',
      phone_number: data?.data.response.phone_number || '',
      alternative_phone_number: data?.data.response.alternative_phone_number || '',
      email: data?.data.response.email || '',
      alternate_email: data?.data.response.alternate_email || '',
      address: data?.data.response.address || '',
      street: data?.data.response.street || '',
      area: data?.data.response.area || '',
      city: data?.data.response.city || '',
      zip_code: data?.data.response.zip_code || '',
      country: data?.data.response.country || '',
      profile_picture: data?.data.response.profile_picture,
      documents: data?.data.response.documents
    });
    if (data?.data?.response?.documents.length > 0) {
      methods.setValue('documents', data?.data?.response?.documents?.map((ele: any, index: number) => ({
        sr_no: index + 1,
        document_name: ele.name,
        file: ele.document,
        document_ting: ele.document_ting
      })));
    }
    setImage(data?.data?.response?.profile_picture);
    if (data) {
      dispatch(setUserProfile({
        profile_picture: data?.data?.response?.profile_picture,
        first_name: data?.data?.response?.first_name,
        last_name: data?.data?.response?.last_name
      }));
    }
  }, [data]);

  return (
    <RouteLayout navBack={false}>
      {
        isLoading
          ? <Loader />
          : (
            <>
              <p className="h-9 flex items-center text-lg font-semibold border-l-4 border-sunlight pl-2">
                My Profile
              </p>
              <div className="flex-1 flex flex-col gap-y-4 lg:flex-row gap-x-4 py-5 lg:overflow-hidden">
                <div
                  className="w-full lg:w-[280px] h-max lg:h-full
          border border-accent rounded-lg bg-white overflow-auto px-6 py-4"
                >
                  <div className="h-[191.77px] relative">
                    <div
                      ref={imageRef}
                      className="relative w-[160px] h-[160px] p-1
              rounded-full overflow-hidden shadow-xl bg-center"
                      style={{
                        ...(image ? {
                          backgroundImage: `url('${image}')`,
                          backgroundSize: 'cover'
                        } : {})
                      }}
                    />
                    {
                      !image && <AccountCircle style={{
                        position: 'absolute',
                        top: '-4px',
                        left: '-4px',
                        fontSize: '170px',
                        opacity: '0.1'
                      }}
                      />
                    }

                    <img
                      src={CaneraIcon}
                      alt=""
                      className="w-[32px] h-[32px] p-1.5
              border bg-white absolute top-32 left-28 rounded-full cursor-pointer hover:bg-gray-200"
                      onClick={selectImageClick}
                    />
                    <input
                      hidden={true}
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      name="profile_image"
                      onChange={onChangeHandler}
                      onClick={(ev: any) => {
                        ev.target.value = '';
                      }}
                    />
                    <p className="font-medium text-[10.53px] py-4">
                      (Maximum Image Upload size
                      <span className="font-semibold pl-1">500 kb</span>
                      )
                    </p>
                  </div>
                  <br />
                  <div className="flex flex-col gap-y-1 border-y pt-4 pb-6">
                    <Input required={true} control={methods.control} name="first_name" label="First name" />
                    <Input required={true} control={methods.control} name="last_name" label="Last name" />
                  </div>
                  <br />
                  <p className="text-sm">
                    <span className="font-semibold">Role</span>
                    <span className="float-right">{data?.data.response.role || ''}</span>
                  </p>
                  {
                    (userData?.role?.name === USER_TYPE?.STUDENT || userData?.role?.name === USER_TYPE?.TEACHER)
                      ? (
                        <p className="text-sm">
                          <span className="font-semibold">Class:</span>
                          <span className="float-right">{Array.isArray(userData?.class_name) ? (userData?.class_name || []).join(', ') : userData?.class_name}</span>
                        </p>
                      ) : null
                  }
                  <p className="text-sm">
                    <span className="font-semibold">User ID:</span>
                    <span className="float-right">{data?.data.response.user_id || data?.data.response.id || ''}</span>
                  </p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <FormProvider {...methods}>
                    <Tabs />
                  </FormProvider>
                </div>
              </div>
            </>
          )
      }
    </RouteLayout>
  );
}
