import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NotificationScreen = () => {
  const navigation = useNavigation();

  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Pesanan Selesai',
      message: 'Pesanan cuci & setrika Anda telah selesai. Silakan ambil di outlet kami.',
      time: '10 menit yang lalu',
      read: false,
      icon: 'local-laundry-service'
    },
    {
      id: 2,
      type: 'promo',
      title: 'Promo Spesial!',
      message: 'Dapatkan diskon 20% untuk layanan cuci sepatu sampai akhir bulan.',
      time: '2 jam yang lalu',
      read: false,
      icon: 'local-offer'
    },
    {
      id: 3,
      type: 'info',
      title: 'Informasi Jam Operasional',
      message: 'Outlet kami akan tutup lebih awal pada tanggal 25 December 2025.',
      time: '1 hari yang lalu',
      read: true,
      icon: 'info'
    }
  ];

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return '#0391C4';
      case 'promo':
        return '#FF9800';
      case 'info':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.notificationList}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              !notification.read && styles.unreadNotification
            ]}
          >
            <View 
              style={[
                styles.iconContainer,
                { backgroundColor: `${getNotificationColor(notification.type)}15` }
              ]}
            >
              <Icon 
                name={notification.icon}
                size={24}
                color={getNotificationColor(notification.type)}
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            {!notification.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  notificationList: {
    flex: 1,
    padding: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadNotification: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#0391C4',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0391C4',
    marginLeft: 10,
  },
});

export default NotificationScreen;