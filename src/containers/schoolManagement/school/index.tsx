import {
  BRANCHES,
  SCHOOL,
  SCHOOL_MANAGEMENT,
  MANAGE_CLASSES,
  EDIT,
  MANAGE_MEMBERS,
  ADD_TEACHER,
  PROMOTE_STUDENT,
  ADD_STUDENT,
  ADD_PARENT,
} from '@constants/routes';
import { ReactComponent as AddClass } from '@images/smicons/Ic_addclass.svg';
import { ReactComponent as AddTeacher } from '@images/smicons/Ic_addteacher.svg';
import { ReactComponent as AddStudent } from '@images/smicons/Ic_addstudent.svg';
import { ReactComponent as AddParent } from '@images/smicons/Ic_addparent.svg';
import { ReactComponent as PromoteStudents } from '@images/smicons/Ic_promote-students.svg';
import { ReactComponent as ManageAdmin } from '@images/smicons/manageAdminn1.svg';
import { ReactComponent as ManageMembers } from '@images/smicons/Ic_managemembers.svg';
import { ReactComponent as ManageClasses } from '@images/smicons/Manage-classes.svg';
import { ReactComponent as ManageCourcePermission } from '@images/smicons/managecourceper.svg';
import { ReactComponent as ManageAssignment } from '@images/smicons/Ic_manage-assignment.svg';
import { ReactComponent as ManageAssessment } from '@images/smicons/manageassessment.svg';
import { ReactComponent as ManageBranch } from '@images/smicons/managebranch.svg';
import { ReactComponent as SchoolTimetable } from '@images/smicons/Ic_timetable.svg';
import { ReactComponent as Attendence } from '@images/smicons/Ic_attendance.svg';
import { ReactComponent as Reports } from '@images/smicons/Ic_reports.svg';
import { ReactComponent as EditSchool } from '@images/smicons/Ic_edit-school2.svg';
import { ReactComponent as Notification } from '@images/smicons/Noti.svg';
import { Link, useParams } from 'react-router-dom';
import RouteLayout from '@layout/routeLayout';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';

export default function Index() {
  const { id } = useParams();
  const { schoolData } = useSelector(selectSchoolData);
  const SCOOL_PANEL_ITEMS = [
    {
      text: 'Add Class',
      link: `/school-management/school/${id}/${MANAGE_CLASSES}?add=true`,
      img: <AddClass />,
    },
    {
      text: 'Add Teacher',
      link: `${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/${MANAGE_MEMBERS}/${ADD_TEACHER}`,
      img: <AddTeacher />,
    },
    {
      text: 'Add Student',
      link: `${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/${MANAGE_MEMBERS}/${ADD_STUDENT}`,
      img: <AddStudent />,
    },
    {
      text: 'Add Parent',
      link: `${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/${MANAGE_MEMBERS}/${ADD_PARENT}`,
      img: <AddParent />,
    },
    {
      text: 'Manage Admin',
      link: `/school-management/school/${id}/admin`,
      img: <ManageAdmin />,
    },
    {
      text: 'Manage Members',
      link: `/school-management/school/${id}/${MANAGE_MEMBERS}`,
      img: <ManageMembers />,
    },
    {
      text: 'Manage Classes',
      link: `/school-management/school/${id}/manage-classes`,
      img: <ManageClasses />,
    },
    {
      text: 'Manage Cource Permissions',
      link: `/publisher/manage-course-permission`,
      img: <ManageCourcePermission />,
    },
    {
      text: 'Manage Branches',
      link: `${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/${BRANCHES}`,
      img: <ManageBranch />,
    },
    {
      text: 'Attendence',
      link: `${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/attandance/mark`,
      img: <Attendence />,
    },
    {
      text: 'Attendence Reports',
      link: `${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/attandance/reports`,
      img: <Attendence />,
    },
    {
      text: 'Edit School Details',
      link: `${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/${EDIT}`,
      img: <EditSchool />,
    },
    {
      text: 'Email Server Setting',
      link: `${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/notification/smtp-server`,
      img: <Notification />,
    },
    {
      text: 'Push Notification',
      link: `${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/notification/push-notification`,
      img: <Notification />,
    },
    {
      text: 'Email Notification',
      link: `${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/notification/email-notification`,
      img: <Notification />,
    },
    {
      text: 'SMS Notification',
      link: `${SCHOOL_MANAGEMENT}/${SCHOOL}/${id}/notification/sms-notification`,
      img: <Notification />,
    },
  ];

  return (
    <RouteLayout navBack={true}>
      <div className="sm-container">
        <HeaderMenus
          title="School Panel"
          subtitle={`School : ${schoolData?.school_name}`}
        />
        <div className="card-container">
          {SCOOL_PANEL_ITEMS.map((i: any) => (
            <Link
              key={i?.text}
              to={i?.link}
              className="cards"
              state={schoolData}
            >
              {i?.img}
              <span>{i?.text}</span>
            </Link>
          ))}
        </div>
      </div>
    </RouteLayout>
  );
}
