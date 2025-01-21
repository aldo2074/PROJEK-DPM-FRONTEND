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
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LaundryLogo from '../../assets/icons/laundry-logo.png';
import BackgroundImage from '../../assets/background.jpg';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const LupaSandiScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleResetPassword = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email tidak boleh kosong');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    Alert.alert(
      'Berhasil',
      'Link reset password telah dikirim ke email Anda',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login')
        }
      ]
    );
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

            <Text style={styles.titleText}>Lupa Kata Sandi</Text>
            <Text style={styles.subtitleText}>
              Masukkan email Anda untuk reset kata sandi
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleResetPassword}
            >
              <Text style={styles.resetButtonText}>Reset Kata Sandi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>
                Kembali ke Login
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
    width: windowWidth * 0.4,
    height: windowHeight * 0.12,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
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
  resetButton: {
    backgroundColor: '#0391C4',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 15,
    color: '#666',
  },
});

export default LupaSandiScreen;
