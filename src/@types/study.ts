import type { PickedFile } from "./media";
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
export type UpdateCourseInput = components["schemas"]["UpdateCourseInputBody"];
export type AddCourseFileInput =
  components["schemas"]["AddCourseFileInputBody"];
export type CourseFormValues = Omit<
  CreateCourseInput,
  "universityId" | "description"
> & {
  description: string;
  /** create only: uploaded and attached once the course exists */
  materials: PickedFile[];
  materialType: CourseFileType;
};

export type MaterialTab = "reviews" | "professors" | "mine";
