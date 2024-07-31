export interface OBJECT {
  label: string;
  value: string;
}

export interface ScromPage {
  label: string;
  value: string;
  pageName?: string;
  pageNumber?: string;
  chapter_id?: string;
  chapterMainId?: string;
  chapter_name?: string;
  lessonUnitName?: string;
  course_id?: string;
  course_table_id?: number;
  id?: string | null;
  contentUrl?: string;
  moduleName?: string;
  lessonId?: string;
  urlLessonId?: string;
  courseId?: string;
  assignmentId?: string;
}
