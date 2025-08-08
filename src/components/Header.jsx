// src/components/Header.jsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from './global/colors';

export default function Header({ username = 'usuario', avatar }) {
  const isUrl = typeof avatar === 'string' && /^https?:\/\//.test(avatar);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          {isUrl ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarEmoji}>{avatar || '🙂'}</Text>
          )}
        </View>
        <Text
          style={styles.username}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          @{username}
        </Text>
      </View>

      <View style={styles.centerWrap} pointerEvents="none">
        <Text style={styles.brand} numberOfLines={1}>
          No Border
        </Text>
      </View>

      <View style={styles.rightSpace} />
    </View>
  );
}

const AV = 28;

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: colors.FONDO_CARDS,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    position: 'relative',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '45%',          
  },
  avatar: {
    width: AV, height: AV, borderRadius: AV / 2,
    backgroundColor: '#1f1f1f',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', marginRight: 8,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarEmoji: { fontSize: 16 },
  username: {
    color: colors.BLANCO,
    fontWeight: '600',
    maxWidth: 140,          
  },

  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: colors.BLANCO, fontWeight: 'bold', fontSize: 18 },

  rightSpace: {
    width: AV + 8 + 140,     
  },
});
