import { USER_TYPE } from '@constants/constants';
import { selectUser } from '@shared/store/userSlice';
import { useSelector } from 'react-redux';
import ParentsDashboard from './parentsDashboard';
import SchoolAdminDashboard from './schoolAdminDashboard';
import StudentDashboard from './studentDashboard';
import SuperAdminDashboard from './superAdminDashboard';
import TeacherDashboard from './teacherDashboard';

export default function Index(): JSX.Element {
  const { role: { name: role } } = useSelector(selectUser);
  switch (role) {
    case USER_TYPE.TEACHER:
      return <TeacherDashboard />;
    case USER_TYPE.SCHOOL_ADMIN:
      return <SchoolAdminDashboard />;
    case USER_TYPE.PARENTS:
      return <ParentsDashboard />;
    case USER_TYPE.STUDENT:
      return <StudentDashboard />;
    default:
      return <SuperAdminDashboard />;
  }
}
