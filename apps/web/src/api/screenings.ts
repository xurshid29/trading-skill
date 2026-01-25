import { apiClient } from './client';
import type {
  Screening,
  ScreeningWithResults,
  ScreeningResult,
  CreateScreeningRequest,
  UpdateResultRequest,
} from './types';

export const screeningsApi = {
  async list(limit = 20, offset = 0): Promise<Screening[]> {
    const response = await apiClient.get<Screening[]>(
      `/api/screenings?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  async getById(id: string): Promise<ScreeningWithResults> {
    const response = await apiClient.get<ScreeningWithResults>(`/api/screenings/${id}`);
    return response.data;
  },

  async create(data: CreateScreeningRequest): Promise<{ id: string; created_at: string }> {
    const response = await apiClient.post<{ id: string; created_at: string }>(
      '/api/screenings',
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/screenings/${id}`);
  },

  async getResults(
    screeningId: string,
    filters?: { tier?: string; pattern?: string }
  ): Promise<ScreeningResult[]> {
    const params = new URLSearchParams();
    if (filters?.tier) params.set('tier', filters.tier);
    if (filters?.pattern) params.set('pattern', filters.pattern);

    const queryString = params.toString();
    const url = `/api/screenings/${screeningId}/results${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ScreeningResult[]>(url);
    return response.data;
  },

  async updateResult(resultId: string, data: UpdateResultRequest): Promise<void> {
    await apiClient.patch(`/api/screenings/results/${resultId}`, data);
  },
};
