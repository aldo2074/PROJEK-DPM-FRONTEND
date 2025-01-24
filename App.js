import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

// Import Screens
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/home/HomeScreen';
import ProfileScreen from './src/home/profil/ProfileScreen';
import CuciSetrikaScreen from './src/home/cuci-setrika/CuciSetrikaScreen';
import SetrikaScreen from './src/home/setrika/SetrikaScreen';
import AlasKasurScreen from './src/home/alas-kasur/AlasKasurScreen';
import CuciSepatuScreen from './src/home/cuci-sepatu/CuciSepatuScreen';
import ChatScreen from './src/home/chat/ChatScreen';
import OrderScreen from './src/home/order/OrderScreen';
import NotificationScreen from './src/home/notification/NotificationScreen';
import OrderConfirmationScreen from './src/home/order/OrderConfirmationScreen';
import OrderSuccessScreen from './src/home/order/OrderSuccessScreen';
import AdminScreen from './src/Admin/AdminScreen';
import RegistrationSuccessScreen from './src/screens/RegistrationSuccessScreen';
import CartScreen from './src/home/cart/CartScreen';
import LupaSandiScreen from './src/screens/LupaSandiScreen';
import OrderDetailScreen from './src/home/order/OrderDetailScreen';
import EditProfileScreen from './src/home/profil/EditProfileScreen';
import ChangePasswordScreen from './src/home/profil/ChangePasswordScreen';
import AboutAppScreen from './src/home/profil/AboutAppScreen';
import SplashScreen from './src/screens/SplashScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0391C4',
              elevation: 0, // untuk Android
              shadowOpacity: 0, // untuk iOS
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontFamily: 'MavenPro-Bold',
            },
            headerTitleAlign: 'center',
          }}
        >
          {/* Splash Screen */}
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ 
              headerShown: false,
              gestureEnabled: false 
            }}
          />

          {/* Landing Screen */}
          <Stack.Screen
            name="Landing"
            component={LandingScreen}
            options={{ 
              headerShown: false,
              gestureEnabled: false 
            }}
          />

          <Stack.Screen
            name="LupaSandi"
            component={LupaSandiScreen}
            options={{ 
              headerShown: false,
              gestureEnabled: false 
            }}
          />

          {/* Authentication Screens */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ 
              headerShown: false,
              gestureEnabled: false 
            }}
          />
        
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ 
              headerShown: false,
              gestureEnabled: false 
            }}
          />

          <Stack.Screen
            name="RegistrationSuccessScreen"
            component={RegistrationSuccessScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />

          {/* Main Screens */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ 
              headerShown: false,
              gestureEnabled: false
            }}
          />

          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
                headerShown: false,
                gestureEnabled: false
              }}
            />

          <Stack.Screen
            name="CuciSetrika"
            component={CuciSetrikaScreen}
            options={{
              title: 'Kembali',
              headerTitleStyle: {
                fontFamily: 'MavenPro-Bold',
                fontSize: 18,
              },
              headerTitleAlign: 'left',
              headerTitleContainerStyle: {
                paddingLeft: Platform.OS === 'ios' ? 0 : -16, // Untuk Android
              }
            }}
          />
          <Stack.Screen
            name="Setrika"
            component={SetrikaScreen}
            options={{
              title: 'Kembali',
              headerTitleStyle: {
                fontFamily: 'MavenPro-Bold',
                fontSize: 18,
              },
              headerTitleAlign: 'left',
              headerTitleContainerStyle: {
                paddingLeft: Platform.OS === 'ios' ? 0 : -16, // Untuk Android
              }
            }}
          />

          <Stack.Screen
            name="AlasKasur"
            component={AlasKasurScreen}
            options={{
              title: 'Konfirmasi',
              title: 'Kembali',
              headerTitleStyle: {
                fontFamily: 'MavenPro-Bold',
                fontSize: 18,
              },
              headerTitleAlign: 'left',
              headerTitleContainerStyle: {
                paddingLeft: Platform.OS === 'ios' ? 0 : -16, // Untuk Android
              }
            }}
          />
          
          <Stack.Screen
            name="CuciSepatu"
            component={CuciSepatuScreen}
            options={{
              title: 'Konfirmasi',
              title: 'Kembali',
              headerTitleStyle: {
                fontFamily: 'MavenPro-Bold',
                fontSize: 18,
              },
              headerTitleAlign: 'left',
              headerTitleContainerStyle: {
                paddingLeft: Platform.OS === 'ios' ? 0 : -16, // Untuk Android
              }
            }}
          />

          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          
          <Stack.Screen
            name="Order"
            component={OrderScreen}
            options={{
                headerShown: false,
                gestureEnabled: false
              }}
            />

          <Stack.Screen
            name="Notification"
            component={NotificationScreen}
            options={{
              title: 'Notifikasi',
              headerTitleStyle: {
                fontFamily: 'MavenPro-Bold',
                fontSize: 18,
              },
            }}
          />

          <Stack.Screen
            name="OrderConfirmation"
            component={OrderConfirmationScreen}
            options={{
              title: 'Konfirmasi',
              title: 'Kembali',
              headerTitleStyle: {
                fontFamily: 'MavenPro-Bold',
                fontSize: 18,
              },
              headerTitleAlign: 'left',
              headerTitleContainerStyle: {
                paddingLeft: Platform.OS === 'ios' ? 0 : -16, // Untuk Android
              }
            }}
          />

          <Stack.Screen
            name="OrderSuccess"
            component={OrderSuccessScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          
          {/* Admin Panel */}
          <Stack.Screen
            name="Admin"
            component={AdminScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
              <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
              title: 'Kembali',
              headerTitleStyle: {
                fontFamily: 'MavenPro-Bold',
                fontSize: 18,
              },
              headerTitleAlign: 'left',
              headerTitleContainerStyle: {
                paddingLeft: Platform.OS === 'ios' ? 0 : -16,
              }
            }}
          />

          {/* Add OrderDetail Screen */}
          <Stack.Screen
            name="OrderDetail"
            component={OrderDetailScreen}
            options={{
              title: 'Detail Pesanan',
              headerShown: false,
              gestureEnabled: true,
            }}
          />

          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ headerShown: false }}
          />
          
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ headerShown: false }}
          />
          
          <Stack.Screen
            name="About"
            component={AboutAppScreen}
            options={({ route }) => ({
              headerShown: false,
              title: route.params?.name || 'Tentang Aplikasi',
              gestureEnabled: true
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
