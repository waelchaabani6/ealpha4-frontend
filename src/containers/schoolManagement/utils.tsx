/* eslint-disable comma-dangle */
import { ReactComponent as Edit } from '@images/longMenuIcons/Edit.svg';
import { ReactComponent as Add } from '@images/longMenuIcons/Add.svg';
import { ReactComponent as Delete } from '@images/longMenuIcons/Delete.svg';
import { ReactComponent as License } from '@images/longMenuIcons/license.svg';
import { COMPONENTS, TABLE_LABELS } from '@constants/constants';

export const moreMenuOptions = [
  {
    icon: <Edit />,
    label: 'Edit School Details',
    value: 'editSchoolDetails',
  },
  {
    icon: <Add />,
    label: 'Add New Branch',
    value: 'addNewBranch',
  },
  {
    icon: <License />,
    label: 'Extend License',
    value: 'extendLicense',
  },
  {
    icon: <Delete />,
    label: 'Delete',
    value: 'delete',
  },
];

export const BranchTableMenus = [
  {
    icon: <License />,
    label: 'Extend License',
    value: 'extendLicense',
  },
  {
    icon: <Delete />,
    label: 'Delete',
    value: 'delete',
  },
];

export const headers = [
  TABLE_LABELS?.SCHOOL_ID,
  TABLE_LABELS?.SCHOOL_NAME,
  TABLE_LABELS?.SCHOOL_TYPE,
  TABLE_LABELS?.BRANCHES,
  TABLE_LABELS?.CREATED_ON,
  TABLE_LABELS?.EXPIRATION,
  TABLE_LABELS?.EXPIRATION_DAYS_LEFT,
  TABLE_LABELS?.STATUS,
];

export const csvSubHeaders = [
  TABLE_LABELS?.SCHOOL_ID,
  TABLE_LABELS?.SCHOOL_NAME,
  TABLE_LABELS?.BRANCH_ID,
  TABLE_LABELS?.BRANCH_NAME,
  TABLE_LABELS?.BRANCH_TYPE,
  TABLE_LABELS?.CREATED_ON,
  TABLE_LABELS?.EXPIRATION,
  TABLE_LABELS?.EXPIRATION_DAYS_LEFT,
  TABLE_LABELS?.STATUS,
];

export const TableColumns = [
  {
    label: '',
    isSort: false,
    mapper: '',
    isAdd: true,
  },
  {
    label: TABLE_LABELS?.SR_NO,
    align: 'center',
  },
  {
    label: TABLE_LABELS?.SCHOOL_ID,
    mapper: 'id',
    isSort: true,
  },
  {
    label: TABLE_LABELS?.SCHOOL_NAME,
    isSort: true,
    mapper: 'name',
  },
  {
    label: TABLE_LABELS?.SCHOOL_TYPE,
    isSort: true,
    mapper: 'school_type',
  },
  {
    label: TABLE_LABELS?.BRANCHES,
    isSort: true,
    mapper: 'branch_count',
  },
  {
    label: TABLE_LABELS?.COUNTRY_NAME,
    isSort: true,
    mapper: 'country_code',
  },
  {
    label: TABLE_LABELS?.CREATED_ON,
    isSort: true,
    mapper: 'created_at',
    format: 'DD-MM-YYYY',
  },
  {
    label: TABLE_LABELS?.EXPIRATION,
    isSort: true,
    mapper: 'activation_end_date',
  },
  {
    label: TABLE_LABELS?.EXPIRATION_DAYS_LEFT,
    isSort: true,
    mapper: 'expiration_days_left',
  },
  {
    label: TABLE_LABELS?.STATUS,
    align: 'center',
    mapper: 'status',
    component: COMPONENTS?.switch,
    showInHeader: false,
  },
  {
    label: TABLE_LABELS?.ACTION,
    component: COMPONENTS?.longmenu,
    menuArray: moreMenuOptions,
  },
];

export const subTableHeader = [
  {
    align: 'center',
    component: COMPONENTS?.checkbox,
    selector: 'id',
    showInHeader: true,
  },
  {
    label: TABLE_LABELS?.SR_NO,
    align: 'center',
  },
  {
    label: TABLE_LABELS?.BRANCH_ID,
    align: 'center',
    mapper: 'id',
  },
  {
    label: TABLE_LABELS?.BRANCH_NAME,
    align: 'center',
    mapper: 'name',
  },
  {
    label: TABLE_LABELS?.BRANCH_TYPE,
    align: 'center',
    mapper: 'branch_type',
  },
  {
    label: TABLE_LABELS?.CREATED_ON,
    isSort: true,
    mapper: 'created_at',
    format: 'DD-MM-YYYY',
  },
  {
    label: TABLE_LABELS?.EXPIRATION,
    isSort: true,
    mapper: 'activation_end_date',
  },
  {
    label: TABLE_LABELS?.EXPIRATION_DAYS_LEFT,
    isSort: true,
    mapper: 'expiration_days',
  },
  {
    label: TABLE_LABELS?.STATUS,
    align: 'center',
    mapper: 'status',
    component: COMPONENTS?.switch,
    showInHeader: false,
  },
  {
    label: TABLE_LABELS?.ACTION,
    component: COMPONENTS?.longmenu,
    menuArray: BranchTableMenus,
  },
];

export const ALL = {
  label: 'Select',
  value: 'All',
};
