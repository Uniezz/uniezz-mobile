import type { components, operations } from "./schema";

export type Course = components["schemas"]["Course"];
export type CourseComment = components["schemas"]["CourseComment"];
export type CourseFile = components["schemas"]["CourseFile"];
export type CourseFileType = CourseFile["type"];
export type Professor = components["schemas"]["Professor"];
export type CreateCourseInput = components["schemas"]["CreateCourseInputBody"];
export type CourseFilters = Omit<
  NonNullable<operations["listCourses"]["parameters"]["query"]>,
  "cursor" | "limit"
>;
export type StudyFileFilters = Omit<
  NonNullable<operations["searchFiles"]["parameters"]["query"]>,
  "cursor" | "limit"
>;
export type CreateCourseFormValues = Omit<
  CreateCourseInput,
  "universityId" | "semester"
> & { semester: string };

export type MaterialTab = "reviews" | "professors" | "mine";
