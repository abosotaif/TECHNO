import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import type { RootState } from '@/app/store';
import { clearCredentials } from '@/features/auth/authSlice';

const baseUrl = import.meta.env.VITE_API_URL || '/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');
    return headers;
  },
});

// Wrap base query so 401 responses automatically clear credentials.
const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  apiArg,
  extra,
) => {
  const result = await rawBaseQuery(args, apiArg, extra);
  if (result.error?.status === 401) {
    apiArg.dispatch(clearCredentials());
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Product', 'Me', 'Order'],
  endpoints: () => ({}),
});
