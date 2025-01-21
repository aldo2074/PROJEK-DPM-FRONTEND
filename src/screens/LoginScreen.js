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
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../backend/config/config';
import LaundryLogo from '../../assets/icons/laundry-logo.png';
import BackgroundImage from '../../assets/background.jpg';
import axios from 'axios';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
      position: 'top',
      visibilityTime: 4000,
    });
  };

  const validateInputs = () => {
    if (!email || !password) {
      showToast('error', 'Input Tidak Lengkap', 'Email dan kata sandi harus diisi.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast('error', 'Email Tidak Valid', 'Masukkan alamat email yang valid.');
      return false;
    }
    return true;
  };
  // LoginScreen.js
const handleSignIn = async () => {
  if (!validateInputs()) return;

  setIsLoading(true);
  try {
    // Cek login admin
    if (email.trim() === 'admin@admin.com' && password === 'admin') {
      await AsyncStorage.setItem('userRole', 'admin');
      showToast('success', 'Login Berhasil', 'Selamat datang Admin!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Admin' }],
      });
      return;
    }

    // Login untuk user biasa
    const response = await axios.post(`${API_URL}/login`, {
      email: email.trim(),
      password: password,
    });

    const data = response.data;
    await AsyncStorage.setItem('authToken', data.token);
    await AsyncStorage.setItem('userRole', 'user');
    showToast('success', 'Login Berhasil', 'Selamat datang!');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });

  } catch (error) {
    console.error('Error during login:', error);
    showToast('error', 'Login Gagal', 'Email atau password salah');
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
    <>
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
              <View style={styles.passwordContainer}>
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
                  <Text style={styles.showPasswordText}>
                    {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  </Text>
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
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signInText}>Masuk</Text>
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  inputField: {
    width: '100%',
    height: 55,
    borderColor: '#0391C4',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 100,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  showPasswordText: {
    color: '#0391C4',
    fontWeight: 'bold',
    fontSize: 14,
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
  disabledButton: {
    backgroundColor: '#B3D5E6',
  },
  signInText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
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
