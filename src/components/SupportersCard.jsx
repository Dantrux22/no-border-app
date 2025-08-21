// src/components/SupportersCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  useGetFollowStatsQuery,
  useFollowMutation,
  useUnfollowMutation,
} from '../redux/services/firebaseApi';
import { colors } from './global/colors';

export default function SupportersCard() {
  const { data, isFetching } = useGetFollowStatsQuery();
  const [follow] = useFollowMutation();
  const [unfollow] = useUnfollowMutation();

  if (isFetching) {
    return (
      <View style={styles.card}>
        <Text style={styles.loading}>Conectando...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.card}>
        <Text style={styles.error}>Sin conexión</Text>
      </View>
    );
  }

  const { count, isFollower } = data;

  const handlePress = () => {
    if (isFollower) {
      unfollow();
    } else {
      follow();
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>✨ Seguinos (No Border)</Text>
      <Text style={styles.count}>{count} seguidores</Text>
      <TouchableOpacity
        style={[styles.button, isFollower && styles.buttonActive]}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>
          {isFollower ? 'Siguiendo' : 'Seguir'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.FONDO_CARDS,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  title: {
    color: colors.TEXTO_PRINCIPAL,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  count: {
    color: colors.TEXTO_SECUNDARIO,
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    backgroundColor: colors.PRIMARIO,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonActive: {
    backgroundColor: colors.GRIS_INTERMEDIO,
  },
  buttonText: {
    color: colors.BLANCO,
    fontWeight: '600',
  },
  loading: {
    color: colors.TEXTO_SECUNDARIO,
  },
  error: {
    color: 'red',
  },
});
