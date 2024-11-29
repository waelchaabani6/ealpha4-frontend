/* eslint-disable linebreak-style */
/* eslint-disable import/prefer-default-export */
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
    label: TABLE_LABELS?.ROLE,
    mapper: 'role_name',
    isSort: true,
  },
  {
    label: TABLE_LABELS?.SCHOOL_NAME,
    mapper: 'school_name',
    isSort: true,
  },
  {
    label: TABLE_LABELS?.ACTION,
    mapper: 'Action',
    align: 'center',
    component: COMPONENTS?.edit_password,
    showInHeader: false,
  },
];
