// src/utils/location.js
import * as Location from 'expo-location';

async function askPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

function buildLabel(place = {}) {
  const { city, district, subregion, region, countryCode, country, name } = place || {};
  const main = city || district || subregion || region || name;
  const countryPart = countryCode || country;
  return [main, countryPart].filter(Boolean).join(', ');
}

export async function pickUserLocationOnce() {
  const ok = await askPermission();
  if (!ok) return null;

  const last = await Location.getLastKnownPositionAsync();
  const pos = last || await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  if (!pos?.coords) return null;
  const { latitude, longitude } = pos.coords;

  let label = '';
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (places && places.length) {
      label = buildLabel(places[0]);
    }
  } catch {
  }
  return { latitude, longitude, label };
}
