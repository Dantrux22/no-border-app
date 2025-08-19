import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // ✅ ruta correcta

const mapDoc = (snap) => ({ id: snap.id, ...snap.data() });

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Posts', 'Saved'],
  endpoints: (builder) => ({
    getUserPosts: builder.query({
      async queryFn({ userId, pageSize = 50 }) {
        try {
          const q = query(
            collection(db, 'posts'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
          );
          const snap = await getDocs(q);
          return { data: snap.docs.map(mapDoc).filter(p => !p.repostedFrom) };
        } catch (e) {
          return { error: String(e?.message || e) };
        }
      },
      providesTags: (_r, _e, arg) => [{ type: 'Posts', id: arg?.userId || 'ME' }],
    }),
    getUserReposts: builder.query({
      async queryFn({ userId, pageSize = 50 }) {
        try {
          const q = query(
            collection(db, 'posts'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
          );
          const snap = await getDocs(q);
          return { data: snap.docs.map(mapDoc).filter(p => !!p.repostedFrom) };
        } catch (e) {
          return { error: String(e?.message || e) };
        }
      },
      providesTags: (_r, _e, arg) => [{ type: 'Posts', id: `reposts-${arg?.userId || 'ME'}` }],
    }),
    getSavedPosts: builder.query({
      async queryFn({ userId }) {
        try {
          // Ajustalo a tu modelo real. Si usás users/{uid}/saves/{postId} decime y lo cambio.
          const q = query(collection(db, 'saved'), where('userId', '==', userId));
          const snap = await getDocs(q);
          return { data: snap.docs.map(mapDoc) };
        } catch (e) {
          return { error: String(e?.message || e) };
        }
      },
      providesTags: (_r, _e, arg) => [{ type: 'Saved', id: arg?.userId || 'ME' }],
    }),
  }),
});

export const {
  useGetUserPostsQuery,
  useGetUserRepostsQuery,
  useGetSavedPostsQuery,
} = postsApi;

export default postsApi;
