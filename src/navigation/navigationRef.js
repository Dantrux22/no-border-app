import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/** Navegar simple (nivel raíz) */
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

/** Reset simple a una ruta raíz */
export function resetTo(name, params) {
  if (!navigationRef.isReady()) return;
  navigationRef.reset({
    index: 0,
    routes: [{ name, params }],
  });
}

/** Reset anidado: Stack ('rootName') → abrir screen del Drawer/Tabs ('nestedScreen') */
export function resetToNested(rootName, nestedScreen, params) {
  if (!navigationRef.isReady()) return;
  navigationRef.reset({
    index: 0,
    routes: [{ name: rootName, params: { screen: nestedScreen, params } }],
  });
}

/** ¿Está lista la raíz? */
export function isReady() {
  return navigationRef.isReady();
}
