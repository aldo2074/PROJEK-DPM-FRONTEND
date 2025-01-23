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
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PROFILE_URL } from '../../../api';

// MenuItem Component dengan desain yang lebih baik
const MenuItem = ({ icon, text, onPress }) => (
  <TouchableOpacity 
    style={styles.menuItem} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuContent}>
      <View style={styles.menuIconContainer}>
        <Icon name={icon} size={24} color="#0391C4" />
      </View>
      <Text style={styles.menuText}>{text}</Text>
    </View>
    <Icon name="chevron-right" size={24} color="#CCCCCC" />
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    profileImage: null,
  });
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
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
        handleError(error);
      }
    };
    
    checkToken();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
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
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      handleError(error);
    }
  };

  const handleError = async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
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
      const token = await AsyncStorage.getItem('userToken');
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
        await AsyncStorage.removeItem('userToken');
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      delete axios.defaults.headers.common['Authorization'];
      navigation.replace('Login');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Gagal keluar dari aplikasi');
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
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with Profile Info */}
      <View style={styles.headerBackground}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil Saya</Text>
          <View style={styles.profileInfo}>
            <Image 
              source={
                profileData.profileImage
                  ? { uri: `${PROFILE_URL}/${profileData.profileImage}` }
                  : require('../../../assets/icons/default-profile.png')
              }
              style={styles.profileImage}
            />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName}>{profileData.username || 'Pengguna'}</Text>
              <Text style={styles.profileEmail}>{profileData.email || 'Email tidak tersedia'}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Pengaturan Akun</Text>
          
          <MenuItem
            icon="person-outline"
            text="Edit Profil"
            onPress={() => setEditModalVisible(true)}
          />
          <MenuItem
            icon="lock-outline"
            text="Ubah Kata Sandi"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <MenuItem
            icon="history"
            text="Riwayat Pesanan"
            onPress={() => navigation.navigate('Riwayat')}
          />
          <MenuItem
            icon="info-outline"
            text="Tentang Aplikasi"
            onPress={() => navigation.navigate('About')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="logout" size={24} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Keluar dari Aplikasi</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'home', screen: 'Home', active: false },
          { icon: 'receipt', screen: 'Order', active: false },
          { icon: 'chat', screen: 'Chat', active: false },
          { icon: 'person', screen: 'Profile', active: true }
        ].map((nav, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.navItem, nav.active ? styles.activeNavItem : null]}
            onPress={() => navigation.navigate(nav.screen)}
            activeOpacity={0.7}
          >
            <Icon
              name={nav.icon}
              size={24}
              style={[styles.navIcon, nav.active ? styles.activeNavIcon : null]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {renderEditProfileModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerBackground: {
    backgroundColor: '#0391C4',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0391C4',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 100,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
    minWidth: 60,
  },
  activeNavItem: {
    backgroundColor: '#E6F2FF',
  },
  navIcon: {
    color: '#999999',
  },
  activeNavIcon: {
    color: '#0391C4',
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
});

export default ProfileScreen;
