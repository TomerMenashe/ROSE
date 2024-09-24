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

  // Handle game joining
  const handleJoinGame = () => {
    if (!gamePin || gamePin.length < 4) {  // Assume 4-digit PIN for this example
      setError('Please enter a valid 4-digit PIN.');
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

  // Handle individual PIN box input
  const handlePinChange = (text) => {
    if (text.length <= 4) {  // Limit PIN to 4 digits
      setGamePin(text);
    }
  };

  return (
      <ImageBackground
          source={require('../../assets/joinGame.jpeg')}  // Join game background image
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Rose</Text>

          {/* PIN Input Boxes */}
          <View style={styles.pinContainer}>
            {Array(4).fill().map((_, index) => (
              <Pressable key={index} style={styles.pinBox} onPress={() => this.pinInput.focus()}>
                <Text style={styles.pinText}>{gamePin[index] || ''}</Text>
              </Pressable>
            ))}
            {/* Hidden TextInput to capture actual input */}
            <TextInput
              ref={ref => { this.pinInput = ref; }}  // Reference to focus when clicking boxes
              style={styles.hiddenInput}
              value={gamePin}
              keyboardType="numeric"
              maxLength={4}  // Limit to 4 digits
              onChangeText={handlePinChange}
              autoFocus={true}  // Focus automatically on this input
            />
          </View>

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
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  pinBox: {
    borderColor: '#FF4B4B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  pinText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
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
