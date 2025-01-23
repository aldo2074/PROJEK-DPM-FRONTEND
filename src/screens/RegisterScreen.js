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
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';

import Toast from 'react-native-toast-message';
import LaundryLogo from '../../assets/icons/laundry-logo.png';
import BackgroundImage from '../../assets/background.jpg';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_URL } from '../../api';
import Icon from 'react-native-vector-icons/MaterialIcons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 4000,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validasi username
    if (!username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    }

    // Validasi email
    if (!email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validasi password
    if (!password) {
      newErrors.password = 'Password harus diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    // Validasi konfirmasi password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Mohon isi semua field dengan benar',
        position: 'bottom'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Log request data untuk debugging
      console.log('Sending registration request with:', {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password
      });

      const response = await axios.post(`${AUTH_URL}/register`, {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        confirmPassword: confirmPassword
      });

      console.log('Registration response:', response.data); // Log response

      if (response.data.token) {
        // Simpan token
        await AsyncStorage.setItem('authToken', response.data.token);
        
        // Set default header untuk axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Verifikasi token tersimpan
        const savedToken = await AsyncStorage.getItem('authToken');
        console.log('Saved token:', savedToken);

        Toast.show({
          type: 'success',
          text1: 'Berhasil',
          text2: 'Registrasi berhasil',
          position: 'bottom'
        });

        // Tunggu sebentar sebelum navigasi
        setTimeout(() => {
          navigation.replace('RegistrationSuccessScreen');
        }, 1000);
      } else {
        throw new Error('Token tidak ditemukan dalam response');
      }
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      
      let errorMessage = 'Gagal melakukan registrasi';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Tidak dapat terhubung ke server';
      }

      Toast.show({
        type: 'error',
        text1: 'Registrasi Gagal',
        text2: errorMessage,
        position: 'bottom'
      });
    } finally {
      setIsLoading(false);
    }
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
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.formContainer}>
              <Image 
                source={LaundryLogo} 
                style={styles.laundryLogo} 
                resizeMode="contain" 
              />

              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.username && styles.errorInput]}>
                  <Icon name="person" size={20} color="#0391C4" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Username"
                    placeholderTextColor="#888"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setErrors((prev) => ({ ...prev, username: null }));
                    }}
                    editable={!isLoading}
                  />
                </View>
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

                <View style={[styles.inputWrapper, errors.email && styles.errorInput]}>
                  <Icon name="email" size={20} color="#0391C4" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Email"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                <View style={[styles.passwordContainer, errors.password && styles.errorInput]}>
                  <Icon name="lock" size={20} color="#0391C4" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, styles.passwordInput]}
                    placeholder="Kata Sandi"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors((prev) => ({ ...prev, password: null }));
                    }}
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
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                <View style={[styles.passwordContainer, errors.confirmPassword && styles.errorInput]}>
                  <Icon name="lock" size={20} color="#0391C4" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, styles.passwordInput]}
                    placeholder="Konfirmasi Kata Sandi"
                    placeholderTextColor="#888"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setErrors((prev) => ({ ...prev, confirmPassword: null }));
                    }}
                    secureTextEntry={true}
                    editable={!isLoading}
                  />
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.registerContent}>
                    <Icon name="person-add" size={20} color="#fff" />
                    <Text style={styles.registerButtonText}>Daftar</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
                disabled={isLoading}
              >
                <Text style={styles.linkText}>
                  Sudah punya akun? <Text style={styles.linkBoldText}>Masuk</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  linkBoldText: {
    color: '#0391C4',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 145, 196, 0.2)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight + 20,
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
    marginBottom: 15,
  },
  passwordInput: {
    paddingRight: 50,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 15,
    padding: 10,
  },
  registerButton: {
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
  registerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#B3D5E6',
  },
  errorInput: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  backgroundImage: {
    // Add any necessary styles for the background image
  },
});

// Prevent going back
RegisterScreen.navigationOptions = {
  headerShown: false,
  gestureEnabled: false,
};

export default RegisterScreen;
