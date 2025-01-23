import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PROFILE_URL } from '../../../api';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    try {
      // Validasi input
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert('Error', 'Semua field harus diisi');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Password baru dan konfirmasi password tidak cocok');
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert('Error', 'Password baru minimal 6 karakter');
        return;
      }

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const response = await axios.put(
        `${PROFILE_URL}/change-password`,
        {
          currentPassword,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        Alert.alert('Sukses', 'Password berhasil diubah', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      let errorMessage = 'Gagal mengubah password';

      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Password saat ini tidak sesuai';
      } else if (error.response?.status === 401) {
        await AsyncStorage.removeItem('userToken');
        navigation.replace('Login');
        return;
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ubah Kata Sandi</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          {/* Current Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password Saat Ini</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                placeholder="Masukkan password saat ini"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Icon 
                  name={showCurrentPassword ? "visibility" : "visibility-off"} 
                  size={24} 
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password Baru</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholder="Masukkan password baru"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon 
                  name={showNewPassword ? "visibility" : "visibility-off"} 
                  size={24} 
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Konfirmasi Password Baru</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="Konfirmasi password baru"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon 
                  name={showConfirmPassword ? "visibility" : "visibility-off"} 
                  size={24} 
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.changeButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.changeButtonText}>Ubah Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#0391C4',
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    padding: 12,
  },
  eyeIcon: {
    padding: 12,
  },
  changeButton: {
    backgroundColor: '#0391C4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;
