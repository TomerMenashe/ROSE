import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, ImageBackground, Dimensions } from 'react-native';
import { firebase } from '../firebase/firebase';
import { useNavigation } from '@react-navigation/native';  // Import navigation hook

const { height, width } = Dimensions.get('window');  // Get screen dimensions

const JoinGameScreen = () => {
  const [gamePin, setGamePin] = useState('');
  const [error, setError] = useState('');  // State to show error message if PIN is invalid
  const navigation = useNavigation();      // Hook to navigate between screens
  const currentUser = firebase.auth().currentUser;  // Get the current authenticated user

  const handleJoinGame = () => {
    if (!gamePin) {
      setError('Please enter a valid PIN.');
      return;
    }

    // Check if the entered PIN exists in Firebase
    firebase.database().ref(`room/${gamePin}`).once('value', snapshot => {
      if (snapshot.exists()) {
        // If the room exists, add the current user to the participants list
        const participantsRef = firebase.database().ref(`room/${gamePin}/participants`);
        const newParticipantKey = participantsRef.push().key;

        participantsRef.child(newParticipantKey).set({
          name: currentUser.displayName  // Use the authenticated user's display name
        }).then(() => {
          // Once added, navigate the player to the room
          navigation.navigate('Room', { pin: gamePin });
        });
      } else {
        setError('Invalid PIN. Please try again.');
      }
    });
  };

  return (
      <ImageBackground
          source={require('../../assets/joinGame.jpeg')}  // Join game background image
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Rose</Text>

          {/* Game PIN Input */}
          <TextInput
              style={styles.input}
              placeholder="Game PIN"
              placeholderTextColor="#808080"
              value={gamePin}
              keyboardType="numeric"
              inputMode="numeric"
              onChangeText={setGamePin}
          />

          {/* Error Message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Join Game Button */}
          <Pressable style={styles.button} onPress={handleJoinGame}>
            <Text style={styles.buttonText}>Join Game</Text>
          </Pressable>
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
  input: {
    height: 50,
    borderColor: '#FF4B4B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    width: '80%',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF4B4B',
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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default JoinGameScreen;
