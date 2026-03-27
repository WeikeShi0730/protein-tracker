import { useState, useEffect, useRef } from 'react';
import { Platform, View, Modal, StyleSheet, Animated, PanResponder } from 'react-native';
import { C } from '@/constants/ClaudeTheme';

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
  const [mounted, setMounted] = useState(visible);
  const slideY = useRef(new Animated.Value(visible ? 0 : 800)).current;
  const onCloseRef = useRef(onRequestClose);
  onCloseRef.current = onRequestClose;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      slideY.setValue(800);
      Animated.timing(slideY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideY, {
        toValue: 800,
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
            toValue: 800,
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

  return (
    <Animated.View
      style={[
        styles.overlay,
        { position: 'fixed' as any },
        animationType === 'slide' && { transform: [{ translateY: slideY }] },
      ]}
    >
      {showDragIndicator && (
        <View {...panResponder.panHandlers} style={styles.dragZone}>
          <View style={styles.dragIndicator} />
        </View>
      )}
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
