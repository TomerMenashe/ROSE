import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';  // Import navigation and route hooks
import { firebase } from '../../firebase/firebase';  // Ensure your Firebase is initialized

const { height, width } = Dimensions.get('window');  // Get screen dimensions

const PhotoEscapeReadyScreen = () => {
  const [isReady, setIsReady] = useState(false);  // Track whether this player is ready
  const [participants, setParticipants] = useState({});  // Store participants' data
  const [allReady, setAllReady] = useState(false);  // Track if all players are ready
  const [navigated, setNavigated] = useState(false);  // Ensure we navigate only once

  const navigation = useNavigation();  // Hook to navigate between screens
  const route = useRoute();  // Get the current route params (for the game pin)
  const { pin } = route.params || {};  // Safely get the game pin from route parameters

  const currentUser = firebase.auth().currentUser;

  if (!currentUser) {
    console.error('No authenticated user.');
    return null;
  }

  console.log(`Current User UID: ${currentUser.uid}`);  // Log the current user's UID

  // Function to handle when the player presses "Ready"
  const handleStartGame = () => {
    const roomRef = firebase.database().ref(`room/${pin}/participants/${currentUser.uid}`);

    // Check if the user is already in the database
    roomRef.once('value', (snapshot) => {
      if (!snapshot.exists()) {
        // Safeguard: Check if a player with the same name already exists
        const participantsRef = firebase.database().ref(`room/${pin}/participants`);
        participantsRef.once('value', (participantsSnapshot) => {
          const participantsData = participantsSnapshot.val();
          const existingPlayer = Object.values(participantsData).find(participant => participant.name === (currentUser.displayName || `Player ${currentUser.uid}`));
          
          if (existingPlayer) {
            console.log('Player with the same name already exists. Updating existing entry...');
            const existingPlayerKey = Object.keys(participantsData).find(key => participantsData[key].name === existingPlayer.name);
            firebase.database().ref(`room/${pin}/participants/${existingPlayerKey}`).update({
              ready: true
            });
          } else {
            // If no existing player with the same name, add the user
            roomRef.set({
              name: currentUser.displayName || `Player ${currentUser.uid}`,  // Ensure name is set
              ready: true  // Set the ready status to true
            });
          }
        });
      } else {
        // If user already exists, just update the ready state
        roomRef.update({
          ready: true  // Update the ready status to true
        });
      }
    }).then(() => {
      setIsReady(true);  // Mark this player as ready in the app's state
      console.log(`Player ${currentUser.uid} is now ready.`);
    }).catch((error) => {
      console.error('Error updating Firebase:', error);
    });
  };

  // Listen for changes in the participants' data in Firebase
  useEffect(() => {
    const roomRef = firebase.database().ref(`room/${pin}/participants`);

    // Set up a listener to check the readiness of all participants
    const participantListener = roomRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        const participantsData = snapshot.val();
        console.log('Participants Data from Firebase:', participantsData);
        setParticipants(participantsData);

        // Check if all participants are ready
        const allParticipantsReady = Object.values(participantsData).every(participant => participant.ready === true);
        setAllReady(allParticipantsReady);

        // Navigate to the game screen if all participants are ready
        if (allParticipantsReady && !navigated) {
          console.log('All players are ready. Navigating to the game screen.');
          setNavigated(true);  // Ensure we only navigate once
          navigation.navigate('PhotoEscapeGame', { pin });  // Pass the pin when navigating
        } else if (!allParticipantsReady) {
          console.log('Not all players are ready.');
        }
      }
    });

    // Cleanup listener on component unmount
    return () => roomRef.off('value', participantListener);
  }, [pin, navigation, navigated]);

  return (
    <ImageBackground
      source={require('./assets/background.jpeg')}  // PhotoEscape ready background image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>PhotoEscape</Text>

        {/* Ready Button */}
        <Pressable style={styles.button} onPress={handleStartGame}>
          <Text style={styles.buttonText}>{isReady ? 'Waiting for others...' : 'Ready'}</Text>
        </Pressable>

        {/* Display a message when waiting for other players */}
        {!allReady && isReady && (
          <Text style={styles.waitingText}>Waiting for other players to be ready...</Text>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 40,  // Adjust margin
  },
  button: {
    backgroundColor: '#FF4B4B',  // Red color for the Ready button
    paddingVertical: 20,
    borderRadius: 20,
    width: width * 0.8,
    height: height * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
  },
});

export default PhotoEscapeReadyScreen;
