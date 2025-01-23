import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Switch,
  Modal,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PROFILE_URL } from '../../../api';

// MenuItem Komponen
const MenuItem = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Icon name={icon} size={24} color="#0391C4" />
    </View>
    <Text style={styles.menuText}>{text}</Text>
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    profileImage: null,
    oldPassword: '',
    newPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        console.log('Current token in ProfileScreen:', token);
        
        if (!token) {
          console.log('No token found, redirecting to Login');
          navigation.replace('Login');
          return;
        }
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch profile setelah memastikan token ada
        await fetchProfile();
      } catch (error) {
        console.error('Error in checkToken:', error);
      }
    };
    
    checkToken();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Token:', token);

      if (!token) {
        console.log('No token found');
        navigation.replace('Login');
        return;
      }

      const response = await axios.get(PROFILE_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Profile Response:', response.data);

      if (response.data.success) {
        setProfile(response.data.user);
        setProfileData({
          username: response.data.user.username || '',
          email: response.data.user.email || '',
          profileImage: response.data.user.profileImage || null,
          oldPassword: '',
          newPassword: '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      handleError(error);
    }
  };

  const handleError = async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      Alert.alert(
        'Sesi Berakhir',
        'Silakan login kembali',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    } else {
      Alert.alert('Error', 'Gagal memuat profil');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const formData = new FormData();
      
      // Only append if values exist and have changed
      if (profileData.username) {
        formData.append('username', profileData.username);
      }
      if (profileData.email) {
        formData.append('email', profileData.email);
      }
      if (profileData.newPassword) {
        formData.append('newPassword', profileData.newPassword);
      }
      
      // Handle image upload
      if (profileData.profileImage?.uri) {
        const imageFile = {
          uri: profileData.profileImage.uri,
          type: 'image/jpeg',
          name: 'profile-image.jpg'
        };
        formData.append('profileImage', imageFile);
      }

      const response = await axios.put(PROFILE_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000
      });

      if (response.data.success) {
        Alert.alert('Sukses', 'Profil berhasil diperbarui');
        // Update local state with new data
        setProfileData(prev => ({
          ...prev,
          ...response.data.user,
          newPassword: '', // Clear password field
        }));
        setEditModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating profile:', {
        message: error.message,
        response: error.response?.data
      });

      let errorMessage = 'Gagal memperbarui profil';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Koneksi timeout. Silakan coba lagi.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesi telah berakhir. Silakan login kembali.';
        await AsyncStorage.removeItem('authToken');
        navigation.replace('Login');
      }

      Alert.alert('Error', errorMessage);
    }
  };

  const handleSelectImage = async () => {
    // Meminta izin akses galeri
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (!permissionResult.granted) {
      Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin untuk mengakses galeri Anda.');
      return;
    }
  
    // Membuka galeri untuk memilih gambar
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
  
    if (!pickerResult.canceled) {
      console.log('Gambar yang dipilih:', pickerResult.assets[0]);
      setProfileData((prev) => ({
        ...prev,
        profileImage: pickerResult.assets[0],
      }));
    }
  };

  const handleVerifyAccount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(`${PROFILE_URL}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setIsVerified(true);
        Alert.alert('Sukses', 'Email verifikasi telah dikirim ke email Anda');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mengirim email verifikasi');
    }
  };

  const renderEditProfileModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profil</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.formContainer}>
              <View style={styles.profileImageEdit}>
                <Image 
                  source={
                    profileData.profileImage
                      ? { uri: `${PROFILE_URL}/${profileData.profileImage}` }
                      : require('../../../assets/icons/default-profile.png')
                  }
                  style={styles.editProfileImage}
                />
                <TouchableOpacity 
                  style={styles.changePhotoButton}
                  onPress={handleSelectImage}
                >
                  <Icon name="camera-alt" size={20} color="#0391C4" />
                  <Text style={styles.changePhotoText}>Ubah Foto</Text>
                </TouchableOpacity>
              </View>
              {['username', 'email'].map((field) => (
                <View key={field} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {field === 'username' ? 'Username' : 'Email'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={profileData[field]}
                    onChangeText={(text) =>
                      setProfileData((prev) => ({
                        ...prev,
                        [field]: text,
                      }))
                    }
                  />
                </View>
              ))}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password Baru</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    secureTextEntry={!showNewPassword}
                    value={profileData.newPassword}
                    onChangeText={(text) =>
                      setProfileData((prev) => ({
                        ...prev,
                        newPassword: text,
                      }))
                    }
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Icon
                      name={
                        showNewPassword ? 'visibility' : 'visibility-off'
                      }
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <Image 
            source={
              profileData.profileImage
                ? { uri: `${PROFILE_URL}/${profileData.profileImage}` }
                : require('../../../assets/icons/default-profile.png')
            }
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{profileData.username || 'Pengguna'}</Text>
          <Text style={styles.profileEmail}>{profileData.email || 'Email tidak tersedia'}</Text>
          {!isVerified && (
            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={handleVerifyAccount}
            >
              <Icon name="verified-user" size={20} color="#0391C4" />
              <Text style={styles.verifyText}>Verifikasi Akun</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Pengaturan</Text>
          
          {/* Notifikasi Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="notifications" size={24} color="#0391C4" />
              <Text style={styles.settingText}>Notifikasi</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#0391C4' }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          {/* Menu Items */}
          <MenuItem
            icon="person"
            text="Edit Profil"
            onPress={() => setEditModalVisible(true)}
          />
          <MenuItem
            icon="history"
            text="Riwayat"
            onPress={() => navigation.navigate('Riwayat')}
          />
          <MenuItem
            icon="security"
            text="Keamanan"
            onPress={() => navigation.navigate('Security')}
          />
          <MenuItem
            icon="help"
            text="Bantuan"
            onPress={() => navigation.navigate('Help')}
          />
          <MenuItem
            icon="info"
            text="Tentang Aplikasi"
            onPress={() => navigation.navigate('About')}
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Icon name="logout" size={24} color="#FFF" />
          <Text style={styles.logoutButtonText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderEditProfileModal()}
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
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#0391C4',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#E6F2FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#0391C4',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
  },
  saveButton: {
    backgroundColor: '#0391C4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileImageEdit: {
    alignItems: 'center',
    marginBottom: 20,
  },
  editProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#0391C4',
    marginBottom: 10,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F2FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#0391C4',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    padding: 10,
  },
  activeNavItem: {
    backgroundColor: '#E6F2FF',
    borderRadius: 20,
  },
  navIcon: {
    color: '#999',
  },
  activeNavIcon: {
    color: '#0391C4',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  settingsSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F2FF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  verifyText: {
    color: '#0391C4',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProfileScreen;
