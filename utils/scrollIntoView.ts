import { Platform } from 'react-native';

/**
 * Scrolls the currently focused input into view on iOS Safari web.
 * KeyboardAvoidingView does nothing on web, so when the keyboard appears the
 * nearest scrollable ancestor must be nudged manually via scrollIntoView.
 * Call this from a TextInput's onFocus handler.
 */
export function scrollActiveInputIntoView() {
  if (Platform.OS !== 'web') return;
  // Delay lets the keyboard animation finish and visualViewport resize propagate
  // before we ask the browser to reposition the element.
  setTimeout(() => {
    try {
      (document.activeElement as HTMLElement)?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    } catch {}
  }, 350);
}
