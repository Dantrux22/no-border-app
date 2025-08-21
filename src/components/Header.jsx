// src/components/Header.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Platform, StatusBar, Modal
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { colors } from './global/colors';
import { clearUser } from '../redux/userSlice';
import { logoutUser } from '../db/auth';

// RTK Query followers
import {
  useGetFollowStatsQuery,
  useFollowMutation,
  useUnfollowMutation,
} from '../redux/services/firebaseApi';

// Firebase Auth (para UID anónimo)
import { ensureFirebaseAuth } from '../firebaseAuth';
import { getAuth } from 'firebase/auth';

// Contador global en RTDB
import { bumpSupporters } from '../firebaseRtdb';

export default function Header() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((s) => s.user?.currentUser);

  const username = user?.username || 'usuario';
  const avatarEmoji = user?.avatar || '🙂';
  const avatarUrl = user?.avatarUrl || null;
  const isUrl = typeof avatarUrl === 'string' && /^https?:\/\//.test(avatarUrl);

  const [menuVisible, setMenuVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── UID Firebase para follow/unfollow (no confundir con SQLite)
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await ensureFirebaseAuth(); // inicia anónimo si hace falta
        const uid = getAuth().currentUser?.uid || null;
        if (mounted) setFirebaseUid(uid);
      } catch (e) {
        console.log('ensureFirebaseAuth error:', e);
      } finally {
        if (mounted) setAuthReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // followers: lee contador y si "yo" sigo (según firebaseUid)
  const {
    data: followData,
    isFetching,
    isError,
    refetch,
  } = useGetFollowStatsQuery({ uid: firebaseUid }, { skip: !authReady });

  const [follow,   { isLoading: following }]  = useFollowMutation();
  const [unfollow, { isLoading: unfollowing }] = useUnfollowMutation();

  const me = !!followData?.me;          // ¿sigo a No Border?
  const count = followData?.count ?? 0; // total seguidores

  const safeTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 20;
  const HEADER_HEIGHT = 64;
  const panelTopPadding = useMemo(() => safeTop + HEADER_HEIGHT, [safeTop]);

  const openMenu  = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const goNested = (screenName) => navigation.navigate(screenName);
  const goHome    = () => { closeMenu(); goNested('Home'); };
  const goProfile = () => { closeMenu(); goNested('UserProfile'); };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutUser();
      dispatch(clearUser());
    } catch (e) {
      console.log('❌ logout sqlite error:', e);
    } finally {
      closeMenu();
      navigation.closeDrawer?.();
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] })
      );
      setLoggingOut(false);
    }
  };

  const onToggleFollow = useCallback(async () => {
    try {
      if (!getAuth().currentUser) await ensureFirebaseAuth();
    } catch (e) {
      console.log('ensureFirebaseAuth inline error:', e);
    }
    const uid = getAuth().currentUser?.uid || null;
    if (!uid) {
      closeMenu();
      navigation.navigate('Auth');
      return;
    }
    try {
      if (me) {
        await unfollow({ uid }).unwrap();     // borra app/noborder/followers/<uid>
        await bumpSupporters(-1);             // RTDB --
      } else {
        await follow({ uid }).unwrap();       // crea/mergea app/noborder/followers/<uid>
        await bumpSupporters(+1);             // RTDB ++
      }
      await refetch(); // refresca contador + "me"
    } catch (e) {
      console.log('❌ followers toggle error:', e);
      await refetch();
    }
  }, [me, follow, unfollow, navigation, refetch, closeMenu]);

  const supportDisabled = following || unfollowing || isFetching || !authReady;

  return (
    <View style={[styles.safeArea, { paddingTop: safeTop }]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={openMenu} style={styles.left} activeOpacity={0.7}>
          <View style={styles.avatar}>
            {isUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
            )}
          </View>
          <Text style={styles.username} numberOfLines={1} ellipsizeMode="tail">
            @{username}
          </Text>
        </TouchableOpacity>

        <View style={styles.centerWrap} pointerEvents="none">
          <Text style={styles.brand} numberOfLines={1}>No Border</Text>
        </View>

        <View style={styles.rightSpace} />
      </View>

      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={closeMenu}>
        <View style={styles.overlayRow}>
          <View style={[styles.sidePanel, { paddingTop: panelTopPadding }]}>
            <Text style={styles.panelHeader} numberOfLines={1}>@{username}</Text>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={goHome}>
              <Text style={styles.menuText}>Inicio</Text>
              <Text style={styles.menuSub}>Volver al feed</Text>
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={goProfile}>
              <Text style={styles.menuText}>Ver perfil</Text>
              <Text style={styles.menuSub}>Tu información pública</Text>
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            <TouchableOpacity
              style={[styles.menuItem, loggingOut && { opacity: 0.6 }]}
              activeOpacity={0.7}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              <Text style={styles.menuText}>{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</Text>
              <Text style={styles.menuSub}>Salir de tu cuenta</Text>
            </TouchableOpacity>

            {/* ─────────── Seguinos (No Border) ─────────── */}
            <View style={styles.itemDivider} />

            <View style={styles.followCard}>
              <Text style={styles.followTitle}>✨ Seguinos (No Border)</Text>
              <Text style={styles.followCount}>
                {!authReady
                  ? 'Preparando…'
                  : isFetching
                    ? 'Cargando…'
                    : isError
                      ? 'Sin conexión'
                      : `${count} seguidores`}
              </Text>

              <TouchableOpacity
                style={[
                  styles.followBtn,
                  me ? styles.followingBtn : styles.notFollowingBtn,
                  supportDisabled && { opacity: 0.7 },
                ]}
                activeOpacity={0.8}
                onPress={onToggleFollow}
                disabled={supportDisabled && !isError}
              >
                <Text style={styles.followBtnText}>
                  {!authReady
                    ? '...'
                    : isFetching
                      ? '...'
                      : me
                        ? 'Siguiendo'
                        : 'Seguir'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 16 }} />
          </View>
          <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={closeMenu} />
        </View>
      </Modal>
    </View>
  );
}

const AV = 28;
const PANEL_WIDTH = 220;

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.FONDO_CARDS },
  container: {
    height: 64, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, position: 'relative', backgroundColor: colors.FONDO_CARDS,
  },
  left: { flexDirection: 'row', alignItems: 'center', maxWidth: '55%' },
  avatar: {
    width: AV, height: AV, borderRadius: AV / 2, backgroundColor: '#1f1f1f',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 8,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarEmoji: { fontSize: 16 },
  username: { color: colors.BLANCO, fontWeight: '600', maxWidth: 160 },
  centerWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  brand: { color: colors.BLANCO, fontWeight: 'bold', fontSize: 18 },
  rightSpace: { width: AV + 8 + 160 },

  overlayRow: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.35)' },
  sidePanel: {
    width: PANEL_WIDTH, backgroundColor: colors.FONDO_CARDS, paddingHorizontal: 14,
    alignSelf: 'stretch', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#FFFFFF22',
  },
  panelHeader: { color: colors.BLANCO, fontWeight: '800', fontSize: 16, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#FFFFFF22', marginBottom: 6 },
  itemDivider: { height: 1, backgroundColor: '#FFFFFF14', marginVertical: 6 },
  menuItem: { paddingVertical: 14 },
  menuText: { color: colors.BLANCO, fontSize: 16, fontWeight: '600' },
  menuSub: { color: colors.TEXTO_SECUNDARIO, fontSize: 12, marginTop: 2 },
  dismissArea: { flex: 1 },

  // ── Estilos del bloque "Seguinos"
  followCard: {
    backgroundColor: colors.FONDO,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  followTitle: {
    color: colors.BLANCO,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 4,
  },
  followCount: {
    color: colors.TEXTO_SECUNDARIO,
    fontSize: 13,
    marginBottom: 10,
  },
  followBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  notFollowingBtn: {
    backgroundColor: colors.PRIMARIO,
  },
  followingBtn: {
    backgroundColor: colors.GRIS_INTERMEDIO,
  },
  followBtnText: {
    color: colors.BLANCO,
    fontWeight: '700',
    fontSize: 14,
  },
});
