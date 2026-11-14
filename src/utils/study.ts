import type { Profile, Programme } from "@/@types/profile";
import type {
  Course,
  CourseFileType,
  CourseFormValues,
  MaterialTab,
} from "@/@types/study";

export const MATERIAL_TABS: readonly (readonly [MaterialTab, string])[] = [
  ["reviews", "app.courseReviews"],
  ["professors", "app.professorRatings"],
  ["mine", "app.myUploads"],
];

export const FILE_TYPES = {
  exam: "study.typeExam",
  colloquium: "study.typeColloquium",
  lab: "study.typeLab",
  notes: "study.typeNotes",
} as const satisfies Record<CourseFileType, string>;

// shared by courses, files and comments: 30 creates per hour
export const STUDY_CREATE_ERRORS: Record<number, string> = {
  429: "study.rateLimit",
};

export const SEMESTERS = Array.from({ length: 12 }, (_, index) => index + 1);

export const primaryProgramme = (profile?: Profile): Programme | undefined =>
  profile?.programmes?.find(({ isPrimary }) => isPrimary) ??
  profile?.programmes?.[0];

// a new course starts in the student's primary programme, as on the web; an edited one from itself
export const toCourseValues = (
  profile?: Profile,
  course?: Course,
): CourseFormValues => ({
  name: course?.name ?? "",
  description: course?.description ?? "",
  difficulty: course?.difficulty ?? 3,
  faculty: course?.faculty ?? primaryProgramme(profile)?.faculty ?? "",
  subject: course?.subject ?? "",
  semester: course?.semester ?? 1,
  materials: [],
  materialType: "exam",
});

const sameText = (a: string, b: string) =>
  a.trim().toLocaleLowerCase("pl") === b.trim().toLocaleLowerCase("pl");

// the API accepts materials only for the student's university and primary programme
export const canUploadCourseMaterial = (
  profile: Profile | undefined,
  course: Pick<Course, "universityId" | "subject" | "faculty">,
) => {
  const programme = profile?.programmes?.find(({ isPrimary }) => isPrimary);
  return (
    !!profile &&
    !!programme &&
    profile.universityId === course.universityId &&
    sameText(programme.programme, course.subject) &&
    sameText(programme.faculty, course.faculty)
  );
};
