import { ADD_PARENT, ADD_STUDENT, ADD_TEACHER, MANAGE_CLASSES, MANAGE_MEMBERS } from '@constants/routes';
import { ReactComponent as AddClass } from '@images/smicons/Ic_addclass.svg';
import { ReactComponent as AddParent } from '@images/smicons/Ic_addparent.svg';
import { ReactComponent as AddStudent } from '@images/smicons/Ic_addstudent.svg';
import { ReactComponent as AddTeacher } from '@images/smicons/Ic_addteacher.svg';
import { ReactComponent as Attendence } from '@images/smicons/Ic_attendance.svg';
import { ReactComponent as ManageAssignment } from '@images/smicons/Ic_manage-assignment.svg';
import { ReactComponent as ManageMembers } from '@images/smicons/Ic_managemembers.svg';
import { ReactComponent as PromoteStudents } from '@images/smicons/Ic_promote-students.svg';
import { ReactComponent as Reports } from '@images/smicons/Ic_reports.svg';
import { ReactComponent as ManageClasses } from '@images/smicons/Manage-classes.svg';
import { ReactComponent as Notification } from '@images/smicons/Noti.svg';
import { ReactComponent as GradeBook } from '@images/smicons/gradebook.svg';
import { ReactComponent as ManageAssessment } from '@images/smicons/manageassessment.svg';
import { ReactComponent as EditBranchDetails } from '@images/smicons/managebranch.svg';
import { ReactComponent as ManageCourcePermission } from '@images/smicons/managecourceper.svg';
import { ReactComponent as ICPractice } from '@images/smicons/ic_Practice.svg';
import RouteLayout from '@layout/routeLayout';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function BranchAdminDashboard() {
  const { branchData: { name, id } } = useSelector(selectSchoolData);

  const cards = [
    {
      text: 'Add Class',
      link: `/${name}/dashboard/branch/${id}/manage-classes?add=true`,
      img: <AddClass />
    },
    {
      text: 'Add Teacher',
      link: `/${name}/dashboard/branch/${id}/${MANAGE_MEMBERS}/${ADD_TEACHER}`,
      img: <AddTeacher />
    },
    {
      text: 'Add Student',
      link: `/${name}/dashboard/branch/${id}/${MANAGE_MEMBERS}/${ADD_STUDENT}`,
      img: <AddStudent />
    },
    {
      text: 'Add Parent',
      link: `/${name}/dashboard/branch/${id}/${MANAGE_MEMBERS}/${ADD_PARENT}`,
      img: <AddParent />
    },
    {
      text: 'Attendence',
      link: `/${name}/dashboard/branch/${id}/attandance/mark`,
      img: <Attendence />
    },
    {
      text: 'Gradebook',
      link: `/${name}/grade-book`,
      img: <GradeBook />
    },
    {
      text: 'Manage Classes',
      link: `/${name}/dashboard/branch/${id}/${MANAGE_CLASSES}?name=${name}`,
      img: <ManageClasses />
    },
    {
      text: 'Manage Members',
      link: `/${name}/dashboard/branch/${id}/${MANAGE_MEMBERS}`,
      img: <ManageMembers />
    },
    {
      text: 'Manage Assignments',
      link: `/${name}/assignment`,
      img: <ManageAssignment />
    },
    {
      text: 'Manage Assessments',
      link: `/${name}/assessments`,
      img: <ManageAssessment />
    },
    {
      text: 'Attendence Reports',
      link: `/${name}/dashboard/branch/${id}/attandance/reports`,
      img: <Attendence />
    },
    {
      text: 'Reports',
      link: `/${name}/reports`,
      img: <Reports />
    },
    {
      text: 'Edit Branch Details',
      link: `/${name}/dashboard/branch/${id}/edit`,
      img: <EditBranchDetails />
    },
    {
      text: 'Manage Course Permissions',
      link: `/${name}/manage-course-permission`,
      img: <ManageCourcePermission />
    },
    {
      text: 'Email Server Setting',
      link: `/${name}/dashboard/branch/${id}/notification/smtp-server`,
      img: <Notification />
    },
    {
      text: 'Email Notification',
      link: `/${name}/dashboard/branch/${id}/notification/email-notification`,
      img: <Notification />
    },
    {
      text: 'Push Notification',
      link: `/${name}/dashboard/branch/${id}/notification/push-notification`,
      img: <Notification />
    },
    {
      text: 'SMS Notification',
      link: `/${name}/dashboard/branch/${id}/notification/sms-notification`,
      img: <Notification />
    },
    {
      text: 'Digital Library',
      link: `/${name}/digital-library`,
      img: <ICPractice />
    }
  ];
  return (
    <RouteLayout navBack={false}>
      <div className="sm-container">
        <HeaderMenus
          title="Branch Admin"
        />
        <div className="card-container">
          {
            cards.map((i: any) => (
              <Link key={i?.text} to={i?.link} className="cards">
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
