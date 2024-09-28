import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GAME_FLOW } from '../gameFlow';
import { firebase } from '../firebase/firebase';

const GameController = ({ pin, name, selfieURL }) => {
  const navigation = useNavigation();

  useEffect(() => {
    const roomRef = firebase.database().ref(`room/${pin}`);

    const gameListener = roomRef.on('value', async (snapshot) => {
      const gameState = snapshot.val();
      if (gameState) {
        const { currentGameIndex, gameStarted } = gameState;

        if (!gameStarted) {
          // Game has not started yet
          return;
        }

        if (currentGameIndex === undefined || currentGameIndex === null) {
          // Initialize currentGameIndex
          await roomRef.update({ currentGameIndex: 0 });
          return;
        }

        const nextGame = GAME_FLOW[currentGameIndex];

        if (nextGame) {
          switch (nextGame) {
            case 'PhotoEscape':
              navigation.navigate('PhotoEscape', {
                screen: 'PhotoEscapeLoadingScreen',
                params: { pin, name, selfieURL },
              });
              break;
            case 'LoveQuestions':
              navigation.navigate('LoveQuestions', { pin, name, selfieURL });
              break;
            case 'FaceSwap':
              navigation.navigate('FaceSwap', {  // Updated to match 'FaceSwap' in App.js
                screen: 'LoadingScreen',
                params: { pin, name, selfieURL },
              });
              break;
            // Add more cases as you add more games
            default:
              console.error(`Unknown game in GAME_FLOW: ${nextGame}`);
              Alert.alert('Error', `Unknown game: ${nextGame}`);
          }
        } else {
          console.log('All games in GAME_FLOW have been played.');
          Alert.alert('Congratulations!', 'All game rounds have been completed.');
          // Optionally, reset the game flow or navigate to a final summary screen
          // navigation.navigate('FinalSummary', { pin });
        }
      }
    });

    return () => {
      roomRef.off('value', gameListener);
    };
  }, [pin, navigation, name, selfieURL]);

  return null; // This component doesn't render anything visible
};

export default GameController;