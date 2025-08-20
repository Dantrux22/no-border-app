// src/redux/services/firebaseApi.js
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { db } from '../../firebaseConfig';
import {
  doc, collection, getDoc, setDoc, deleteDoc,
  serverTimestamp, getCountFromServer
} from 'firebase/firestore';

// Estructura: app / noborder / followers / <uid>
const ROOT_DOC = doc(db, 'app', 'noborder');
const FOLLOWERS = collection(ROOT_DOC, 'followers');

export const firebaseApi = createApi({
  reducerPath: 'firebaseApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Follow'],
  endpoints: (builder) => ({
    // Lee contador total + si el usuario actual (uid) sigue o no
    getFollowStats: builder.query({
      async queryFn({ uid } = {}) {
        try {
          const agg = await getCountFromServer(FOLLOWERS);
          const count = agg.data().count ?? 0;

          let me = false;
          if (uid) {
            const myDoc = await getDoc(doc(FOLLOWERS, uid));
            me = myDoc.exists();
          }

          return { data: { count, me } };
        } catch (e) {
          return { error: { message: e?.message || 'firestore/getFollowStats failed' } };
        }
      },
      providesTags: [{ type: 'Follow', id: 'LIST' }],
    }),

    // Seguir (crea/mergea doc del uid)
    follow: builder.mutation({
      async queryFn({ uid }) {
        try {
          if (!uid) throw new Error('missing-uid');
          await setDoc(doc(FOLLOWERS, uid), { since: serverTimestamp() }, { merge: true });
          return { data: { ok: true } };
        } catch (e) {
          return { error: { message: e?.message || 'firestore/follow failed' } };
        }
      },
      invalidatesTags: [{ type: 'Follow', id: 'LIST' }],
    }),

    // Dejar de seguir (borra doc del uid)
    unfollow: builder.mutation({
      async queryFn({ uid }) {
        try {
          if (!uid) throw new Error('missing-uid');
          await deleteDoc(doc(FOLLOWERS, uid));
          return { data: { ok: true } };
        } catch (e) {
          return { error: { message: e?.message || 'firestore/unfollow failed' } };
        }
      },
      invalidatesTags: [{ type: 'Follow', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetFollowStatsQuery,
  useFollowMutation,
  useUnfollowMutation,
} = firebaseApi;
