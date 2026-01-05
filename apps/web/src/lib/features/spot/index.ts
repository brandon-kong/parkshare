import { clientApi } from "@/lib/api/client";
import { serverApi } from "@/lib/api/server";
import type {
  CreateSpotInput,
  Spot,
  SpotPhoto,
  UpdateSpotInput,
} from "./types";

// For server components
export const spotsApi = {
  list: () => serverApi.get<Spot[]>("/api/v1/spots"),
  get: (id: string) => serverApi.get<Spot>(`/api/v1/spots/${id}`),
  create: (data: CreateSpotInput) =>
    serverApi.post<Spot>("/api/v1/spots", data),
  update: (id: string, data: UpdateSpotInput) =>
    serverApi.put<Spot>(`/api/v1/spots/${id}`, data),
  delete: (id: string) =>
    serverApi.delete<{ message: string }>(`/api/v1/spots/${id}`),
};

// For client components
export const spotsClientApi = {
  list: () => clientApi.get<Spot[]>("/api/v1/spots"),
  get: (id: string) => clientApi.get<Spot>(`/api/v1/spots/${id}`),
  create: (data: CreateSpotInput) =>
    clientApi.post<Spot>("/api/v1/spots", data),
  update: (id: string, data: UpdateSpotInput) =>
    clientApi.put<Spot>(`/api/v1/spots/${id}`, data),
  delete: (id: string) =>
    clientApi.delete<{ message: string }>(`/api/v1/spots/${id}`),
  uploadPhotos: (spotId: string, files: File[]) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("photos", file);
    }
    return clientApi.postFormData<SpotPhoto[]>(
      `/api/v1/spots/${spotId}/photos`,
      formData,
    );
  },
  publish: (spotId: string) =>
    clientApi.post<Spot>(`/api/v1/spots/${spotId}/publish`, {}),
  unpublish: (spotId: string) =>
    clientApi.post<Spot>(`/api/v1/spots/${spotId}/unpublish`, {}),
};
