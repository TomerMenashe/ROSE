// /src/screens/RoomScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, ActivityIndicator } from 'react-native';
import { firebase } from '../firebase/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useRoute, useNavigation } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');

const RoomScreen = () => {
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [item, setItem] = useState('');
  const [limerick, setLimerick] = useState('');
  const route = useRoute();
  const navigation = useNavigation();
  const { pin } = route.params || {};  // Safely access pin

  // Initialize Firebase functions
  const functions = getFunctions(firebase.app(), 'us-central1');

  useEffect(() => {
    console.log("PIN received in RoomScreen:", pin);  // LOG RECEIVED PIN IN ROOMSCREEN

    if (!pin) {
      console.error("No pin found in route params!");  // LOG ERROR IF PIN IS MISSING
      return;
    }

    const roomRef = firebase.database().ref(`room/${pin}`);

    // Fetch or generate item and limerick
    const fetchOrGenerateItemAndLimerick = async () => {
      try {
        const snapshot = await roomRef.child('item').once('value');
        if (snapshot.exists()) {
          // If item already exists, fetch both item and limerick from Firebase
          const fetchedItem = snapshot.val();
          const fetchedLimerick = (await roomRef.child('limerick').once('value')).val();
          setItem(fetchedItem);
          setLimerick(fetchedLimerick);
          console.log('Fetched item and limerick:', fetchedItem, fetchedLimerick);
        } else {
          // Generate item and limerick only if they do not exist
          const getItem = httpsCallable(functions, 'getRandomItem');
          const resultItem = await getItem();
          const generatedItem = resultItem.data;

          const getHamshir = httpsCallable(functions, 'getHamshir');
          const resultLimerick = await getHamshir({ item: generatedItem });
          const generatedLimerick = resultLimerick.data.response;

          // Upload item and limerick to Firebase
          await roomRef.update({
            item: generatedItem,
            limerick: generatedLimerick,
          });

          setItem(generatedItem);
          setLimerick(generatedLimerick);
          console.log('Generated and uploaded item and limerick:', generatedItem, generatedLimerick);
        }
      } catch (error) {
        console.error('Error fetching or generating item and limerick:', error);
      }
    };

    fetchOrGenerateItemAndLimerick();

    const participantListener = roomRef.child('participants').on('value', (snapshot) => {
      if (snapshot.exists()) {
        const participantsData = snapshot.val();
        const participantsList = Object.values(participantsData);
        setParticipants(participantsList);

        console.log("Participants List in RoomScreen:", participantsList);  // LOG PARTICIPANTS LIST

        if (participantsList.length === 2) {
          setIsLoading(false);
          setTimeout(() => {
            console.log("Navigating to PhotoEscape with PIN:", pin);  // LOG NAVIGATION TO PHOTOESCAPE
            navigation.navigate('PhotoEscape', { pin });
          }, 2000);  // Add a 2-second delay for transition effect
        }
      }
    });

    return () => {
      roomRef.child('participants').off('value', participantListener);
    };
  }, [pin, navigation]);

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

          {isLoading ? (
              <>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Waiting for players...</Text>
              </>
          ) : (
              <Text style={styles.loadingText}>Players connected! Starting game...</Text>
          )}

          {participants.length > 0 ? (
              participants.map((participant, index) => (
                  <Text key={index} style={styles.participantText}>{participant.name}</Text>
              ))
          ) : (
              <Text style={styles.participantText}>No participants yet.</Text>
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
    marginBottom: 40,
  },
  participantText: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 20,
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
