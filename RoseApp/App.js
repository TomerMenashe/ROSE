import React, { useState, useEffect, useCallback } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
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
import GameController from "./src/screens/GameController";
import LoveQuestion from "./src/games/questions_and_tasks/LoveQuestion";
import MemoryGameNavigator from "./src/games/memoryGame/MemoryGameNavigator";
import QuestionsAndTasksNavigator from './src/games/questions_and_tasks/QuestionsAndTasksNavigator';
import newGameProcessing from "./src/screens/NewGameProcessing";
import NewGameProcessing from "./src/screens/NewGameProcessing";

const MainStack = createNativeStackNavigator();  // Main Stack for the app

export default function App() {
  //This function is for being able to update the already deployed app, for now we don't want trouble so it's in comments
  /*async function onFetchUpdateAsync(){
    try{
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error){
      alert(`error fetching latest expo update ${error}`);
    }
  }
  //triggers the onFetchUpdate function
  useEffect(() => {
    onFetchUpdateAsync();
  },[])*/
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
          options={{ headerShown: false }}
        />

        <MainStack.Screen
          name="GameController"
          component={GameController}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
            name="LoveQuestion"
            component={LoveQuestion}
            options={{ headerShown: false }}
        />
        <MainStack.Screen
            name="MemoryGame"
            component={MemoryGameNavigator}
            options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="QuestionsAndTasks"
          component={QuestionsAndTasksNavigator}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
            name="NewGame"
            component={NewGameProcessing}
            options={{ headerShown: false }}
        />
      </MainStack.Navigator>
    </NavigationContainer>
  );
}
