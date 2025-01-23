// LoginScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ImageBackground, 
  Dimensions,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_URL } from '../../api';
import LaundryLogo from '../../assets/icons/laundry-logo.png';
import BackgroundImage from '../../assets/background.jpg';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Mohon isi semua field',
        position: 'bottom'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${AUTH_URL}/login`, {
        email,
        password,
      });

      console.log('Login response:', response.data); // Debug log

      if (response.data.success && response.data.token) {
        // Simpan token dengan key yang konsisten
        await AsyncStorage.setItem('userToken', response.data.token);
        
        // Set default header untuk semua request axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        Toast.show({
          type: 'success',
          text1: 'Berhasil',
          text2: 'Login berhasil',
          position: 'bottom'
        });

        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      let errorMessage = 'Gagal login. Silakan coba lagi.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Tidak dapat terhubung ke server';
      }

      Toast.show({
        type: 'error',
        text1: 'Login Gagal',
        text2: errorMessage,
        position: 'bottom'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('LupaSandi');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground 
        source={BackgroundImage} 
        style={styles.container}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.formContainer}>
            <Image 
              source={LaundryLogo} 
              style={styles.laundryLogo} 
              resizeMode="contain" 
            />

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Icon name="email" size={20} color="#0391C4" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.passwordContainer}>
                <Icon name="lock" size={20} color="#0391C4" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputField, styles.passwordInput]}
                  placeholder="Kata Sandi"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  style={styles.showPasswordButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Icon 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color="#0391C4" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.forgotPasswordLink}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Lupa Kata Sandi?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.signInContent}>
                  <Icon name="login" size={20} color="#fff" />
                  <Text style={styles.signInText}>Masuk</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerText}>
                Belum punya akun? <Text style={styles.registerLinkText}>Daftar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backgroundImage: {
    opacity: 0.7,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(3, 145, 196, 0.2)',
    width: '100%',
  },
  formContainer: {
    width: windowWidth * 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 420,
    shadowColor: '#0391C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  laundryLogo: {
    width: windowWidth * 0.5,
    height: windowHeight * 0.15,
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#0391C4',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  inputIcon: {
    padding: 15,
  },
  inputField: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: '#333',
    paddingRight: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#0391C4',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  passwordInput: {
    paddingRight: 50,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 15,
    padding: 10,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 25,
    marginTop: 5,
  },
  forgotPasswordText: {
    color: '#0391C4',
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#0391C4',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  signInContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#B3D5E6',
  },
  registerLink: {
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
  },
  registerLinkText: {
    color: '#0391C4',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
