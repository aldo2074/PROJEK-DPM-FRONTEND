import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, PROFILE_URL } from '../../../api';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        setError('Token tidak ditemukan');
        return;
      }

      // Debug logs
      console.log('Token yang digunakan:', token);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('URL:', PROFILE_URL);
      console.log('Headers:', headers);

      const response = await axios.get(PROFILE_URL, { headers });
      console.log('Response:', response.data);

      if (response.data.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers // Log headers yang dikirim
      });
      setError(error.response?.data?.message || 'Terjadi kesalahan saat mengambil profil');
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil Saya</Text>
      <Text>Username: {profile.username}</Text>
      <Text>Email: {profile.email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default ProfileScreen; 