import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { PROFILE_URL } from '../../../api';
import Toast from 'react-native-toast-message';

const EditProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${PROFILE_URL}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal mengambil data profil',
      });
    }
  };

  const handleUpdate = async () => {
    if (!userData.name || !userData.email || !userData.phone) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Semua field harus diisi',
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(`${PROFILE_URL}/update`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Toast.show({
        type: 'success',
        text1: 'Sukses',
        text2: 'Profil berhasil diperbarui',
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal memperbarui profil',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            value={userData.name}
            onChangeText={(text) => setUserData({ ...userData, name: text })}
            placeholder="Masukkan nama lengkap"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={userData.email}
            onChangeText={(text) => setUserData({ ...userData, email: text })}
            placeholder="Masukkan email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nomor Telepon</Text>
          <TextInput
            style={styles.input}
            value={userData.phone}
            onChangeText={(text) => setUserData({ ...userData, phone: text })}
            placeholder="Masukkan nomor telepon"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.updateButtonText}>Simpan Perubahan</Text>
          )}
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: '#0391C4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  updateButton: {
    backgroundColor: '#0391C4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen; 