// App.js

import React, { useState, useEffect, useCallback } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import SplashScreenComponent from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SelfieScreen from './src/screens/SelfieScreen';
import HomeScreen from './src/screens/HomeScreen';
import JoinGameScreen from './src/screens/JoinGameScreen';
import CreateGameScreen from './src/screens/CreateGameScreen';
import RoomScreen from './src/screens/RoomScreen';
import PhotoEscapeNavigator from './src/games/photoEscape/PhotoEscapeNavigator';  // Import PhotoEscape Navigator
import TestingFeaturesScreen from './src/screens/Testing/TestingFeaturesScreen';
import TestPhotoCapture from './src/screens/Testing/TestPhotoCapture';
import TestFaceSwap from './src/screens/Testing/FaceSwap';

const MainStack = createNativeStackNavigator();  // Main Stack for the app

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          'Doodle-Font': require('./assets/fonts/DoodleFont.ttf'),
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
          component={PhotoEscapeNavigator}  // Include the PhotoEscape navigator
          options={{ headerShown: false }}
        />

        <MainStack.Screen
            name="TestingFeatures"
            component={TestingFeaturesScreen}
            options={{ title: 'Testing Features' }} />

        <MainStack.Screen
            name="TestPhotoCapture"
            component={TestPhotoCapture} />

        <MainStack.Screen
            name="TestFaceSwap"
            component={TestFaceSwap} />

      </MainStack.Navigator>


    </NavigationContainer>
  );
}
