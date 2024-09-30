/* eslint-disable comma-dangle */
import { COMPONENTS, TABLE_LABELS, USER_ROLE } from '@constants/constants';

export const TableColumns = [
  {
    label: TABLE_LABELS?.SR_NO,
    align: 'center',
    mapper: 'id',
  },
  {
    label: TABLE_LABELS?.USER_NAME,
    mapper: 'user_name',
    isSort: true,
  },
  {
    label: TABLE_LABELS?.FIRST_NAME,
    mapper: 'first_name',
    isSort: true,
  },
  {
    label: TABLE_LABELS?.LAST_NAME,
    mapper: 'last_name',
    isSort: true,
  },
  {
    label: TABLE_LABELS?.ACTION,
    mapper: 'Action',
    align: 'center',
    component: COMPONENTS?.view,
    showInHeader: false,
  },
];

export const handleUserProfile = (role: number, user: any) => {
  let url = '';
  switch (role) {
    case USER_ROLE.SUPER_ADMIN:
      url = `users-service/edit-sub-admin-details/${user?.id}/`;
      break;
    case USER_ROLE.SUB_ADMIN:
      url = `users-service/edit-sub-admin-details/${user?.id}/`;
      break;
    case USER_ROLE.SCHOOL_ADMIN:
      url = `users-service/school-admin/${user?.id}/`;
      break;
    case USER_ROLE.BRANCH_ADMIN:
      url = `users-service/school-admin/${user?.id}/`;
      break;
    case USER_ROLE.TEACHER:
      url = `users-service/teachers/${user?.id}/edit`;
      break;
    case USER_ROLE.STUDENT:
      url = `users-service/students/${user?.id}/edit`;
      break;
    case USER_ROLE.PARENT:
      url = `users-service/parent-registration/${user?.id}/`;
      break;

    default:
      break;
  }

  return url;
};
