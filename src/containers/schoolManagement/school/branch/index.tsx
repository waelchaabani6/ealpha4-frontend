import { Link, useParams } from 'react-router-dom';
import { ReactComponent as AddClass } from '@images/smicons/Ic_addclass.svg';
import { ReactComponent as AddTeacher } from '@images/smicons/Ic_addteacher.svg';
import { ReactComponent as AddStudent } from '@images/smicons/Ic_addstudent.svg';
import { ReactComponent as AddParent } from '@images/smicons/Ic_addparent.svg';
import { ReactComponent as PromoteStudents } from '@images/smicons/Ic_promote-students.svg';
import { ReactComponent as ManageMembers } from '@images/smicons/Ic_managemembers.svg';
import { ReactComponent as ManageClasses } from '@images/smicons/Manage-classes.svg';
import { ReactComponent as ManageCourcePermission } from '@images/smicons/managecourceper.svg';
import { ReactComponent as ManageAssignment } from '@images/smicons/Ic_manage-assignment.svg';
import { ReactComponent as ManageAssessment } from '@images/smicons/manageassessment.svg';
import { ReactComponent as BranchTimetable } from '@images/smicons/Ic_timetable.svg';
import { ReactComponent as Attendence } from '@images/smicons/Ic_attendance.svg';
import { ReactComponent as Reports } from '@images/smicons/Ic_reports.svg';
import { ReactComponent as Notification } from '@images/smicons/Noti.svg';
import { ReactComponent as EditBranchDetails } from '@images/smicons/managebranch.svg';
import RouteLayout from '@layout/routeLayout';
import { ADD_PARENT, ADD_STUDENT, ADD_TEACHER, BRANCH, EDIT, MANAGE_CLASSES, MANAGE_MEMBERS, SCHOOL_MANAGEMENT } from '@constants/routes';
import { useSelector } from 'react-redux';
import { selectSchoolData } from '@shared/store/schoolSlice';
import { HeaderMenus } from '@shared/pageHeaderMenu/HeaderMenus';

export default function Branchpanel() {
  const { branchId } = useParams();
  const { schoolData, branchData } = useSelector(selectSchoolData);

  const BRANCH_PANEL_ITEMS = [
    {
      text: 'Add Class',
      link: `/school-management/branch/${branchData?.id}/${MANAGE_CLASSES}?add=true`,
      img: <AddClass />
    },
    {
      text: 'Add Teacher',
      link: `/school-management/branch/${branchData?.id}/${MANAGE_MEMBERS}/${ADD_TEACHER}`,
      img: <AddTeacher />
    },
    {
      text: 'Add Student',
      link: `/school-management/branch/${branchData?.id}/${MANAGE_MEMBERS}/${ADD_STUDENT}`,
      img: <AddStudent />
    },
    {
      text: 'Add Parent',
      link: `/school-management/branch/${branchData?.id}/${MANAGE_MEMBERS}/${ADD_PARENT}`,
      img: <AddParent />
    },
    {
      text: 'Manage Members',
      link: `/school-management/branch/${branchData?.id}/${MANAGE_MEMBERS}`,
      img: <ManageMembers />
    },
    {
      text: 'Manage Classes',
      link: `/school-management/branch/${branchData?.id}/${MANAGE_CLASSES}?name=${branchData?.school_data
        ?.school_name}`,
      img: <ManageClasses />
    },
    {
      text: 'Attendence',
      link: `${SCHOOL_MANAGEMENT}/${BRANCH}/${branchId}/attandance/mark`,
      img: <Attendence />
    },
    {
      text: 'Attendence Reports',
      link: `${SCHOOL_MANAGEMENT}/${BRANCH}/${branchId}/attandance/reports`,
      img: <Attendence />
    },
    {
      text: 'Edit Branch Details',
      link: `${SCHOOL_MANAGEMENT}/${BRANCH}/${branchId}/${EDIT}`,
      img: <EditBranchDetails />
    },
    {
      text: 'Email Server Setting',
      link: `${SCHOOL_MANAGEMENT}/${BRANCH}/${branchId}/notification/smtp-server`,
      img: <Notification />
    },
    {
      text: 'Push Notification',
      link: `${SCHOOL_MANAGEMENT}/${BRANCH}/${branchId}/notification/push-notification`,
      img: <Notification />
    },
    {
      text: 'Email Notification',
      link: `${SCHOOL_MANAGEMENT}/${BRANCH}/${branchId}/notification/email-notification`,
      img: <Notification />
    },
    {
      text: 'SMS Notification',
      link: `${SCHOOL_MANAGEMENT}/${BRANCH}/${branchId}/notification/sms-notification`,
      img: <Notification />
    }
  ];

  return (
    <RouteLayout navBack={true}>
      <div className="sm-container">
        <HeaderMenus
          title="Branch Panel"
          subtitle={`School : ${schoolData?.school_name || branchData?.school_data?.school_name}`}
          subtitle2={branchData?.name ? `Branch : ${branchData?.name}` : ''}
        />
        <div className="card-container">
          {
            BRANCH_PANEL_ITEMS.map((i: any) => (
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
