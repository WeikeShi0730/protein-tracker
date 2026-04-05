import { useState, useEffect, useRef } from 'react';
import { Platform, View, Modal, StyleSheet, Animated, PanResponder, useWindowDimensions } from 'react-native';
import { C } from '@/constants/ClaudeTheme';

const TAB_BAR_HEIGHT = 72;

function useVisualViewport() {
  // Track the maximum height ever seen — this is the "full viewport" height before the
  // keyboard opens. On iOS Safari, window.innerHeight shrinks when the keyboard appears
  // (unlike Android Chrome), so we can't use it as a stable reference.
  const maxHeightRef = useRef(0);

  const getState = () => {
    if (typeof window === 'undefined') return { top: 0, left: 0, width: 0, height: 0 };
    const vv = (window as any).visualViewport;
    const s = vv
      ? { top: vv.offsetTop, left: vv.offsetLeft, width: vv.width, height: vv.height }
      : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    if (s.height > maxHeightRef.current) maxHeightRef.current = s.height;
    return s;
  };

  const [vp, setVp] = useState(getState);

  // Keep maxHeight updated on every render (covers initial mount before keyboard)
  if (vp.height > maxHeightRef.current) maxHeightRef.current = vp.height;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const vv = (window as any).visualViewport;
    if (!vv) {
      const update = () => {
        const h = window.innerHeight;
        if (h > maxHeightRef.current) maxHeightRef.current = h;
        setVp({ top: 0, left: 0, width: window.innerWidth, height: h });
      };
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const update = () => {
      const s = { top: vv.offsetTop, left: vv.offsetLeft, width: vv.width, height: vv.height };
      if (s.height > maxHeightRef.current) maxHeightRef.current = s.height;
      setVp(s);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return { ...vp, fullHeight: maxHeightRef.current || vp.height };
}

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
  children: React.ReactNode;
}

export default function PlatformModal({
  visible,
  onRequestClose,
  animationType = 'slide',
  transparent = false,
  children,
}: Props) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const vp = useVisualViewport();
  const [mounted, setMounted] = useState(visible);
  const slideY = useRef(new Animated.Value(visible ? 0 : 1000)).current;
  const onCloseRef = useRef(onRequestClose);
  onCloseRef.current = onRequestClose;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      slideY.setValue(1000);
      Animated.timing(slideY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideY, {
        toValue: 1000,
        duration: 280,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) slideY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80 || gs.vy > 0.3) {
          Animated.timing(slideY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: false,
          }).start(() => onCloseRef.current());
        } else {
          Animated.spring(slideY, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const showDragIndicator = animationType === 'slide' && !transparent;

  if (Platform.OS !== 'web') {
    return (
      <Modal
        visible={visible}
        animationType={animationType}
        presentationStyle={transparent ? undefined : 'pageSheet'}
        transparent={transparent}
        onRequestClose={onRequestClose}
      >
        {showDragIndicator && (
          <View style={styles.dragZone}>
            <View style={styles.dragIndicator} />
          </View>
        )}
        {children}
      </Modal>
    );
  }

  if (!mounted) return null;

  // Web: slide modals render as a bottom sheet with a dimmed backdrop
  if (animationType === 'slide' && !transparent) {
    // Use visual viewport dimensions so the backdrop exactly covers the visible area above
    // the keyboard — this eliminates the gap between modal and keyboard on iOS Safari.
    const vpWidth = vp.width || windowWidth;
    const vpHeight = vp.height || windowHeight;
    // Keyboard detection: compare current height against the max height ever seen.
    // On iOS Safari, both window.innerHeight and visualViewport.height shrink together
    // when the keyboard opens, so we can't compare them against each other.
    // Instead, we compare against the largest height we've ever observed (= no keyboard).
    const kbVisible = vp.fullHeight - vpHeight > 100;
    // Only reserve space for the tab bar when the keyboard is not covering it.
    const bottomPad = kbVisible ? 0 : TAB_BAR_HEIGHT;
    const availableHeight = vpHeight - bottomPad;
    // Use 85% of available height, but always leave at least 100px at the top
    // so the modal header (title + cancel button) isn't hidden behind the app banner.
    const sheetHeight = Math.max(200, Math.min(availableHeight * 0.85, availableHeight - 100));
    // Match the app container width from +html.tsx: full-width under 600px, 33.333% above
    const sheetWidth = windowWidth >= 600
      ? Math.max(360, Math.min(480, Math.round(windowWidth / 3)))
      : vpWidth;
    return (
      <View
        style={[
          styles.webBackdrop,
          {
            position: 'fixed' as any,
            // Anchor to the visual viewport, not the layout viewport.
            // This prevents the iOS Safari nav bar gap between modal and keyboard.
            top: vp.top,
            left: vp.left,
            width: vpWidth,
            height: vpHeight,
            paddingBottom: bottomPad,
          },
        ]}
      >
        <Animated.View
          style={[styles.webSheet, { width: sheetWidth, height: sheetHeight, transform: [{ translateY: slideY }] }]}
        >
          <View {...panResponder.panHandlers} style={styles.dragZone}>
            <View style={styles.dragIndicator} />
          </View>
          {children}
        </Animated.View>
      </View>
    );
  }

  // Web: transparent/fade modals use a fixed full-screen overlay
  return (
    <Animated.View style={[styles.overlay, { position: 'fixed' as any }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  webBackdrop: {
    // Positioning (top/left/width/height) is set inline using visual viewport values
    // to handle iOS Safari keyboard correctly. Do NOT add bottom/right here —
    // they conflict with height and cause the gap above the keyboard.
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  webSheet: {
    backgroundColor: C.bgElevated,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  dragZone: {
    backgroundColor: C.bgElevated,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
  },
});
