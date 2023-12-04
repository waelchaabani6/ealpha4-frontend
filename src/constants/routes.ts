export const SCHOOL_MANAGEMENT = '/school-management';
export const PUBLISHER = '/publisher';
export const SCHOOL = 'school';
export const PANEL = 'panel';
export const BRANCHES = 'branches';
export const BRANCH = 'branch';
export const LIST = 'list';
export const MANAGE_COURSES = '/manage-courses';
export const MANAGE_INTEGRATION = '/integration';
export const ADMIN_PANEL = 'admin-panel';
export const MANAGE_ADMIN = 'manage-admin';
export const NEW_BRANCH = 'new-branch';
export const MANAGE_CLASSES = 'manage-classes';
export const EDIT = 'edit';
export const MANAGE_BRANCHES = 'manage-branches';
export const MANAGE_MEMBERS = 'manage-members';
export const ADD_TEACHER = 'add-teacher';
export const EDIT_TEACHER = 'edit-teacher';
export const ADD_STUDENT = 'add-student';
export const EDIT_STUDENT = 'edit-student';
export const ADD_PARENT = 'add-parent';
export const EDIT_PARENT = 'edit-parent';
export const ASSIGN_CLASSES = 'assign-classes';
export const PROMOTE_STUDENT = 'promote-student';
export const IMPORT_MEMBERS = 'import-member';
export const PREVIEW = 'preview';

export default {
  HOME_URL: '/',
  DASHBOARD: '/dashboard',
  CALENDAR: '/calendar',
  PUBLISHER,
  PUBLISHER__COURSE_CODE: `${PUBLISHER}/course-code`,
  PUBLISHER__ASSIGNED_COURSE: `${PUBLISHER}/assigned-course`,
  PUBLISHER__COURSE_PERMISSION: `${PUBLISHER}/manage-course-permission`,
  SCHOOL_MANAGEMENT,
  SCHOOL_MANAGEMENT__ADD: `${SCHOOL_MANAGEMENT}/new-school`,
  SCHOOL_MANAGEMENT__ALL_SCHOOLS: `${SCHOOL_MANAGEMENT}/all-schools`,
  CALENDAR_SCHEDULE: `${SCHOOL_MANAGEMENT}/Schedule`,
  SCHOOL_MANAGEMENT__BRANCH_PANEL: `${SCHOOL_MANAGEMENT}/school/1223/branch/096348/panel`,
  MANAGE_COURSES,
  MANAGE_COURSES_MASTER: `${MANAGE_COURSES}/add-course`,
  MANAGE_COURSES_UPLOAD: `${MANAGE_COURSES}/upload-course`,
  ADMIN_PANEL: '/admin-panel',
  MANAGE_INTEGRATION,
  INTEGRATIONS: `/integration`,
  SUBSCRIPTIONS: `${MANAGE_INTEGRATION}/subscription`,
  INFORMATIVE_PAGES: '/infomative-pages',
  NOTIFICATION: '/notification',
  MANAGE_ADMIN: `/${ADMIN_PANEL}/${MANAGE_ADMIN}`,
  GENERATE_COURSE_CODE: `${PUBLISHER}/generate-course-code`,
  IMPORT_MEMBERS: `${SCHOOL_MANAGEMENT}/schools/import-member`,
  ADD_INFORMATIVE_PAGE: `/infomative-pages/add-informative-page`
};
