// RoomScreen.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, ActivityIndicator, Alert, Image } from 'react-native';
import { firebase } from '../firebase/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useRoute, useNavigation } from '@react-navigation/native';
import { generatePhotoEscapeData } from '../../PhotoEscapeGeneratingFunctions';

const { height, width } = Dimensions.get('window');

const RoomScreen = () => {
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const { pin, name, selfieURL } = route.params || {}; // Get the pin, name, and selfieURL from route params

  // Initialize Firebase functions
  const functions = getFunctions(firebase.app(), 'us-central1');

  // Use a ref to persist the alreadyGenerated flag
  const alreadyGeneratedRef = useRef(false);

  useEffect(() => {
    if (!pin) {
      Alert.alert('Error', 'No game PIN provided.');
      return;
    }

    const roomRef = firebase.database().ref(`room/${pin}`);

    // Removed fetchData as it's not utilized

    // Listen for changes in participants
    const participantListener = roomRef.child('participants').on('value', (snapshot) => {
      if (snapshot.exists()) {
        const participantsData = snapshot.val();
        const participantsList = Object.values(participantsData);
        setParticipants(participantsList);

        if (participantsList.length === 1 && !alreadyGeneratedRef.current) {
          alreadyGeneratedRef.current = true;
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

          // Call the swapFaces function when the second player joins
          const swapFaces = httpsCallable(functions, 'swapFaces');
          const selfieURLs = participantsList.map(participant => participant.selfieURL);

          swapFaces({
            faceImageUrl1: selfieURLs[0],
            faceImageUrl2: selfieURLs[1],
            pin: pin // Pass the pin as an argument
          }).then((result) => {
              console.log('Faces swapped successfully.');
          }).catch(error => {
            console.error('Error calling swapFaces:', error);
            Alert.alert('Error', 'Failed to swap faces.');
          });

          setTimeout(() => {
            // Navigate to the Limerick screen once two participants are ready
            navigation.navigate('PhotoEscape', {
              screen: 'PhotoEscapeLimerick',
              params: { pin, name, selfieURL },
            });
          }, 2000); // Add a 2-second delay before navigating
        }
      } else {
        setParticipants([]);
      }
    });

    return () => {
      roomRef.child('participants').off('value', participantListener);
    };
  }, [pin, navigation, functions, name, selfieURL]);

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