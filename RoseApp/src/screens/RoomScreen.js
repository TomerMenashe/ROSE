// RoomScreen.js

import React, { useState, useEffect, useRef, useContext } from 'react'; // Added useContext
import { View, Text, StyleSheet, ImageBackground, Dimensions, ActivityIndicator, Alert, Image } from 'react-native';
import { firebase } from '../firebase/firebase';
import { getFunctions } from 'firebase/functions';
import { useRoute, useNavigation } from '@react-navigation/native';
import { generatePhotoEscapeData } from '../games/photoEscape/PhotoEscapeGeneratingFunctions';
import { generateFaceSwaps } from '../games/memoryGame/MemoryGameFaceSwapFunctions';
import { AudioContext } from '../context/AudioContext'; // Import AudioContext

const { height, width } = Dimensions.get('window');

const RoomScreen = () => {
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(null); // New state for countdown
  const route = useRoute();
  const navigation = useNavigation();
  const { pin, name, selfieURL } = route.params || {}; // Get the pin, name, and selfieURL from route params


  // Initialize Firebase functions
  const functions = getFunctions(firebase.app(), 'us-central1');

  // Use a ref to persist the alreadyGenerated flag
  const alreadyGeneratedItemRef = useRef(false);
  const faceSwapCallRef = useRef(false);
  const roomCreator = useRef(false);

  const { stopBackgroundSound } = useContext(AudioContext); // Destructure stopBackgroundSound from context

  // Remove the ref to prevent multiple stops since we're moving stop logic to GameController
  // const hasStoppedSound = useRef(false);

  useEffect(() => {
    if (!pin) {
      Alert.alert('Error', 'No game PIN provided.');
      console.error('[RoomScreen] No game PIN provided.');
      return;
    }

    const roomRef = firebase.database().ref(`room/${pin}`);

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

          // Remove the stopBackgroundSound call from here
          // stopBackgroundSound(); // Removed: Stop background music when 2 players are present

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
  }, [pin, navigation, functions, name, selfieURL, countdown /*, stopBackgroundSound */]); // Removed stopBackgroundSound from dependencies

  // Countdown logic remains the same
  useEffect(() => {
    let timerId;

    if (countdown > 0) {
      timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      // Proceed to navigate to GameController
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
});

export default RoomScreen;