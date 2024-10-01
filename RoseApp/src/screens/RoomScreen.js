// RoomScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity
} from 'react-native';
import { firebase } from '../firebase/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useRoute, useNavigation } from '@react-navigation/native';
import { generatePhotoEscapeData } from '../games/photoEscape/PhotoEscapeGeneratingFunctions';
import { generateFaceSwaps } from '../games/memoryGame/MemoryGameFaceSwapFunctions';
import usePreventBack from "../components/usePreventBack";

const { height, width } = Dimensions.get('window');

const RoomScreen = () => {
  usePreventBack(); // **Added Hook Call**
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(null); // New state for countdown
  const route = useRoute();
  const navigation = useNavigation();
  const { pin, name, selfieURL } = route.params || {}; // Get the pin, name, and selfieURL from route params

  // Initialize Firebase functions
  const functions = getFunctions(firebase.app(), 'europe-west1');

  // Use a ref to persist the alreadyGenerated flag
  const alreadyGeneratedItemRef = useRef(false);
  const faceSwapCallRef = useRef(false);
  const roomCreator = useRef(false);
  const roomRef = firebase.database().ref(`room/${pin}`);

  useEffect(() => {
    // Listen for changes in participants
    const participantListener = roomRef.child('participants').on('value', (snapshot) => {
      if (snapshot.exists()) {
        const participantsData = snapshot.val();
        const participantsList = Object.values(participantsData);
        setParticipants(participantsList);

        if (participantsList.length === 1 && !alreadyGeneratedItemRef.current) {
          alreadyGeneratedItemRef.current = true;
          roomCreator.current = true;
          generatePhotoEscapeData(pin)
              .then(() => {
                console.log('Photo escape data generated successfully.');
              })
              .catch((error) => {
                console.error('[RoomScreen] Error generating PhotoEscape data:', error);
                Alert.alert('Error', 'Failed to generate PhotoEscape data.');
              });
        }

        if (participantsList.length === 2) {
          setIsLoading(false);

          if (!faceSwapCallRef.current && roomCreator.current) {
            faceSwapCallRef.current = true;
            console.log("RoomScreen: Called generating faceSwap");
            generateFaceSwaps(participantsList, pin);
          }

          // Set 'gameStarted' to true in Firebase
          roomRef.update({ gameStarted: true })
              .then(() => {
                // You can handle post-update actions here if needed
              })
              .catch((error) => {
                console.error('[RoomScreen] Error setting gameStarted:', error);
                Alert.alert('Error', 'Failed to start the game.');
              });

          // Start the 5-second countdown only once
          if (countdown === null) {
            setCountdown(5);
          }
        }
      } else {
        setParticipants([]);
      }
    });

    return () => {
      roomRef.child('participants').off('value', participantListener);
    };
  }, [pin, navigation, functions, name, selfieURL, countdown]);

  // Countdown effect
  useEffect(() => {
    let timerId;

    if (countdown > 0) {
      timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      // Corrected navigation call: pass parameters directly
      navigation.navigate('GameController', { pin, name, selfieURL });
    }

    return () => clearTimeout(timerId);
  }, [countdown, navigation, pin, name, selfieURL]);

  if (!pin) {
    return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: No game PIN provided.</Text>
        </View>
    );
  }

  // Define the leaveRoom function
  const leaveRoom = async () => {
    try {
      await roomRef.child('LeaveRoom').set("LeaveTheRoomNow!");
    } catch (error) {
      console.error('[RoomScreen] Error leaving room:', error);
      Alert.alert('Error', 'Failed to leave the room.');
    }
  };

  // Listen for LeaveRoom changes
  useEffect(() => {
    const leaveRoomListener = roomRef.child('LeaveRoom').on('value', async (snapshot) => {
      if (snapshot.exists()) {
        try {
          // Remove any active listeners to prevent `currentGameIndex` from being recreated
          roomRef.child('currentGameIndex').off();
          roomRef.child('playersInGameControl').off();

          // Remove `currentGameIndex` first
          await roomRef.child('currentGameIndex').remove();

          // Then remove the participants in the room
          await roomRef.remove();

          // Navigate back to the Home screen
          navigation.replace('Home', { name, selfieURL });
        } catch (error) {
          console.error('[RoomScreen] Error during room cleanup:', error);
          Alert.alert('Error', 'Failed to clean up the room.');
        }
      }
    });

    return () => {
      roomRef.child('LeaveRoom').off('value', leaveRoomListener);
    };
  }, [name, selfieURL, pin, navigation]);

  return (
      <ImageBackground
          source={require('../../assets/joinGame.jpeg')}
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Room PIN: {pin}</Text>

          {/* Display the participants' names and images */}
          {participants.length > 0 ? (
              participants.map((participant, index) => (
                  <View key={index} style={styles.participantContainer}>
                    <Image source={{ uri: participant.selfieURL }} style={styles.selfieImage} />
                    <Text style={styles.participantText}>{participant.name}</Text>
                  </View>
              ))
          ) : (
              <Text style={styles.participantText}>No participants yet.</Text>
          )}

          {isLoading ? (
              <>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Waiting for players...</Text>
              </>
          ) : countdown !== null ? (
              <Text style={styles.loadingText}>
                Starting game in {countdown} second{countdown !== 1 ? 's' : ''}...
              </Text>
          ) : (
              <Text style={styles.loadingText}>Players connected! Starting game...</Text>
          )}

          <TouchableOpacity
              style={[styles.downloadAllButton, styles.enhancedButton]}
              onPress={leaveRoom}
          >
            <Text style={styles.buttonText}>
              {'Leave Room'}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  participantContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  participantText: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  selfieImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
    borderColor: '#FFCC00',
    borderWidth: 2,
  },
  loadingText: {
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4B4B',
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  downloadAllButton: { // Added this style to prevent undefined style error
    padding: 10,
    backgroundColor: '#FF4B4B',
    borderRadius: 5,
    marginTop: 30,
  },
  enhancedButton: { // Added this style to prevent undefined style error
    // You can add additional styling here if needed
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default RoomScreen;
