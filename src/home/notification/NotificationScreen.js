import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  AppState,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { NOTIFICATION_URL } from '../../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const POLLING_INTERVAL = 2000;

  const fetchNotifications = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('userToken');
      
      console.log('Fetching notifications...');
      
      const response = await axios.get(NOTIFICATION_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Notifications response:', response.data);

      if (response.data.success) {
        const sortedNotifications = response.data.notifications.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sortedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Gagal memuat notifikasi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, POLLING_INTERVAL);
    return () => {
      clearInterval(interval);
      console.log('Polling cleanup');
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, fetching notifications...');
      fetchNotifications();
      return () => {
        console.log('Screen unfocused');
      };
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        fetchNotifications();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  const markAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Marking notification as read:', notificationId);

      if (!notificationId || typeof notificationId !== 'string') {
        throw new Error('ID notifikasi tidak valid');
      }

      const response = await axios.put(
        `${NOTIFICATION_URL}/${notificationId.trim()}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Mark as read response:', response.data);

      if (response.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            notif._id === notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Gagal menandai notifikasi sebagai dibaca'
      });
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Attempting to delete notification with ID:', notificationId);
      
      Alert.alert(
        'Hapus Notifikasi',
        'Apakah Anda yakin ingin menghapus notifikasi ini?',
        [
          {
            text: 'Batal',
            style: 'cancel'
          },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: async () => {
              try {
                if (!notificationId || typeof notificationId !== 'string') {
                  throw new Error('ID notifikasi tidak valid');
                }

                const response = await axios.delete(
                  `${NOTIFICATION_URL}/${notificationId.trim()}`,
                  { 
                    headers: { 
                      Authorization: `Bearer ${token}` 
                    } 
                  }
                );
                
                console.log('Delete response:', response.data);

                if (response.data.success) {
                  setNotifications(prevNotifications =>
                    prevNotifications.filter(notif => notif._id !== notificationId)
                  );
                  
                  Toast.show({
                    type: 'success',
                    text1: 'Sukses',
                    text2: 'Notifikasi berhasil dihapus'
                  });
                }
              } catch (error) {
                console.error('Error deleting notification:', error.response?.data || error);
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: error.response?.data?.error || 'Gagal menghapus notifikasi'
                });
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal menghapus notifikasi'
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return `${Math.floor(diff/60000)} menit yang lalu`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)} jam yang lalu`;
    return `${Math.floor(diff/86400000)} hari yang lalu`;
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return '#0391C4';
      case 'payment':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return 'local-laundry-service';
      case 'payment':
        return 'payment';
      default:
        return 'notifications';
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0391C4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchNotifications}
          >
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.notificationList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0391C4']}
            />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada notifikasi</Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification._id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification
                ]}
                onPress={() => markAsRead(notification._id)}
              >
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: `${getNotificationColor(notification.type)}15` }
                ]}>
                  <Icon 
                    name={getNotificationIcon(notification.type)}
                    size={24}
                    color={getNotificationColor(notification.type)}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>
                    {formatTime(notification.createdAt)}
                  </Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteNotification(notification._id)}
                >
                  <Icon name="delete-outline" size={24} color="#FF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0391C4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  }
});

export default NotificationScreen;