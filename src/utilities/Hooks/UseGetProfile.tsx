import { usePost } from '@shared/api/useApi';
import { useDispatch } from 'react-redux';
import { setUser } from '@shared/store/userSlice';

const UseGetProfile = (props: any = {}): any => {
  const dispatch = useDispatch();

  const { isLoading, mutate: getUserData } = usePost({
    baseURL: import.meta.env.VITE_APP_USER_SERVICE_URL,
    url: 'users-service/user/profile',
    cacheTime: 100,
    enabled: props?.enabled || false,
    onSuccess: (res: any) => {
      const data = res?.data?.response?.data;
      const dta = {
        userId: data.user_id,
        first_name: data.first_name,
        last_name: data.last_name,
        user_ting: data?.user_ting,
        role: data.role,
        profile_picture: data.profile_picture,
        schoolId: data?.school_id || null,
        branchId: data?.branch_id || null,
        user_profile_id: data?.user_profile_id || null,
        school_name: data?.school_name || null,
        loading: false,
        assessment_count: data?.assessment_count,
        assignment_count: data?.assignment_count
      } as any;
      if (data?.class_id) {
        dta.class_id = data.class_id;
      }
      if (data?.branch_name) {
        dta.branch_name = data.branch_name;
      }
      if (data?.class_name) {
        dta.class_name = data.class_name;
      }
      dispatch(setUser(dta));
    }
  });
  function getUser() {
    getUserData({});
  }

  return {
    isLoading,
    getUser
  };
};

export default UseGetProfile;
