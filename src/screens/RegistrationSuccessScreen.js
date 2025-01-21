import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  SafeAreaView,
  Platform,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const windowWidth = Dimensions.get('window').width;

const RegistrationSuccessScreen = ({ navigation }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleValue }],
            }
          ]}
        >
          <View style={styles.checkmarkCircle}>
            <Icon name="check" size={60} color="#ffffff" />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: fadeValue,
              transform: [
                {
                  translateY: fadeValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.successTitle}>Akun Berhasil Dibuat!</Text>
          <Text style={styles.successMessage}>
            Selamat! Akun Anda telah berhasil dibuat. Silakan login untuk mulai menggunakan layanan kami.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeValue,
              transform: [
                {
                  translateY: fadeValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Login Sekarang</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0391C4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0391C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: '#0391C4',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#0391C4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#E6F2FF',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#0391C4',
    fontSize: 16,
    fontWeight: '600',
  },
});

RegistrationSuccessScreen.navigationOptions = {
  headerShown: false,
  gestureEnabled: false,
};

export default RegistrationSuccessScreen;