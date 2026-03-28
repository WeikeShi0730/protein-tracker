import { useState, useEffect, useRef } from 'react';
import { Platform, View, Modal, StyleSheet, Animated, PanResponder, useWindowDimensions } from 'react-native';
import { C } from '@/constants/ClaudeTheme';

const TAB_BAR_HEIGHT = 72;

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
    const sheetHeight = (windowHeight - TAB_BAR_HEIGHT) * 0.9;
    // Match the app container width from +html.tsx: full-width under 600px, 33.333% above
    const sheetWidth = windowWidth >= 600
      ? Math.max(360, Math.min(480, Math.round(windowWidth / 3)))
      : windowWidth;
    return (
      <View style={[styles.webBackdrop, { position: 'fixed' as any, paddingBottom: TAB_BAR_HEIGHT }]}>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
