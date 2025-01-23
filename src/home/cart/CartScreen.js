import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
  BackHandler
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CART_URL } from '../../../api';
import Toast from 'react-native-toast-message';
import Animated from 'react-native-reanimated';

const CartScreen = ({ route, navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Tambahkan useEffect untuk memantau params
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        const refresh = route?.params?.refresh || false;
        const editSuccess = route?.params?.editSuccess || false;
        
        if (refresh || editSuccess) {
            fetchCartData();
            // Reset params
            navigation.setParams({ 
                refresh: false,
                editSuccess: false 
            });
            
            // Tampilkan pesan sukses jika dari edit
            if (editSuccess) {
                Toast.show({
                    type: 'success',
                    text1: 'Berhasil',
                    text2: 'Layanan berhasil diperbarui',
                    position: 'bottom'
                });
            }
        }
    });

    return unsubscribe;
  }, [navigation, route?.params]);

  const handleAddMoreItems = async (service) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      console.log('Service to edit:', service);

      if (!service || !service._id) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Data layanan tidak valid',
          position: 'bottom'
        });
        return;
      }

      const navigationData = {
        editMode: true,
        existingItems: service.items || [],
        serviceId: service._id,
        serviceName: service.service
      };

      console.log('Navigation data for edit:', navigationData);

      switch (service.service) {
        case 'Cuci & Setrika':
          navigation.navigate('CuciSetrika', navigationData);
          break;
        case 'Setrika':
          navigation.navigate('Setrika', navigationData);
          break;
        case 'Alas Kasur':
          navigation.navigate('AlasKasur', navigationData);
          break;
        case 'Cuci Sepatu':
          navigation.navigate('CuciSepatu', {
            editMode: true,
            serviceId: service._id,
            quantity: service.items[0]?.quantity || 0,
            service: service
          });
          break;
        default:
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Jenis layanan tidak valid',
            position: 'bottom'
          });
      }
    } catch (error) {
      console.error('Error in handleAddMoreItems:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal membuka layanan',
        position: 'bottom'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Fungsi untuk handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    return () => backHandler.remove();
  }, [hasChanges]);

  const handleBackPress = () => {
    if (hasChanges) {
      Alert.alert(
        'Batalkan Perubahan?',
        'Perubahan yang belum disimpan akan hilang',
        [
          { text: 'Tetap Disini', style: 'cancel' },
          { 
            text: 'Batalkan', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
      return true;
    }
    navigation.goBack();
    return true;
  };

  // Fungsi untuk mengambil data cart
  const fetchCartData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Sesi anda telah berakhir',
          position: 'bottom'
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const response = await axios.get(CART_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        console.log('Cart data fetched:', response.data);
        setCartItems(response.data.items || []);
      } else {
        console.log('Failed to fetch cart:', response.data);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.error || 'Gagal mengambil data keranjang',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error.response || error);
      if (error.response?.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Sesi anda telah berakhir',
          position: 'bottom'
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.error || 'Gagal mengambil data keranjang',
          position: 'bottom'
        });
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data saat screen fokus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Cart screen focused - fetching data');
      fetchCartData();
      return () => {
        setSelectedService(null);
        setHasChanges(false);
      };
    }, [])
  );

  // Fungsi refresh
  const onRefresh = React.useCallback(() => {
    console.log('Manual refresh triggered');
    setRefreshing(true);
    fetchCartData();
  }, []);

  // Handle edit service
  const handleEditService = async (service) => {
    if (!service || !service._id) {
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Data layanan tidak valid',
            position: 'bottom'
        });
        return;
    }

    try {
        const navigationData = {
            editMode: true,
            existingItems: service.items || [],
            serviceId: service._id,
            serviceName: service.service,
            totalPrice: service.totalPrice,
            isEdit: true
        };

        console.log('Navigation data for edit:', navigationData);

        switch (service.service) {
            case 'Setrika':
                navigation.navigate('Setrika', navigationData);
                break;
            case 'Cuci & Setrika':
                navigation.navigate('CuciSetrika', navigationData);
                break;
            case 'Alas Kasur':
                navigation.navigate('AlasKasur', navigationData);
                break;
            case 'Cuci Sepatu':
                navigation.navigate('CuciSepatu', {
                    ...navigationData,
                    quantity: service.items[0]?.quantity || 0,
                    service: service
                });
                break;
            default:
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Jenis layanan tidak valid',
                    position: 'bottom'
                });
        }
    } catch (error) {
        console.error('Error in handleEditService:', error);
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.response?.data?.error || 'Gagal membuka layanan',
            position: 'bottom'
        });
    }
  };

  // Handle remove service
  const handleRemoveItem = async (serviceId) => {
    Alert.alert(
      'Hapus Layanan',
      'Anda yakin ingin menghapus layanan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (!token) {
                handleSessionExpired('Token tidak ditemukan');
                return;
              }

              const response = await axios.delete(`${CART_URL}/remove/${serviceId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (response.data.success) {
                setCartItems(prev => prev.filter(item => item._id !== serviceId));
                Toast.show({
                  type: 'success',
                  text1: 'Berhasil',
                  text2: 'Layanan berhasil dihapus',
                  position: 'bottom'
                });
              }
            } catch (error) {
              console.error('Error removing item:', error);
              if (error.response?.status === 401) {
                handleSessionExpired(error.response?.data?.error || 'Sesi telah berakhir');
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: error.response?.data?.error || 'Gagal menghapus layanan',
                  position: 'bottom'
                });
              }
            }
          }
        }
      ]
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Kosongkan Keranjang',
      'Apakah Anda yakin ingin mengosongkan keranjang?',
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Kosongkan',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              await axios.delete(`${CART_URL}/clear`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              Toast.show({
                type: 'success',
                text1: 'Berhasil',
                text2: 'Keranjang berhasil dikosongkan',
                position: 'bottom'
              });
              
              setCartItems([]);
            } catch (error) {
              console.error('Error clearing cart:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.error || 'Gagal mengosongkan keranjang',
                position: 'bottom'
              });
            }
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Keranjang Kosong',
        text2: 'Silakan tambahkan item ke keranjang',
        position: 'bottom'
      });
      return;
    }
    navigation.navigate('OrderConfirmation', { cartItems });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, service) => total + service.totalPrice, 0);
  };

  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  const handleQuantityChange = async (serviceId, itemName, action) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const service = cartItems.find(s => s._id === serviceId);
      if (!service) return;

      const item = service.items.find(i => i.name === itemName);
      if (!item) return;

      let newQuantity;
      if (typeof action === 'number') {
        newQuantity = action;
      } else {
        newQuantity = action === 'increment' ? item.quantity + 1 : item.quantity - 1;
      }

      // Tambahkan validasi khusus untuk Cuci Sepatu
      if (service.service === 'Cuci Sepatu' && newQuantity > 20) {
        Toast.show({
          type: 'info',
          text1: 'Maksimum Item',
          text2: 'Maksimum 20 pasang sepatu per layanan',
          position: 'bottom'
        });
        return;
      }

      // Jika quantity menjadi 0, hapus item
      if (newQuantity <= 0) {
        // Jika ini item terakhir dalam layanan, hapus seluruh layanan
        if (service.items.length === 1) {
          handleRemoveItem(serviceId.toString());
          return;
        }

        // Jika masih ada item lain, update service tanpa item ini
        const token = await AsyncStorage.getItem('userToken');
        const response = await axios.delete(`${CART_URL}/remove/${serviceId}/${itemName}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          // Update local state
          const updatedCartItems = cartItems.map(s => {
            if (s._id === serviceId) {
              return {
                ...s,
                items: s.items.filter(i => i.name !== itemName),
                totalPrice: s.items
                  .filter(i => i.name !== itemName)
                  .reduce((sum, i) => sum + (i.price * i.quantity), 0)
              };
            }
            return s;
          });
          setCartItems(updatedCartItems);

          Toast.show({
            type: 'success',
            text1: 'Berhasil',
            text2: 'Item berhasil dihapus',
            position: 'bottom'
          });
        }
        return;
      }

      // Update quantity jika lebih dari 0
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.patch(
        `${CART_URL}/quantity`,
        {
          serviceId,
          itemName,
          quantity: newQuantity,
          service: service.service
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update local state
        const updatedCartItems = cartItems.map(s => {
          if (s._id === serviceId) {
            return {
              ...s,
              items: s.items.map(i => 
                i.name === itemName 
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
              totalPrice: s.items.reduce((sum, i) => {
                if (i.name === itemName) {
                  return sum + (i.price * newQuantity);
                }
                return sum + (i.price * i.quantity);
              }, 0)
            };
          }
          return s;
        });
        setCartItems(updatedCartItems);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Gagal memperbarui jumlah',
        position: 'bottom'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Render item quantity controls
  const renderQuantityControls = (service, item) => (
    <View style={styles.quantityContainer}>
      <TouchableOpacity 
        style={[
          styles.quantityButton,
          (item.quantity <= 1 || isUpdating) && styles.quantityButtonDisabled
        ]}
        onPress={() => handleQuantityChange(service._id, item.name, 'decrement')}
        disabled={item.quantity <= 1 || isUpdating}
      >
        <Icon 
          name="remove" 
          size={20} 
          color={item.quantity <= 1 || isUpdating ? "#CCCCCC" : "#0391C4"} 
        />
      </TouchableOpacity>
      
      <Text style={styles.quantityText}>{item.quantity}</Text>
      
      <TouchableOpacity 
        style={[
          styles.quantityButton,
          (item.quantity >= 20 || isUpdating) && styles.quantityButtonDisabled
        ]}
        onPress={() => handleQuantityChange(service._id, item.name, 'increment')}
        disabled={item.quantity >= 20 || isUpdating}
      >
        <Icon 
          name="add" 
          size={20} 
          color={item.quantity >= 20 || isUpdating ? "#CCCCCC" : "#0391C4"} 
        />
      </TouchableOpacity>
      
      <Text style={styles.itemPrice}>
        Rp {(item.price * item.quantity).toLocaleString()}
      </Text>
    </View>
  );

  const renderServiceCard = (service) => {
    return (
      <Animated.View key={service._id} style={styles.serviceCard}>
        <TouchableOpacity 
          style={styles.serviceHeader}
          onPress={() => setSelectedService(
            selectedService === service._id ? null : service._id
          )}
        >
          <View style={styles.serviceTitleContainer}>
            <View style={styles.serviceIconContainer}>
              <Icon name="local-laundry-service" size={24} color="#0391C4" />
            </View>
            <View>
              <Text style={styles.serviceName}>{service.service}</Text>
              <Text style={styles.serviceItems}>
                {service.items.reduce((sum, item) => sum + item.quantity, 0)} item
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.serviceTotal}>
              Rp {service.totalPrice.toLocaleString()}
            </Text>
            <Icon 
              name={selectedService === service._id ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#666666" 
            />
          </View>
        </TouchableOpacity>

        {selectedService === service._id && (
          <View style={styles.serviceDetails}>
            {service.items.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <View style={styles.itemInfo}>
                  <Text>{item.name}</Text>
                  <Text style={styles.itemPriceUnit}>
                    {item.quantity} x Rp {item.price.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
            
            <View style={styles.serviceActions}>
              <TouchableOpacity 
                style={styles.addItemButton}
                onPress={() => handleEditService(service)}
              >
                <Icon name="edit" size={20} color="#0391C4" />
                <Text style={styles.addItemText}>Edit Layanan</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.removeServiceButton}
                onPress={() => handleRemoveItem(service._id)}
              >
                <Icon name="delete-outline" size={20} color="#FF3B30" />
                <Text style={styles.removeServiceText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  // Handle session expired
  const handleSessionExpired = (message) => {
    Alert.alert(
      'Sesi Berakhir',
      message,
      [
        {
          text: 'OK',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  // Tambahkan useEffect untuk debugging
  useEffect(() => {
    if (route?.params) {
        console.log('Route params:', route.params);
    }
  }, [route?.params]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0391C4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Keranjang Saya</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity 
            onPress={handleClearCart}
            style={styles.clearButton}
          >
            <Icon name="delete-sweep" size={24} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0391C4" />
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="shopping-cart" size={80} color="#0391C4" />
          </View>
          <Text style={styles.emptyTitle}>Keranjang Kosong</Text>
          <Text style={styles.emptyText}>
            Belum ada layanan yang ditambahkan
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Icon name="add-shopping-cart" size={20} color="#FFFFFF" />
            <Text style={styles.shopButtonText}>Mulai Belanja</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={["#0391C4"]}
              />
            }
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            {cartItems.map(renderServiceCard)}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          <View style={styles.bottomContainer}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalPrice}>
                Rp {cartItems.reduce((sum, item) => 
                  sum + item.totalPrice, 0
                ).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Icon name="shopping-cart-checkout" size={24} color="#FFFFFF" />
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24
  },
  serviceCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333'
  },
  serviceItems: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2
  },
  serviceTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0391C4',
    marginRight: 8
  },
  serviceDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16
  },
  itemContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  itemPriceUnit: {
    fontSize: 12,
    color: '#666666'
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8
  },
  quantityButtonDisabled: {
    backgroundColor: '#F5F5F5'
  },
  bottomContainer: {
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0391C4',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12
  },
  bottomSpacing: {
    height: 100
  },
  serviceTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceActions: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  addItemText: {
    color: '#0391C4',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500'
  },
  removeServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  removeServiceText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontSize: 14
  },
  disabledService: {
    opacity: 0.5
  },
  disabledText: {
    color: '#999999'
  },
  serviceAlert: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  serviceAlertText: {
    color: '#FF3B30',
    marginLeft: 8,
    flex: 1
  }
});

export default CartScreen;