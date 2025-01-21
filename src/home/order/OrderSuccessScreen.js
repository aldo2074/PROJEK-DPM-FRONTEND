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
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const OrderSuccessScreen = () => {
  const navigation = useNavigation();
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation for checkmark
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      // Animation for text and button
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleViewOrder = () => {
    navigation.replace('Order');  // Replace current screen with Order screen
  };

  const handleBackToHome = () => {
    navigation.navigate('Home');  // Navigate to Home screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon with Animation */}
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

        {/* Success Message */}
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
          <Text style={styles.successTitle}>Pesanan Berhasil!</Text>
          <Text style={styles.successMessage}>
            Terima kasih telah menggunakan layanan kami. Pesanan Anda sedang diproses.
          </Text>
        </Animated.View>

        {/* Action Buttons */}
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
            style={styles.viewOrderButton}
            onPress={handleViewOrder}
          >
            <Text style={styles.viewOrderButtonText}>Lihat Pesanan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleBackToHome}
          >
            <Text style={styles.homeButtonText}>Kembali ke Beranda</Text>
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
  viewOrderButton: {
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
  viewOrderButtonText: {
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

export default OrderSuccessScreen;