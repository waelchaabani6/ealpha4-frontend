import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { ReactComponent as DashboardToggle } from '@images/dashboardToggle.svg';
import { ReactComponent as SidebarIcon } from '@images/sidebarIcons/dashboard.svg';
import { ReactComponent as CalendarIcon } from '@images/sidebarIcons/calendar.svg';
import { ReactComponent as PublisherIcon } from '@images/sidebarIcons/publisher.svg';
import { ReactComponent as SchoolManagementIcon } from '@images/sidebarIcons/management.svg';
import { ReactComponent as ManageCoursesIcon } from '@images/sidebarIcons/courses.svg';
import { ReactComponent as AdminPanelIcon } from '@images/sidebarIcons/admin.svg';
import { ReactComponent as ManageIntegrationIcon } from '@images/sidebarIcons/manageIntegration.svg';
import { ReactComponent as InfoPagesIcon } from '@images/sidebarIcons/manageInformativePages.svg';
import { ReactComponent as NotificationIcon } from '@images/sidebarIcons/notification.svg';
import { appTransition } from '@shared/animatedLayout/animationValues';
import SidebarLinks from './sidebarLinks';
import routes from '../../constants/routes';

export default function Index() {
  const conditionWidth = 768;
  const [expand, setExpand] = useState(false);
  const toggleSidebar = useCallback(() => { setExpand((prev) => !prev); }, []);
  const setDimension = () => setExpand(window.innerWidth > conditionWidth);
  useEffect(() => {
    setExpand(window.innerWidth >= conditionWidth);
    window.addEventListener('resize', setDimension);
    return () => {
      window.removeEventListener('resize', setDimension);
    };
  }, []);
  return (
    <motion.div
      className="h-full flex flex-col w-[260px]"
      transition={appTransition}
      animate={{ width: expand ? '260px' : '40px' }}
    >
      <div className={`h-10 flex items-center ${expand ? 'justify-end pr-2' : 'justify-center'}`}>
        <DashboardToggle
          className="h-full cursor-pointer"
          onClick={toggleSidebar}
        />
      </div>
      <div className="flex-1 w-full flex flex-col space-y-3 sdbar relative">
        <SidebarLinks
          title="Dashboard"
          path={routes?.DASHBOARD}
          expand={expand}
          Icon={SidebarIcon}
        />
        <SidebarLinks
          title="Calendar"
          path={routes?.CALENDAR}
          expand={expand}
          Icon={CalendarIcon}
        />
        <SidebarLinks
          title="Admin Panel"
          path={routes?.ADMIN_PANEL}
          expand={expand}
          Icon={AdminPanelIcon}
        />
        <SidebarLinks
          title="Manage Courses"
          path={routes?.MANAGE_COURSES}
          expand={expand}
          Icon={ManageCoursesIcon}
          childs={[
            { label: 'Add Course Information', path: routes?.MANAGE_COURSES_MASTER },
            { label: 'Upload Course', path: routes?.MANAGE_COURSES_UPLOAD }
          ]}
        />
        <SidebarLinks
          title="Publisher Panel"
          path={routes?.PUBLISHER}
          expand={expand}
          Icon={PublisherIcon}
          childs={[
            { label: 'Course Code', path: routes?.PUBLISHER__COURSE_CODE },
            { label: 'Assigned Course', path: routes?.PUBLISHER__ASSIGNED_COURSE },
            { label: 'Manage Course Permission', path: routes?.PUBLISHER__COURSE_PERMISSION }
          ]}
        />
        <SidebarLinks
          title="School Management"
          path={routes?.SCHOOL_MANAGEMENT}
          expand={expand}
          Icon={SchoolManagementIcon}
          childs={[
            { label: 'Create New School', path: routes?.SCHOOL_MANAGEMENT__ADD },
            { label: 'All Schools', path: routes?.SCHOOL_MANAGEMENT__ALL_SCHOOLS },
            { label: 'Calendar Schedule', path: routes?.CALENDAR_SCHEDULE }
          ]}
        />

        <SidebarLinks
          title="Manage Integration"
          path={routes?.INTEGRATIONS}
          expand={expand}
          Icon={ManageIntegrationIcon}
          childs={[
            { label: 'Integrations', path: routes?.INTEGRATIONS },
            { label: 'Subscriptions', path: routes?.SUBSCRIPTIONS }
          ]}
        />
        <SidebarLinks
          title="Manage Informative Pages"
          path={routes?.INFORMATIVE_PAGES}
          expand={expand}
          Icon={InfoPagesIcon}
        />
        <SidebarLinks
          title="Manage Notification"
          path={routes?.NOTIFICATION}
          expand={expand}
          Icon={NotificationIcon}
          childs={[
            { label: 'Push Notification', path: '/notification/push-notification' },
            { label: 'Email-Notification', path: '/notification/email-notification' },
            { label: 'SMS-Notification', path: '/notification/sms-notification' }
          ]}
        />
      </div>
    </motion.div>
  );
}
