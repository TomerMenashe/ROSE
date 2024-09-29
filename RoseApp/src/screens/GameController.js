// GameController.js

import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, View, Text } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { GAME_FLOW } from '../gameFlow';
import { firebase } from '../firebase/firebase';

const GameController = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { pin, name, selfieURL } = route.params || {};

  const roomRef = firebase.database().ref(`room/${pin}`);

  const [currentGameIndex, setCurrentGameIndex] = useState(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Check if `currentGameIndex` exists; if not, create it and set to 0
  useEffect(() => {
    roomRef.child('currentGameIndex').once('value', (snapshot) => {
      if (snapshot.exists()) {
        setCurrentGameIndex(snapshot.val());
      } else {
        roomRef.child('currentGameIndex').set(0);
        setCurrentGameIndex(0);
      }
    });
  }, []);

  // Update `playersInGameControl` every time the screen is focused
  useFocusEffect(
      React.useCallback(() => {
        const userRef = roomRef.child('playersInGameControl').child(name);
        userRef.set(true);

        // Clean up when the screen is unfocused
        return () => {
          userRef.remove();
        };
      }, [name, roomRef])
  );

  // Listener for `playersInGameControl` to determine when there are two players
  useEffect(() => {
    const playersRef = roomRef.child('playersInGameControl');

    const onValueChange = (snapshot) => {
      const players = snapshot.val();
      const numPlayers = players ? Object.keys(players).length : 0;

      if (numPlayers >= 2 && currentGameIndex !== null && !hasNavigated) {
        setIsWaiting(false);
      } else {
        setIsWaiting(true);
      }
    };

    playersRef.on('value', onValueChange);

    // Clean up the listener when component unmounts
    return () => {
      playersRef.off('value', onValueChange);
    };
  }, [currentGameIndex, hasNavigated]);

  // Listener for `currentGameIndex` to reset `hasNavigated`
  useEffect(() => {
    const currentGameIndexRef = roomRef.child('currentGameIndex');

    const onValueChange = (snapshot) => {
      const value = snapshot.val();
      setCurrentGameIndex(value);
      setHasNavigated(false);
    };

    currentGameIndexRef.on('value', onValueChange);

    return () => {
      currentGameIndexRef.off('value', onValueChange);
    };
  }, []);

  // Navigate to next game when ready
  useEffect(() => {
    if (!isWaiting && !hasNavigated && currentGameIndex !== null) {
      console.log('[GameController] Ready for navigation.');

      const nextGame = GAME_FLOW[currentGameIndex];

      if (nextGame) {
        navigateToNextScreen(nextGame);
        setHasNavigated(true);

        // Increase `currentGameIndex` by 0.5 from each user
        roomRef.child('currentGameIndex').transaction((currentValue) => {
          return (currentValue || 0) + 0.5;
        });

        // Clean `playersInGameControl`
        roomRef.child('playersInGameControl').remove();
      } else {
        console.error(`[GameController] Unknown game in GAME_FLOW: ${nextGame}`);
        Alert.alert('Error', `Unknown game: ${nextGame}`);
      }
    }
  }, [isWaiting, hasNavigated, currentGameIndex]);

  const navigateToNextScreen = (nextGame) => {
    switch (nextGame) {
      case 'PhotoEscape':
        navigation.navigate('PhotoEscape', {
          screen: 'PhotoEscapeLoadingScreen',
          params: { pin, name, selfieURL },
        });
        break;
      case 'LoveQuestion':
        navigation.navigate('LoveQuestion', { pin, name, selfieURL });
        break;
      case 'MemoryGame':
        navigation.navigate('MemoryGame', {
          screen: 'MemoryGameLoading',
          params: { pin, name, selfieURL },
        });
        break;
      case 'EndVideo':
        navigation.navigate('EndVideo', { pin, name, selfieURL });
        break;
      default:
        console.error(`[GameController] Unknown game in GAME_FLOW: ${nextGame}`);
        Alert.alert('Error', `Unknown game: ${nextGame}`);
    }
  };

  if (isWaiting) {
    return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loaderText}>Waiting for the second player to join...</Text>
        </View>
    );
  }

  return (
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>Not waiting. Ready for navigation.</Text>
      </View>
  );
};

const styles = {
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loaderText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 18,
  },
  debugContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#101010',
  },
  debugText: {
    color: '#FFCC00',
    fontSize: 18,
    textAlign: 'center',
  },
};

export default GameController;
