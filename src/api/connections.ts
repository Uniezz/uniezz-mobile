import type {
  CandidateActionInput,
  DiscoverFilters,
  SaveConnectionPreferencesInput,
} from "@/@types/connections";
import { api } from "./client";

export async function getDiscoverCards(filters: DiscoverFilters) {
  const { data } = await api.GET("/connections/discover", {
    params: { query: { ...filters, limit: 20 } },
  });

  return data!;
}

export async function actOnCandidate({
  id,
  ...body
}: CandidateActionInput & { id: string }) {
  const { data } = await api.PUT("/connections/candidates/{id}", {
    params: { path: { id } },
    body,
  });

  return data!;
}

export async function getConnections(cursor?: string) {
  const { data } = await api.GET("/connections", {
    params: { query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function deleteConnection(id: string) {
  await api.DELETE("/connections/{id}", { params: { path: { id } } });
}

export async function getConnectionPreferences() {
  const { data } = await api.GET("/connections/me");

  return data!;
}

export async function updateConnectionPreferences(
  body: SaveConnectionPreferencesInput,
) {
  const { data } = await api.PATCH("/connections/me", { body });

  return data!;
}

export async function setStudentBlocked({
  id,
  blocked,
}: {
  id: string;
  blocked: boolean;
}) {
  const params = { path: { id } };
  if (blocked) {
    await api.PUT("/connections/blocks/{id}", { params });
  } else {
    await api.DELETE("/connections/blocks/{id}", { params });
  }
}
