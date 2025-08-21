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

function withTimeout(promise, ms = 6000) {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error('loc-timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

export async function pickUserLocationOnce() {
  const ok = await askPermission();
  if (!ok) return null;

  const servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn) return null;

  const last = await Location.getLastKnownPositionAsync();

  let pos = last;
  if (!pos) {
    try {
      pos = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        6500
      );
    } catch {
      try {
        pos = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
          5000
        );
      } catch {
        pos = null;
      }
    }
  }

  if (!pos?.coords) return null;
  const { latitude, longitude } = pos.coords;

  let label = '';
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (places && places.length) label = buildLabel(places[0]) || '';
  } catch {
  }

  return { latitude, longitude, label };
}
