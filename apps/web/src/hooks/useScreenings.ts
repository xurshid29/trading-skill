import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { screeningsApi } from '../api/screenings';
import type { CreateScreeningRequest, UpdateResultRequest } from '../api/types';

export const screeningKeys = {
  all: ['screenings'] as const,
  lists: () => [...screeningKeys.all, 'list'] as const,
  list: (limit?: number, offset?: number) => [...screeningKeys.lists(), { limit, offset }] as const,
  details: () => [...screeningKeys.all, 'detail'] as const,
  detail: (id: string) => [...screeningKeys.details(), id] as const,
  results: (id: string, filters?: { tier?: string; pattern?: string }) =>
    [...screeningKeys.detail(id), 'results', filters] as const,
};

export function useScreenings(limit = 20, offset = 0) {
  return useQuery({
    queryKey: screeningKeys.list(limit, offset),
    queryFn: () => screeningsApi.list(limit, offset),
  });
}

export function useScreening(id: string, options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: screeningKeys.detail(id),
    queryFn: () => screeningsApi.getById(id),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  });
}

export function useScreeningResults(
  screeningId: string,
  filters?: { tier?: string; pattern?: string }
) {
  return useQuery({
    queryKey: screeningKeys.results(screeningId, filters),
    queryFn: () => screeningsApi.getResults(screeningId, filters),
    enabled: !!screeningId,
  });
}

export function useCreateScreening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScreeningRequest) => screeningsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: screeningKeys.lists() });
    },
  });
}

export function useDeleteScreening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => screeningsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: screeningKeys.lists() });
    },
  });
}

export function useUpdateResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resultId, data }: { resultId: string; data: UpdateResultRequest }) =>
      screeningsApi.updateResult(resultId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: screeningKeys.all });
    },
  });
}
