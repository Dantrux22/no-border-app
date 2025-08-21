// src/redux/services/firebaseApi.js
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { db } from '../../firebaseConfig';
import {
  doc, collection, getDoc, setDoc, deleteDoc,
  serverTimestamp, getCountFromServer
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import app from '../../firebaseConfig';

async function ensureFirebaseAuth() {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth(app);
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser;
}

const ROOT_DOC = doc(db, 'app', 'noborder');
const FOLLOWERS = collection(ROOT_DOC, 'followers');

export const firebaseApi = createApi({
  reducerPath: 'firebaseApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Follow'],
  endpoints: (builder) => ({
    getFollowStats: builder.query({
      async queryFn({ uid } = {}) {
        try {
          const current = uid || (await ensureFirebaseAuth())?.uid || null;

          const agg = await getCountFromServer(FOLLOWERS);
          const count = agg.data().count ?? 0;

          let me = false;
          if (current) {
            const myDoc = await getDoc(doc(FOLLOWERS, current));
            me = myDoc.exists();
          }

          return { data: { count, me } };
        } catch (e) {
          return { error: { message: e?.message || 'firestore/getFollowStats failed' } };
        }
      },
      providesTags: [{ type: 'Follow', id: 'LIST' }],
    }),

    follow: builder.mutation({
      async queryFn({ uid } = {}, { dispatch }) {
        try {
          const current = uid || (await ensureFirebaseAuth())?.uid;
          if (!current) throw new Error('missing-uid');
          await setDoc(doc(FOLLOWERS, current), { since: serverTimestamp() }, { merge: true });
          dispatch(firebaseApi.util.invalidateTags([{ type: 'Follow', id: 'LIST' }]));
          return { data: { ok: true } };
        } catch (e) {
          return { error: { message: e?.message || 'firestore/follow failed' } };
        }
      },
    }),

    unfollow: builder.mutation({
      async queryFn({ uid } = {}, { dispatch }) {
        try {
          const current = uid || (await ensureFirebaseAuth())?.uid;
          if (!current) throw new Error('missing-uid');
          await deleteDoc(doc(FOLLOWERS, current));
          dispatch(firebaseApi.util.invalidateTags([{ type: 'Follow', id: 'LIST' }]));
          return { data: { ok: true } };
        } catch (e) {
          return { error: { message: e?.message || 'firestore/unfollow failed' } };
        }
      },
    }),
  }),
});

export const {
  useGetFollowStatsQuery,
  useFollowMutation,
  useUnfollowMutation,
} = firebaseApi;
