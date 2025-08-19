// src/navigation/navigationRef.js
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function hasRoute(name) {
  try {
    const s = navigationRef.getRootState?.() ?? navigationRef.getState?.();
    return Array.isArray(s?.routeNames) && s.routeNames.includes(name);
  } catch {
    return false;
  }
}

export function resetTo(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name, params }] });
  }
}
