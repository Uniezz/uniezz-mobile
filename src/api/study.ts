import type {
  CourseFilters,
  CreateCourseInput,
  StudyFileFilters,
} from "@/@types/study";
import { api } from "./client";

export async function getCourses(filters: CourseFilters, cursor?: string) {
  const { data } = await api.GET("/study/courses", {
    params: { query: { ...filters, cursor, limit: 20 } },
  });

  return data!;
}

export async function getCourse(id: string) {
  const { data } = await api.GET("/study/courses/{id}", {
    params: { path: { id } },
  });

  return data!;
}

export async function createCourse(body: CreateCourseInput) {
  const { data } = await api.POST("/study/courses", { body });

  return data!;
}

export async function rateCourse({
  id,
  rating,
}: {
  id: string;
  rating: number;
}) {
  const { data } = await api.PUT("/study/courses/{id}/rating", {
    params: { path: { id } },
    body: { rating },
  });

  return data!;
}

export async function getCourseComments(id: string, cursor?: string) {
  const { data } = await api.GET("/study/courses/{id}/comments", {
    params: { path: { id }, query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function addCourseComment({
  id,
  content,
}: {
  id: string;
  content: string;
}) {
  const { data } = await api.POST("/study/courses/{id}/comments", {
    params: { path: { id } },
    body: { content },
  });

  return data!;
}

export async function deleteCourseComment(id: string) {
  await api.DELETE("/study/comments/{id}", { params: { path: { id } } });
}

export async function getCourseFiles(id: string, cursor?: string) {
  const { data } = await api.GET("/study/courses/{id}/files", {
    params: { path: { id }, query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function searchStudyFiles(
  filters: StudyFileFilters,
  cursor?: string,
) {
  const { data } = await api.GET("/study/files", {
    params: { query: { ...filters, cursor, limit: 20 } },
  });

  return data!;
}

export async function getStudyFile(id: string) {
  const { data } = await api.GET("/study/files/{id}", {
    params: { path: { id } },
  });
  return data!;
}

export async function deleteStudyFile(id: string) {
  await api.DELETE("/study/files/{id}", { params: { path: { id } } });
}

export async function getProfessors(universityId: string, cursor?: string) {
  const { data } = await api.GET("/study/professors", {
    params: { query: { universityId, cursor, limit: 20 } },
  });

  return data!;
}

export async function getProfessor(id: string) {
  const { data } = await api.GET("/study/professors/{id}", {
    params: { path: { id } },
  });

  return data!;
}

export async function rateProfessor({
  id,
  rating,
}: {
  id: string;
  rating: number;
}) {
  const { data } = await api.PUT("/study/professors/{id}/rating", {
    params: { path: { id } },
    body: { rating },
  });

  return data!;
}
