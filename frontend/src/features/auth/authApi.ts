import { api } from '@/features/api/api';
import { setCredentials, clearCredentials, type AuthUser } from '@/features/auth/authSlice';

interface AuthEnvelope {
  data: { user: AuthUser; token: string };
}

interface MeEnvelope {
  data: AuthUser;
}

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthEnvelope, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.data));
        } catch {
          /* handled by component via the returned error */
        }
      },
      invalidatesTags: ['Me'],
    }),

    register: build.mutation<
      AuthEnvelope,
      { name: string; email: string; password: string; password_confirmation: string }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.data));
        } catch {
          /* handled by component */
        }
      },
      invalidatesTags: ['Me'],
    }),

    me: build.query<MeEnvelope, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),

    logout: build.mutation<{ message: string }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
        }
      },
      invalidatesTags: ['Me'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useLogoutMutation,
} = authApi;
