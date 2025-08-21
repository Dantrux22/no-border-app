// src/components/common/LocationPickerRow.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { pickUserLocationOnce } from '../../utils/location';
import { colors } from '../global/colors';

export default function LocationPickerRow({ value, onChange }) {
  const [loading, setLoading] = useState(false);

  const handlePick = async () => {
    try {
      setLoading(true);
      const loc = await pickUserLocationOnce(); 
      onChange?.(loc);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Ionicons name="location-outline" size={18} color={colors.TEXTO_SECUNDARIO} />
        <Text style={styles.title}>Agregar ubicación (opcional)</Text>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : value ? (
        <TouchableOpacity onPress={() => onChange(null)} style={styles.badge}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.TEXTO_SECUNDARIO} />
          <Text style={styles.badgeText} numberOfLines={1}>
            {value.label ? `Cerca de ${value.label}` : `${value.latitude.toFixed(3)}, ${value.longitude.toFixed(3)}`}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handlePick} style={styles.btn}>
          <Text style={styles.btnText}>Usar mi ubicación</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  title: { fontSize: 14, color: colors.TEXTO_PRINCIPAL, opacity: 0.9 },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#888',
  },
  btnText: { fontSize: 13, color: colors.TEXTO_PRINCIPAL },
  badge: {
    maxWidth: '60%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#888',
  },
  badgeText: { fontSize: 12, color: colors.TEXTO_SECUNDARIO, opacity: 0.9, maxWidth: '85%' },
});
