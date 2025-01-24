import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const scaleValue = new Animated.Value(0);
  const fadeValue = new Animated.Value(0);

  useEffect(() => {
    // Animasi scale untuk logo
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Animasi fade untuk teks
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Navigasi ke Landing setelah 2.5 detik
    const timer = setTimeout(() => {
      navigation.replace('Landing'); // Pastikan 'Landing' sesuai dengan nama screen di navigator
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0391C4" barStyle="light-content" />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <Icon name="local-laundry-service" size={100} color="#FFFFFF" />
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeValue,
          },
        ]}
      >
        <Text style={styles.title}>Laundrify</Text>
        <Text style={styles.subtitle}>Solusi Laundry Professional</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={[styles.wave, styles.wave1]} />
        <View style={[styles.wave, styles.wave2]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0391C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 75,
    padding: 25,
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#E6F2FF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.2,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
  },
  wave1: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ translateY: 50 }],
  },
  wave2: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ translateY: 80 }],
  },
});

export default SplashScreen;