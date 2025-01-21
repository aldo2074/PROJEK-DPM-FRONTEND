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
} from 'react-native';
import { API_URL } from '../../backend/config/config';
import Toast from 'react-native-toast-message';
import LaundryLogo from '../../assets/icons/laundry-logo.png';
import BackgroundImage from '../../assets/background.jpg';
import axios from 'axios';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!username.trim()) {
      newErrors.username = 'Username harus diisi.';
    } else if (username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email tidak boleh kosong.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid.';
    }

    if (!password) {
      newErrors.password = 'Kata sandi harus diisi.';
    } else if (password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
      });
      showToast('success', 'Registrasi Berhasil', 'Akun Anda berhasil dibuat!');
      navigation.navigate('RegistrationSuccessScreen');
    } catch (error) {
      if (error.response) {
        showToast('error', 'Registrasi Gagal', error.response.data.error || 'Terjadi kesalahan.');
      } else {
        showToast('error', 'Kesalahan Koneksi', 'Gagal terhubung ke server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={BackgroundImage} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Image source={LaundryLogo} style={styles.logo} resizeMode="contain" />

            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.inputField, errors.username && styles.errorInput]}
                placeholder="Username"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setErrors((prev) => ({ ...prev, username: null }));
                }}
                editable={!isLoading}
              />
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.inputField, errors.email && styles.errorInput]}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors((prev) => ({ ...prev, email: null }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.inputField, errors.password && styles.errorInput]}
                placeholder="Kata Sandi"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((prev) => ({ ...prev, password: null }));
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                style={styles.showPasswordButton}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </Text>
              </TouchableOpacity>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Daftar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
              <Text style={styles.linkText}>
                Sudah punya akun? <Text style={styles.linkBoldText}>Masuk</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    shadowColor: '#0391C4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: windowWidth * 0.4,
    height: windowHeight * 0.12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
    fontFamily: 'MavenPro-Medium',
  },
  inputField: {
    width: '100%',
    height: 50,
    borderColor: '#0391C4',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'MavenPro-Regular',
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
    top: 13,
  },
  showPasswordText: {
    color: '#0391C4',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'MavenPro-SemiBold',
  },
  errorInput: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'MavenPro-Regular',
  },
  registerButton: {
    backgroundColor: '#0391C4',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'MavenPro-Bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'MavenPro-Regular',
  },
  loginTextBold: {
    color: '#0391C4',
    fontFamily: 'MavenPro-Bold',
  },
});

// Prevent going back
RegisterScreen.navigationOptions = {
  headerShown: false,
  gestureEnabled: false,
};

export default RegisterScreen;
