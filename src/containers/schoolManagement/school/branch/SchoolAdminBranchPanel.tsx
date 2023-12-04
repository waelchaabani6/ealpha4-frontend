import { ReactComponent as AddClass } from '@images/smicons/Ic_addclass.svg';
import { ReactComponent as AddParent } from '@images/smicons/Ic_addparent.svg';
import { ReactComponent as AddStudent } from '@images/smicons/Ic_addstudent.svg';
import { ReactComponent as AddTeacher } from '@images/smicons/Ic_addteacher.svg';
import { ReactComponent as Attendence } from '@images/smicons/Ic_attendance.svg';
import { ReactComponent as EditSchool } from '@images/smicons/Ic_edit-school2.svg';
import { ReactComponent as ManageAssignment } from '@images/smicons/Ic_manage-assignment.svg';
import { ReactComponent as ManageMembers } from '@images/smicons/Ic_managemembers.svg';
import { ReactComponent as PromoteStudents } from '@images/smicons/Ic_promote-students.svg';
import { ReactComponent as Reports } from '@images/smicons/Ic_reports.svg';
import { ReactComponent as SchoolTimetable } from '@images/smicons/Ic_timetable.svg';
import { ReactComponent as ManageClasses } from '@images/smicons/Manage-classes.svg';
import { ReactComponent as ManageAssessment } from '@images/smicons/manageassessment.svg';
import { ReactComponent as ManageCourcePermission } from '@images/smicons/managecourceper.svg';
import { ReactComponent as PassFail } from '@images/smicons/pass-fail.svg';
import { MANAGE_CLASSES, PROMOTE_STUDENT } from '@constants/routes';
import { ReactComponent as Notification } from '@images/smicons/Noti.svg';
import { ReactComponent as GradeBook } from '@images/smicons/gradebook.svg';
import RouteLayout from '@layout/routeLayout';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import SchoolDataLoad from '@shared/store/initialDataLoaders/schoolDataLoad';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { selectUser } from '@shared/store/userSlice';
import { userRole } from '@utility/utility';
import { useSelector } from 'react-redux';
import { Link, Navigate, Outlet, useLocation, useMatches, useParams } from 'react-router-dom';

export default function SchoolAdminBranchPanel() {
  const { schoolId } = useSelector(selectUser);
  const { branchData } = useSelector(selectSchoolData);
  const { schoolName } = useParams();

  const cards = [
    {
      text: 'Add Class',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/manage-classes?add=true`,
      img: <AddClass />
    },
    {
      text: 'Add Teacher',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/manage-members/add-teacher`,
      img: <AddTeacher />
    },
    {
      text: 'Add Student',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/manage-members/add-student`,
      img: <AddStudent />
    },
    {
      text: 'Add Parent',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/manage-members/add-parent`,
      img: <AddParent />
    },
    {
      text: 'Pass/Fail Students',
      link: `/${schoolName}/dashboard/${schoolId}/admin`,
      img: <PassFail />
    },
    {
      text: 'Manage Members',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/manage-members`,
      img: <ManageMembers />
    },
    {
      text: 'Manage Classes',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/${MANAGE_CLASSES}`,
      img: <ManageClasses />
    },
    {
      text: 'Manage Course Permissions',
      link: `/${schoolName}/dashboard/manage-course-permission`,
      img: <ManageCourcePermission />
    },
    {
      text: 'Manage Assignment',
      link: `/${schoolName}/assignments`,
      img: <ManageAssignment />
    },
    {
      text: 'Manage Assessments',
      link: `/${schoolName}/assessments`,
      img: <ManageAssessment />
    },
    {
      text: 'School Timetable',
      link: `/${schoolName}/time-table`,
      img: <SchoolTimetable />
    },
    {
      text: 'Attendence',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/attandance/mark`,
      img: <Attendence />
    },
    {
      text: 'Attendence Reports',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/attandance/reports`,
      img: <Attendence />
    },
    {
      text: 'Reports',
      link: `/${schoolName}/reports`,
      img: <Reports />
    },
    {
      text: 'Email Server Setting',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/notification/smtp-server`,
      img: <Notification />
    },
    {
      text: 'Push Notification',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/notification/push-notification`,
      img: <Notification />
    },
    {
      text: 'Email Notification',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/notification/email-notification`,
      img: <Notification />
    },
    {
      text: 'SMS Notification',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/notification/sms-notification`,
      img: <Notification />
    },
    {
      text: 'Edit Branch Details',
      link: `/${schoolName}/dashboard/branch/${branchData?.id}/edit`,
      img: <EditSchool />
    },
    {
      text: 'Gradebook',
      link: `/${schoolName}/dashboard/grade-book`,
      img: <GradeBook />
    }
  ];
  return (
    <RouteLayout navBack={true}>
      <div className="sm-container">
        <HeaderMenus
          title="Branch Panel"
          subtitle={`Branch : ${branchData?.name}`}
        />
        <div className="card-container">
          {
            cards.map((i: any, index) => (
              <Link key={index} to={i?.link} className="cards">
                {i?.img}
                <span>{i?.text}</span>
              </Link>
            ))
          }
        </div>
      </div>
    </RouteLayout>
  );
}

export function ManageSchoolAdminRoute() {
  const { schoolName } = useParams();
  const { pathname } = useLocation();

  const match = useMatches();
  const navigatePath = schoolName ? `/${schoolName}/dashboard` : '/dashboard';

  if (userRole().isSchoolAdmin) {
    if (match[0].params?.['*']) {
      return <Navigate replace={true} to={navigatePath} />;
    }
    return <SchoolDataLoad />;
  }
  if (!userRole().isSchoolAdmin && decodeURIComponent(pathname) !== navigatePath) {
    return <Navigate replace={true} to={navigatePath} />;
  }
  return <Outlet />;
}
