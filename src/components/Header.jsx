// src/components/Header.jsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Platform, StatusBar, Modal
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors } from './global/colors';
import { navigationRef } from '../navigation/navigationRef';
import { clearUser } from '../redux/userSlice';
import { logoutUser } from '../db/auth';

// Firestore RTK Query (seguidores No Border)
import {
  useGetFollowStatsQuery,
  useFollowMutation,
  useUnfollowMutation,
} from '../redux/services/firebaseApi';

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user?.currentUser);

  const uid = user?.id || null;
  const username = user?.username || 'usuario';
  const avatarEmoji = user?.avatar || '🙂';
  const avatarUrl = user?.avatarUrl || null;
  const isUrl = typeof avatarUrl === 'string' && /^https?:\/\//.test(avatarUrl);

  const [menuVisible, setMenuVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // followers: contador global + si yo sigo
  const { data, isFetching, isError, refetch } = useGetFollowStatsQuery({ uid });
  const [follow,   { isLoading: following }]  = useFollowMutation();
  const [unfollow, { isLoading: unfollowing }] = useUnfollowMutation();

  const me = !!data?.me;
  const count = data?.count ?? 0;

  const safeTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 20;
  const HEADER_HEIGHT = 64;
  const panelTopPadding = useMemo(() => safeTop + HEADER_HEIGHT, [safeTop]);

  const openMenu  = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const goNested = (screenName) => {
    if (!navigationRef.isReady()) return;
    const rootNames = navigationRef.getRootState?.()?.routeNames || [];
    if (rootNames.includes('App')) {
      navigationRef.navigate('App', { screen: screenName });
    } else {
      navigationRef.navigate(screenName);
    }
  };

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
      setLoggingOut(false);
      closeMenu();
    }
  };

  const onToggleFollow = useCallback(async () => {
    if (!uid) {
      closeMenu();
      goNested('Auth'); // pedimos login local (tu flujo SQLite) para contar el apoyo por usuario
      return;
    }
    try {
      if (me) await unfollow({ uid }).unwrap();
      else    await follow({ uid }).unwrap();
      // RTK invalidates y actualiza; refetch opcional:
      // await refetch();
    } catch (e) {
      console.log('❌ followers toggle error:', e);
      // Si hubo error de Firestore, permitimos reintentar tocando el item
      refetch();
    }
  }, [uid, me, follow, unfollow, refetch]);

  const supportAction = isFetching ? 'Cargando…' : (isError ? 'Demostra tu apoyo' : (me ? 'Siguiendo' : 'Seguir'));
  const supportSub    = isFetching
    ? 'Obteniendo seguidores…'
    : (isError ? 'No se pudo cargar • Tocar para reintentar' : `${count} seguidores`);

  const supportDisabled = following || unfollowing || isFetching;

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

            {/* ─────────── NUEVO: apoyo No Border (al final del panel) ─────────── */}
            <View style={styles.itemDivider} />

            <TouchableOpacity
              style={[styles.menuItem, supportDisabled && { opacity: 0.7 }]}
              activeOpacity={0.7}
              onPress={onToggleFollow}
              disabled={supportDisabled && !isError} // si hay error: permitimos tocar para refetch
            >
              <Text style={styles.menuText}>Demostrar tu apoyo</Text>
              <Text style={styles.menuSub}>
                {supportAction} • {supportSub}
              </Text>
            </TouchableOpacity>
            {/* ─────────────────────────────────────────────────────────────────── */}

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
});
