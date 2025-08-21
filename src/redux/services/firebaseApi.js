// src/redux/services/firebaseApi.js
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { db } from '../../firebaseConfig';
import {
  doc, collection, getDoc, setDoc, deleteDoc,
  serverTimestamp, getCountFromServer
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import app from '../../firebaseConfig';

// Asegura sesión Firebase (anónima) — útil si el usuario no inició nada aún
async function ensureFirebaseAuth() {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth(app);
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser;
}

// Estructura Firestore: app / noborder / followers / <uid>
const ROOT_DOC = doc(db, 'app', 'noborder');
const FOLLOWERS = collection(ROOT_DOC, 'followers');

export const firebaseApi = createApi({
  reducerPath: 'firebaseApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Follow'],
  endpoints: (builder) => ({
    // Lee: total de seguidores + si YO sigo (me)
    getFollowStats: builder.query({
      async queryFn({ uid } = {}) {
        try {
          // si no vino uid, garantizamos uno anónimo (para poder resolver "me")
          const current = uid || (await ensureFirebaseAuth())?.uid || null;

          // 1) contador (aggregate)
          const agg = await getCountFromServer(FOLLOWERS);
          const count = agg.data().count ?? 0;

          // 2) me = existe doc app/noborder/followers/<uidFirebase> ?
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

    // Seguir: crea/mergea doc del UID Firebase
    follow: builder.mutation({
      async queryFn({ uid } = {}, { dispatch }) {
        try {
          const current = uid || (await ensureFirebaseAuth())?.uid;
          if (!current) throw new Error('missing-uid');
          await setDoc(doc(FOLLOWERS, current), { since: serverTimestamp() }, { merge: true });
          // invalidar lista para que refresque
          dispatch(firebaseApi.util.invalidateTags([{ type: 'Follow', id: 'LIST' }]));
          return { data: { ok: true } };
        } catch (e) {
          return { error: { message: e?.message || 'firestore/follow failed' } };
        }
      },
    }),

    // Dejar de seguir: borra doc del UID Firebase
    unfollow: builder.mutation({
      async queryFn({ uid } = {}, { dispatch }) {
        try {
          const current = uid || (await ensureFirebaseAuth())?.uid;
          if (!current) throw new Error('missing-uid');
          await deleteDoc(doc(FOLLOWERS, current));
          // invalidar lista para que refresque
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
