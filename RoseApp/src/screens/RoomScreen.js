import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, ActivityIndicator } from 'react-native';
import { firebase } from '../firebase/firebase';
import { useRoute, useNavigation } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');

const RoomScreen = () => {
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const { pin } = route.params || {};  // Safely access pin

  useEffect(() => {
    console.log("PIN received in RoomScreen:", pin);  // LOG RECEIVED PIN IN ROOMSCREEN

    if (!pin) {
      console.error("No pin found in route params!");  // LOG ERROR IF PIN IS MISSING
      return;
    }

    const roomRef = firebase.database().ref(`room/${pin}/participants`);

    const participantListener = roomRef.on('value', (snapshot) => {
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

    return () => roomRef.off('value', participantListener);
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
