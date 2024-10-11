/* eslint-disable import/prefer-default-export */
/* eslint-disable comma-dangle */
import { COMPONENTS, TABLE_LABELS } from '@constants/constants';

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
