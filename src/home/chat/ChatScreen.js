import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

// Memisahkan komponen Header menjadi lebih simpel
const Header = () => (
  <View style={styles.header}>
    <View style={styles.adminInfo}>
      <Image
        source={require('../../../assets/icons/admin-avatar.png')}
        style={styles.adminAvatar}
      />
      <Text style={styles.adminName}>Admin Laundry</Text>
    </View>
  </View>
);

// Optimasi ChatMessages dengan React.memo
const ChatMessages = React.memo(({ messages, scrollRef }) => (
  <ScrollView
    ref={scrollRef}
    style={styles.chatContainer}
    contentContainerStyle={styles.chatContent}
    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
  >
    <View style={styles.dateHeader}>
      <Text style={styles.dateText}>Hari ini</Text>
    </View>
    {messages.map((chat) => (
      <View
        key={chat.id}
        style={[
          styles.messageContainer,
          chat.sender === 'user' ? styles.userMessage : styles.adminMessage,
        ]}
      >
        {chat.sender === 'admin' && (
          <Image
            source={require('../../../assets/icons/admin-avatar.png')}
            style={styles.messageAvatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            chat.sender === 'user' ? styles.userBubble : styles.adminBubble,
          ]}
        >
          {chat.image && (
            <Image source={{ uri: chat.image }} style={styles.chatImage} />
          )}
          <Text
            style={[
              styles.messageText,
              chat.sender === 'user' ? styles.userMessageText : styles.adminMessageText,
            ]}
          >
            {chat.message}
          </Text>
          <Text style={styles.messageTime}>{chat.time}</Text>
        </View>
      </View>
    ))}
  </ScrollView>
));

// Optimasi InputBar dengan React.memo
const InputBar = React.memo(({ message, onChangeText, onSend, onAttachImage }) => (
  <View style={styles.inputContainer}>
    <View style={styles.inputWrapper}>
      <TouchableOpacity style={styles.attachButton} onPress={onAttachImage}>
        <Icon name="attach-file" size={24} color="#666" />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Ketik pesan..."
        value={message}
        onChangeText={onChangeText}
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[styles.sendButton, message.trim() ? styles.sendButtonActive : null]}
        onPress={onSend}
        disabled={!message.trim()}
      >
        <Icon name="send" size={24} color={message.trim() ? "#ffffff" : "#A0A0A0"} />
      </TouchableOpacity>
    </View>
  </View>
));

// Optimasi BottomNav dengan React.memo dan konstanta
const NAV_ITEMS = [
  { icon: 'home', screen: 'Home', active: false },
  { icon: 'receipt-long', screen: 'Order', active: false },
  { icon: 'chat', screen: 'Chat', active: true },
  { icon: 'person', screen: 'Profile', active: false },
];

const BottomNav = React.memo(({ navigation }) => (
  <View style={styles.bottomNav}>
    {NAV_ITEMS.map((nav, index) => (
      <TouchableOpacity
        key={index}
        style={[styles.navItem, nav.active && styles.activeNavItem]}
        onPress={() => navigation.navigate(nav.screen)}
      >
        <Icon
          name={nav.icon}
          size={25}
          style={[styles.navIcon, nav.active && styles.activeNavIcon]}
        />
      </TouchableOpacity>
    ))}
  </View>
));

const ChatScreen = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const scrollViewRef = useRef();
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'admin', message: 'Halooo! Selamat datang di Laundry App 👋', time: '09:00' },
    { id: 2, sender: 'admin', message: 'Ada yang bisa kami bantu hari ini?', time: '09:00' },
  ]);

  const sendMessage = () => {
    if (message.trim() || image) {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMessage = {
        id: Date.now(),
        sender: 'user',
        message: message.trim(),
        image,
        time: currentTime,
      };

      setChatMessages(prev => [...prev, newMessage]);
      setMessage('');
      setImage(null);

      // Automated response
      setTimeout(() => {
        const adminResponse = {
          id: Date.now() + 1,
          sender: 'admin',
          message: 'Terima kasih atas pertanyaannya. Mohon tunggu sebentar ya, admin akan segera membalas pesan Anda.',
          time: currentTime,
        };
        setChatMessages(prev => [...prev, adminResponse]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 1000);
    }
  };

  const pickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert('Akses ke galeri ditolak');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.uri) {
        setImage(result.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ChatMessages messages={chatMessages} scrollRef={scrollViewRef} />
      <InputBar 
        message={message}
        onChangeText={setMessage}
        onSend={sendMessage}
        onAttachImage={pickImage}
      />
      <BottomNav navigation={navigation} />
    </View>
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
    paddingBottom: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginRight: 12,
  },
  adminName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateText: {
    backgroundColor: '#E6F2FF',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    color: '#0391C4',
    fontSize: 12,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  chatContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  adminMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#0391C4',
    borderTopRightRadius: 5,
  },
  adminBubble: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 5,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 5,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  adminMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 15,
    elevation: 3,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    padding: 8,
    marginLeft: 10,
  },
  sendButtonActive: {
    backgroundColor: '#0391C4',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
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
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
});

export default ChatScreen;