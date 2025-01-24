import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CART_URL, NOTIFICATION_URL } from '../../api';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCartCount();
      fetchNotificationCount();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.get(CART_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setCartItemCount(response.data.items?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.get(NOTIFICATION_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const unreadCount = response.data.notifications.filter(
          notification => !notification.read
        ).length;
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const services = [
    { 
      icon: require('../../assets/icons/cuci-setrika.png'), 
      text: 'Cuci & Setrika', 
      screen: 'CuciSetrika',
      description: 'Layanan cuci dan setrika pakaian'
    },
    { 
      icon: require('../../assets/icons/setrika.png'), 
      text: 'Setrika', 
      screen: 'Setrika',
      description: 'Layanan setrika premium'
    },
    { 
      icon: require('../../assets/icons/alas-kasur.png'), 
      text: 'Alas Kasur', 
      screen: 'AlasKasur',
      description: 'Layanan cuci alas kasur'
    },
    { 
      icon: require('../../assets/icons/cuci-sepatu.png'), 
      text: 'Cuci Sepatu', 
      screen: 'CuciSepatu',
      description: 'Layanan cuci sepatu'
    }
  ];

  const ServiceCard = ({ service }) => {
    return (
      <TouchableOpacity
        style={styles.serviceItem}
        onPress={() => navigation.navigate(service.screen)}
        activeOpacity={0.9}
      >
        <View style={styles.serviceIconContainer}>
          <Image source={service.icon} style={styles.serviceIcon} />
        </View>
        <Text style={styles.serviceText}>{service.text}</Text>
        <Text style={styles.serviceDescription}>{service.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.headerBackground}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Selamat Datang,</Text>
              <Text style={styles.subWelcomeText}>Layanan Laundry Profesional</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.cartButton}
                onPress={() => navigation.navigate('Cart')}
              >
                <Icon name="shopping-cart" size={28} color="#ffffff" />
                {cartItemCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItemCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notification')}
              >
                <Icon name="notifications" size={28} color="#ffffff" />
                {notificationCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{notificationCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Layanan Kami</Text>
          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tentang Kami</Text>
          <View style={styles.aboutUsCard}>
            <View style={styles.aboutUsContent}>
              <View style={styles.aboutUsTextContainer}>
                <Text style={styles.aboutUsDescription}>
                  Kami adalah tim profesional yang berkomitmen memberikan solusi laundry terbaik.
                  Dengan pelayanan berkualitas tinggi, kami menjamin kebersihan dan kerapihan pakaian Anda.
                </Text>
              </View>
              <View style={styles.aboutUsIconContainer}>
                <Image
                  source={require('../../assets/icons/person-talking.png')}
                  style={styles.aboutUsIcon}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        {[{ icon: 'home', screen: 'Home', active: true },
          { icon: 'receipt', screen: 'Order', active: false },
          { icon: 'chat', screen: 'Chat', active: false },
          { icon: 'person', screen: 'Profile', active: false }
        ].map((nav, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.navItem, nav.active ? styles.activeNavItem : null]}
            onPress={() => navigation.navigate(nav.screen)}
            activeOpacity={0.9}
          >
            <Icon
              name={nav.icon}
              size={25}
              style={[styles.navIcon, nav.active ? styles.activeNavIcon : null]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  headerBackground: {
    backgroundColor: '#0391C4',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#0391C4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 25,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 5,
  },
  subWelcomeText: {
    fontSize: 15,
    color: '#ffffff',
    opacity: 0.9,
  },
  cartButton: {
    padding: 10,
    marginRight: 5,
    position: 'relative',
  },
  notificationButton: {
    padding: 10,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  serviceIconContainer: {
    backgroundColor: '#E6F2FF',
    borderRadius: 50,
    padding: 15,
    marginBottom: 10,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  aboutUsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  aboutUsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  aboutUsTextContainer: {
    flex: 2,
    paddingRight: 15,
  },
  aboutUsDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    textAlign: 'left',
  },
  aboutUsIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F2FF',
    borderRadius: 15,
    padding: 10,
    height: 100,
  },
  aboutUsIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
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
    color: '#999',
  },
  activeNavIcon: {
    color: '#0391C4',
  },
  badge: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});

export default HomeScreen;
