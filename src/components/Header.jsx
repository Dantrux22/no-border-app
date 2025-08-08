import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from './global/colors';

export default function Header({ title = 'No Border', avatar }) {
  const isUrl = typeof avatar === 'string' && /^https?:\/\//.test(avatar);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>
        <View style={styles.avatar}>
          {isUrl ? <Image source={{ uri: avatar }} style={styles.avatarImg} /> : <Text style={styles.avatarEmoji}>{avatar || '🙂'}</Text>}
        </View>
      </View>
    </View>
  );
}

const AV = 32;
const styles = StyleSheet.create({
  container: { height: 64, backgroundColor: colors.FONDO_CARDS, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  title: { color: colors.BLANCO, fontWeight: 'bold', fontSize: 18 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: AV, height: AV, borderRadius: AV/2, backgroundColor: '#1f1f1f', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarEmoji: { fontSize: 18 },
  avatarImg: { width: '100%', height: '100%' },
});
