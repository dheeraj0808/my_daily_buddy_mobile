export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiDataResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export function unwrapData<T>(response: { data: ApiDataResponse<T> }): T {
  return response.data.data;
}

export function unwrapPaginated<T>(response: {
  data: ApiDataResponse<T[]> & { meta: PaginationMeta };
}): PaginatedResponse<T> {
  return { data: response.data.data, meta: response.data.meta };
}
