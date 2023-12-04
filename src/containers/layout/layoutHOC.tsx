import { useGet } from '@shared/api/useApi';
import Loader from '@shared/loader';
import NotFound from '@shared/notFound';
import { setStoreSchool, selectSchoolData, setStoreBranch } from '@shared/store/schoolSlice';
import { selectUser } from '@shared/store/userSlice';
import { userRole } from '@utility/utility';
import { ComponentType, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation, useParams } from 'react-router-dom';

export default (Component: ComponentType) => (props: any) => {
  const { schoolName } = useParams();
  const { pathname } = useLocation();
  const { userId, schoolId, branchId, school_name: sclNme, branch_name: bncNme } = useSelector(selectUser);
  const { schoolData } = useSelector(selectSchoolData);
  const dispatch = useDispatch();
  const { data, isLoading: schoolLoading, isSuccess, isError: schoolError } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/schools/${schoolId}/`,
    // enabled: !userRole().isBranchAdmin && !schoolData && !!userId && !((userRole().isSuperAdmin || userRole().isSubAdmin))
    enabled: Boolean(schoolId && !schoolData && !(userRole().isSuperAdmin || userRole().isBranchAdmin) && !branchId)
  });

  const { isLoading: branchLoading, data: data2, isSuccess: branchSuccess, isError: branchError } = useGet({
    baseURL: import.meta.env.VITE_APP_SCHOOL_SERVICE_URL,
    url: `schools-service/school-branches/branch/${branchId}/`,
    // enabled: userRole().isBranchAdmin
    enabled: Boolean(branchId && userRole().isBranchAdmin)
  });

  useEffect(() => {
    if (branchSuccess) {
      dispatch(setStoreBranch(data2?.data?.response));
    }
  }, [branchSuccess]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(setStoreSchool(data?.data));
    }
  }, [isSuccess]);
  if (schoolId && schoolName && decodeURIComponent(schoolName) !== (bncNme || sclNme)) {
    return <Navigate to={pathname.replace(encodeURI(schoolName), (bncNme || sclNme))} replace={true} />;
  }

  // if ((!(userRole().isSuperAdmin || userRole().isSubAdmin) && schoolName && sclNme) && decodeURIComponent(schoolName || '') !== (bncNme || sclNme)) {
  //   return <Navigate to={pathname.replace(encodeURI(schoolName), (bncNme || sclNme))} replace={true} />;
  // }
  if (schoolLoading || branchLoading) {
    return (
      <div className="h-screen w-screen grid place-items-center">
        <Loader />
      </div>
    );
  }
  if (schoolError) {
    return (
      <NotFound message={`${schoolError ? 'School' : ''} ${branchError ? 'Branch' : ''} Error`} />
    );
  }
  return <Component {...props} />;
};
