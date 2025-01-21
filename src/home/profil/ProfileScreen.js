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
import { API_URL } from '../../../backend/config/config';

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
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [language, setLanguage] = useState('id'); // Tambahkan inisialisasi `language`
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    profileImage: null,
    oldPassword: '',
    newPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        setProfileData((prev) => ({
          ...prev,
          username: data.username,
          email: data.email,
          profileImage: data.profileImage || null,
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Gagal memuat profil');
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('username', profileData.username);
      formData.append('email', profileData.email);
      if (profileData.newPassword) {
        formData.append('newPassword', profileData.newPassword);
      }
      if (profileData.profileImage && profileData.profileImage.uri) {
        formData.append('profileImage', {
          uri: profileData.profileImage.uri,
          name: 'profile.jpg',
          type: profileData.profileImage.type,
        });
      }

      await axios.put(`${API_URL}/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Sukses', 'Profil berhasil diperbarui');
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Gagal memperbarui profil');
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
                      ? { uri: profileData.profileImage.uri }
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
                ? { uri: profileData.profileImage }
                : require('../../../assets/icons/default-profile.png')
            }
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{profileData.username}</Text>
          <Text style={styles.profileEmail}>{profileData.email}</Text>
        </View>

        <View style={styles.quickActions}>
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
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Pengaturan</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="dark-mode" size={24} color="#0391C4" />
              <Text style={styles.settingText}>Mode Gelap</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: "#767577", true: "#0391C4" }}
              thumbColor={darkModeEnabled ? "#fff" : "#f4f3f4"}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="language" size={24} color="#0391C4" />
              <Text style={styles.settingText}>Bahasa</Text>
            </View>
            <View style={styles.languageSelector}>
              {["id", "en"].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageOption,
                    language === lang && styles.selectedLanguage,
                  ]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.languageText,
                      language === lang && styles.selectedLanguageText,
                    ]}
                  >
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { marginBottom: 20 }]}
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
  settingsSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  languageSelector: {
    flexDirection: 'row',
    backgroundColor: '#F7F9FC',
    borderRadius: 20,
    padding: 4,
  },
  languageOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  selectedLanguage: {
    backgroundColor: '#0391C4',
  },
  languageText: {
    fontSize: 14,
    color: '#666',
  },
  selectedLanguageText: {
    color: '#FFF',
    fontWeight: '600',
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
});

export default ProfileScreen;
