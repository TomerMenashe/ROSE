import React, { useState, useEffect, useCallback } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import SplashScreenComponent from './src/screens/SplashScreen';
import AboutScreen from './src/screens/AboutScreen';  // Import the About Page
import WelcomeScreen from './src/screens/WelcomeScreen';
import SelfieScreen from './src/screens/SelfieScreen';
import HomeScreen from './src/screens/HomeScreen';
import JoinGameScreen from './src/screens/JoinGameScreen';
import CreateGameScreen from './src/screens/CreateGameScreen';
import RoomScreen from './src/screens/RoomScreen';
import PhotoEscapeNavigator from './src/games/photoEscape/PhotoEscapeNavigator';
import EndVideo from './EndVideo'
import FaceSwap from './src/games/Memory Game/FaceSwap';

const MainStack = createNativeStackNavigator();  // Main Stack for the app

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          'Doodle-Font': require('./assets/fonts/DoodleFont.ttf'),
          'Neon-Glow': require('./assets/fonts/neon-glow.ttf'), // Load the Neon Glow font as well
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <MainStack.Navigator initialRouteName="Splash">
        <MainStack.Screen
          name="Splash"
          component={SplashScreenComponent}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="About"
          component={AboutScreen} 
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="Selfie"
          component={SelfieScreen}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="JoinGame"
          component={JoinGameScreen}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="CreateGame"
          component={CreateGameScreen}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="Room"
          component={RoomScreen}
          options={{ headerShown: false }}
        />

        {/* Add PhotoEscape Navigator */}
        <MainStack.Screen
          name="PhotoEscape"
          component={PhotoEscapeNavigator}
          options={{ headerShown: false }}
        />

        <MainStack.Screen
          name="EndVideo"
          component={EndVideo}
          options={{ title: 'EndVideo' }}
        />

        <MainStack.Screen
          name="FaceSwap"
          component={FaceSwap}
        />
      </MainStack.Navigator>
    </NavigationContainer>
  );
}
