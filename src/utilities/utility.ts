import { USER_TYPE } from '@constants/constants';
import { store } from '@shared/store';

/* eslint-disable no-param-reassign */
export const getNoOfPages = (dataLenth: number, perPage: number | string = 10): any => {
  let page = 1;
  if (dataLenth && typeof perPage === 'number') {
    page = Math.ceil(dataLenth / perPage);
    return page < 1 ? 1 : page;
  }
  return page;
};

export const csvFileToArray = (string: string) => {
  const csvHeader = string.slice(0, string.indexOf('\n')).split(',');
  const csvRows = string.slice(string.indexOf('\n') + 1).split('\n');

  const array = csvRows.map((i: any) => {
    const values = i.split(',');
    const obj = csvHeader.reduce((object: any, header: any, index: number) => {
      object[header] = values[index];
      return object;
    }, {});
    return obj;
  });

  return array;
};

export const importData = async () => {
  const input: any = document.createElement('input');
  input.type = 'file';
  input.onchange = () => {
    const files = Array.from(input?.files);
    // console.log('files', files);
    return files;
  };
  input.click();
};

export const incrementDateByOne = (dt: Date | string, n?: number) => new Date(new Date(dt).setDate(new Date(dt).getDate() + (n ?? 1)));
export const incrementYearByOne = (dt: Date | string) => {
  const tg = new Date(new Date(dt).setFullYear(new Date(dt).getFullYear() + 1));
  return new Date(new Date(tg).setDate(new Date(tg).getDate() - 1));
};

export const dateRange = (length = 4) => Array.from({ length }, (_, index) => {
  const rg = `${new Date(Date.now()).getFullYear() + (length - index) - 1}-${new Date(Date.now()).getFullYear() + (length - index)}`;
  return ({
    label: rg,
    value: rg
  });
});

export function passwordGenerator(len = 10) {
  const length = (len) || (10);
  const string = 'abcdefghijklmnopqrstuvwxyz'; // to upper
  const numeric = '0123456789';
  const punctuation = '@#$';
  let password = '';
  let character = '';
  while (password.length < length) {
    const entity1 = Math.ceil(string.length * Math.random() * Math.random());
    const entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
    const entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
    let hold = string.charAt(entity1);
    hold = (password.length % 2 === 0) ? (hold.toUpperCase()) : (hold);
    character += hold;
    character += numeric.charAt(entity2);
    character += punctuation.charAt(entity3);
    password = character;
  }
  password = password.split('').sort(() => 0.5 - Math.random()).join('');
  return password;
}
export const userRole = () => {
  const { user } = store.getState();
  return ({
    isSuperAdmin: user.role.name === USER_TYPE.SUPER_ADMIN,
    isSubAdmin: user.role.name === USER_TYPE.SUB_ADMIN,
    isSchoolAdmin: user.role.name === USER_TYPE.SCHOOL_ADMIN,
    isBranchAdmin: user.role.name === USER_TYPE.BRANCH_ADMIN,
    isTeacher: user.role.name === USER_TYPE.TEACHER,
    isParent: user.role.name === USER_TYPE.PARENTS,
    isStudent: user.role.name === USER_TYPE.STUDENT
  });
};

// capitalise 1st letter of the string
export function capitalizeFirstLetter(string: any) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function capEveryFirstLetter(str: string) {
  const arr = str.split(' ');
  for (let i = 0; i < arr.length; i += 1) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  const str2 = arr.join(' ');
  return str2;
}

export function currentUserAcademicDate() {
  const { schoolData, branchData } = store.getState().school;
  const dates = {
    start: null,
    end: null
  } as any;
  if (schoolData) {
    dates.start = new Date(schoolData.activation_start_date);
    dates.end = new Date(schoolData.activation_end_date);
  }
  if (branchData) {
    dates.start = new Date(branchData.activation_start_date);
    dates.end = new Date(branchData.activation_end_date);
  }
  return dates;
}

export const sortData = (a: any, b: any) => {
  if (a.label < b.label) {
    return -1;
  }
  if (a.label > b.label) {
    return 1;
  }
  return 0;
};
export const sortByName = (a: any, b: any) => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
};
