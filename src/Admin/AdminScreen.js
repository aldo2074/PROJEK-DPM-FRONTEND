import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  Platform,
  FlatList,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { ORDER_URL } from '../../api';
import Toast from 'react-native-toast-message';

const AdminScreen = () => {
  const [selectedTab, setSelectedTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTab === 'orders') {
      fetchOrders();
    }
  }, [selectedTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${ORDER_URL}/admin/orders`);
      console.log('Orders response:', response.data); // Untuk debugging
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal mengambil data pesanan'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, userId, newStatus) => {
    try {
      const response = await axios.put(`${ORDER_URL}/admin/update-status/${orderId}`, {
        status: newStatus
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Sukses',
          text2: 'Status pesanan berhasil diperbarui'
        });
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal memperbarui status pesanan'
      });
    }
  };

  // Mock data for chats
  const chats = [
    {
      id: '1',
      customerName: 'Jane Smith',
      lastMessage: 'Pesanan saya sudah selesai?',
      unread: 2,
      timestamp: '09:45'
    },
    // Add more chats as needed
  ];

  // Mock data for financial history
  const finances = [
    {
      id: '1',
      type: 'income',
      amount: 150000,
      description: 'Pembayaran Order #123',
      date: '2025-01-15'
    },
    // Add more financial records as needed
  ];

  const renderOrderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.customerName}>{item.orderNumber}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        {item.items.map((serviceItem, index) => (
          <View key={index}>
            <Text style={styles.serviceText}>{serviceItem.service}</Text>
            {serviceItem.items.map((subItem, subIndex) => (
              <Text key={`${index}-${subIndex}`} style={styles.itemText}>
                {subItem.quantity}x {subItem.name} (Rp {subItem.price.toLocaleString()})
              </Text>
            ))}
          </View>
        ))}
        
        <View style={styles.cardDivider} />
        
        <Text style={styles.detailText}>
          Metode Pengiriman: {item.deliveryMethod}
        </Text>
        {item.deliveryAddress && (
          <Text style={styles.detailText}>
            Alamat: {item.deliveryAddress}
          </Text>
        )}
        <Text style={styles.detailText}>
          Pembayaran: {item.paymentMethod}
        </Text>
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            Rp {item.totalAmount.toLocaleString()}
          </Text>
        </View>

        {item.status === 'Menunggu Konfirmasi' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => {
                Alert.alert(
                  'Konfirmasi',
                  'Terima pesanan ini?',
                  [
                    { text: 'Batal', style: 'cancel' },
                    { 
                      text: 'Ya', 
                      onPress: () => handleUpdateStatus(item._id, item.userId, 'Diproses')
                    }
                  ]
                );
              }}
            >
              <Text style={styles.actionButtonText}>Terima</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => {
                Alert.alert(
                  'Konfirmasi',
                  'Tolak pesanan ini?',
                  [
                    { text: 'Batal', style: 'cancel' },
                    { 
                      text: 'Ya', 
                      onPress: () => handleUpdateStatus(item._id, item.userId, 'Ditolak')
                    }
                  ]
                );
              }}
            >
              <Text style={styles.actionButtonText}>Tolak</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.chatContainer}>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.customerName}</Text>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.chatTime}>{item.timestamp}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFinanceItem = ({ item }) => (
    <View style={styles.financeContainer}>
      <View style={styles.financeIconContainer}>
        <Icon 
          name={item.type === 'income' ? 'arrow-downward' : 'arrow-upward'} 
          size={24} 
          color={item.type === 'income' ? '#4CAF50' : '#F44336'}
        />
      </View>
      <View style={styles.financeContent}>
        <Text style={styles.financeDescription}>{item.description}</Text>
        <Text style={styles.financeDate}>{item.date}</Text>
      </View>
      <Text style={[
        styles.financeAmount,
        { color: item.type === 'income' ? '#4CAF50' : '#F44336' }
      ]}>
        Rp {item.amount.toLocaleString()}
      </Text>
    </View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'orders':
        return (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        );
      case 'chats':
        return (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        );
      case 'finances':
        return (
          <FlatList
            data={finances}
            renderItem={renderFinanceItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return '#FFE4B5';
      case 'Diproses':
        return '#87CEEB';
      case 'Selesai':
        return '#90EE90';
      case 'Ditolak':
        return '#FFB6C1';
      default:
        return '#F0F0F0';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Kelola Laundry Anda</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'orders' && styles.activeTab]}
          onPress={() => setSelectedTab('orders')}
        >
          <Icon 
            name="receipt" 
            size={24} 
            color={selectedTab === 'orders' ? '#0391C4' : '#666'}
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'orders' && styles.activeTabText
          ]}>Pesanan</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'chats' && styles.activeTab]}
          onPress={() => setSelectedTab('chats')}
        >
          <Icon 
            name="chat" 
            size={24} 
            color={selectedTab === 'chats' ? '#0391C4' : '#666'}
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'chats' && styles.activeTabText
          ]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'finances' && styles.activeTab]}
          onPress={() => setSelectedTab('finances')}
        >
          <Icon 
            name="account-balance-wallet" 
            size={24} 
            color={selectedTab === 'finances' ? '#0391C4' : '#666'}
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'finances' && styles.activeTabText
          ]}>Keuangan</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </SafeAreaView>
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
        paddingBottom: 20,
        shadowColor: '#0391C4',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
      },
      header: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
      },
      headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      headerSubtitle: {
        color: '#E6F2FF',
        fontSize: 14,
        opacity: 0.9,
      },
      logoutButton: {
        position: 'absolute',
        right: 20,
        top: 40,
        flexDirection: 'row',
        alignItems: 'center',
      },
      logoutText: {
        marginLeft: 5,
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
      },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#E6F2FF',
  },
  tabText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0391C4',
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    marginTop: 5,
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0391C4',
  },
  chatContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#0391C4',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  financeContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  financeIconContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  financeContent: {
    flex: 1,
  },
  financeDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  financeDate: {
    fontSize: 12,
    color: '#666',
  },
  financeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  }
});

export default AdminScreen;