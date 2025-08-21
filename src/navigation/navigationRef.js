import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function resetTo(name, params) {
  if (!navigationRef.isReady()) return;
  navigationRef.reset({
    index: 0,
    routes: [{ name, params }],
  });
}

export function resetToNested(rootName, nestedScreen, params) {
  if (!navigationRef.isReady()) return;
  navigationRef.reset({
    index: 0,
    routes: [{ name: rootName, params: { screen: nestedScreen, params } }],
  });
}

export function isReady() {
  return navigationRef.isReady();
}
