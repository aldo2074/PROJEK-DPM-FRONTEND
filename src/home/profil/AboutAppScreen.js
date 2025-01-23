import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AboutAppScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/icons/laundry-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Laundrify</Text>
          <Text style={styles.version}>Versi 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitur Utama</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Image 
                source={require('../../../assets/icons/cuci-setrika.png')} 
                style={styles.featureIcon} 
              />
              <Text style={styles.featureText}>Cuci & Setrika</Text>
            </View>
            <View style={styles.featureItem}>
              <Image 
                source={require('../../../assets/icons/setrika.png')} 
                style={styles.featureIcon} 
              />
              <Text style={styles.featureText}>Setrika</Text>
            </View>
            <View style={styles.featureItem}>
              <Image 
                source={require('../../../assets/icons/alas-kasur.png')} 
                style={styles.featureIcon} 
              />
              <Text style={styles.featureText}>Alas Kasur</Text>
            </View>
            <View style={styles.featureItem}>
              <Image 
                source={require('../../../assets/icons/cuci-sepatu.png')} 
                style={styles.featureIcon} 
              />
              <Text style={styles.featureText}>Cuci Sepatu</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hubungi Kami</Text>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => Linking.openURL('mailto:support@laundrify.com')}
          >
            <Icon name="email" size={24} color="#0391C4" />
            <Text style={styles.contactText}>supportlaundrify@gmail.com</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => Linking.openURL('tel:+6281234567890')}
          >
            <Icon name="phone" size={24} color="#0391C4" />
            <Text style={styles.contactText}>+62 812-1234-1234</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          © 2024 Laundrify. All rights reserved.
        </Text>
      </ScrollView>
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
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 25,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureList: {
    marginTop: 5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F7F9FC',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F7F9FC',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  copyright: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
    fontSize: 14,
  },
  featureIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#0391C4'
  },
});

export default AboutAppScreen; 