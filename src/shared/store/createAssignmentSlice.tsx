import { createSlice } from '@reduxjs/toolkit';

export interface CreateAssignmentDataType {
    AssignmentName?: string;
    AssignmentStartDate?: string;
    AssignmentDueDate?: string;
    SelectCourse?: string;
    SelectGrade?: string;
    SelectComponents?: string;
    SelectVolume?: string;
    select_type?: string;
    SelectClass?: string;
    file?: any;
    comments?: string;
    CourseDetails: any;
    typeValue?: string;
    Classes?: any;
    GroupList?: any;
    idLots?: any;
    single_access?: boolean;
    block_after_due_date?: boolean;
    studentCheckbox?: any;
    courseCheckboxArray?: any;
    studentCheckboxList?: any;
    assignment_type?: string;
    select_components_id?: string;
    select_grade_id?: string;
    select_volume_id?: string;
    selected_class_id?: any;
    course_id?: string;
    course_table_id?: string;
    select_course_id?: string;
    GradeArray: any;
    select_class_array: string[];
}

const initialState: CreateAssignmentDataType = {
  AssignmentName: '',
  AssignmentStartDate: '',
  AssignmentDueDate: '',
  SelectCourse: '',
  SelectGrade: '',
  SelectComponents: '',
  SelectVolume: '',
  select_type: '',
  CourseDetails: [],
  SelectClass: '',
  file: '',
  comments: '',
  typeValue: '',
  GroupList: [],
  Classes: [],
  idLots: [],
  single_access: false,
  block_after_due_date: false,
  studentCheckbox: [],
  courseCheckboxArray: [],
  studentCheckboxList: [],
  assignment_type: '',
  select_components_id: '',
  select_grade_id: '',
  select_volume_id: '',
  selected_class_id: [],
  course_id: '',
  course_table_id: '',
  select_course_id: '',
  GradeArray: [],
  select_class_array: []
};

export const createAssignmentSlice = createSlice({
  name: 'createAssignment',
  initialState,
  reducers: {
    setAssignmentData: (state, { payload }) => {
      state.AssignmentName = payload.assignment_name;
      state.AssignmentStartDate = payload.assignment_start_date;
      state.AssignmentDueDate = payload.assignment_due_date;
      state.SelectCourse = payload.select_course;
      state.SelectGrade = payload.select_grade;
      state.SelectComponents = payload.select_components;
      state.SelectVolume = payload.select_volume;
      state.CourseDetails = payload.CourseDetails;
      state.select_type = payload.select_type;
      state.SelectClass = payload.select_class;
      state.typeValue = payload.typeValue;
      state.GroupList = payload.GroupList;
      state.Classes = payload.Classes;
      state.idLots = payload.idLots;
      state.comments = payload.comments;
      state.single_access = payload.single_access;
      state.block_after_due_date = payload.block_after_due_date;
      state.file = payload.file;
      state.studentCheckbox = payload.studentCheckbox;
      state.courseCheckboxArray = payload.courseCheckboxArray;
      state.studentCheckboxList = payload.studentCheckboxList;
      state.assignment_type = payload.assignment_type;
      state.select_components_id = payload.select_components_id;
      state.select_grade_id = payload.select_grade_id;
      state.select_volume_id = payload.select_volume_id;
      state.selected_class_id = payload.selected_class_id;
      state.course_table_id = payload.course_table_id;
      state.course_id = payload.course_id;
      state.select_course_id = payload.select_course_id;
      state.GradeArray = payload.GradeArray;
      state.select_class_array = payload.select_class_array;
    },
    resetAssignmentData: () => ({ ...initialState })
  }
});

export const { setAssignmentData, resetAssignmentData } = createAssignmentSlice.actions;
export const getAssignmentData = (state: any) => state.createAssignment;
export default createAssignmentSlice;
