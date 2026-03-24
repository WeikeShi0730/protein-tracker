import { useState, useEffect, useRef } from 'react';
import { Platform, View, Modal, StyleSheet, Animated } from 'react-native';

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

  if (Platform.OS !== 'web') {
    return (
      <Modal
        visible={visible}
        animationType={animationType}
        presentationStyle={transparent ? undefined : 'pageSheet'}
        transparent={transparent}
        onRequestClose={onRequestClose}
      >
        {children}
      </Modal>
    );
  }

  if (!mounted) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        animationType === 'slide' && { transform: [{ translateY: slideY }] },
      ]}
    >
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
});
