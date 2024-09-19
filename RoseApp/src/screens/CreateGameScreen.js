import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, Dimensions } from 'react-native';
import { firebase } from '../firebase/firebase';
import { useNavigation } from '@react-navigation/native';  // Import navigation hook

const { height, width } = Dimensions.get('window');  // Get screen dimensions

const CreateGameScreen = () => {
  const [pin, setPin] = useState(generatePin());
  const navigation = useNavigation();      // Hook to navigate between screens
  const currentUser = firebase.auth().currentUser;  // Get the current authenticated user

  // Function to generate a 4-digit PIN
  function generatePin() {
    return Math.floor(1000 + Math.random() * 9000).toString();  // Generates a random 4-digit pin
  }

  useEffect(() => {
    const roomRef = firebase.database().ref(`room/${pin}`);

    // Set up the room in Firebase when the pin changes
    roomRef.set({
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      participants: {
        [currentUser.uid]: { name: currentUser.displayName }  // Add the creator's name
      }
    }).then(() => {
      console.log(`Room ${pin} created successfully.`);
    }).catch((error) => {
      console.error("Error creating room:", error);
    });

    // Listen for changes in the participants list
    roomRef.child('participants').on('value', (snapshot) => {
      const participantsData = snapshot.val();
      if (participantsData && Object.keys(participantsData).length > 0) {
        // If there's at least one participant, navigate to the room
        navigation.navigate('Room', { pin });
      }
    });

    // Cleanup the listener
    return () => roomRef.child('participants').off();
  }, [pin]);

  return (
      <ImageBackground
          source={require('../../assets/joinGame.jpeg')}  // Create game background image
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Rose</Text>

          {/* Display the generated PIN */}
          <Text style={styles.pinText}>Your Game PIN: {pin}</Text>

          {/* Regenerate PIN Button */}
          <Pressable style={styles.button} onPress={() => setPin(generatePin())}>
            <Text style={styles.buttonText}>Generate New PIN</Text>
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
    fontSize: 100,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  pinText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 20,  // Same padding as HomeScreen button
    borderRadius: 20,     // Same borderRadius as HomeScreen button
    width: width * 0.8,   // 80% of the screen width
    height: height * 0.08, // 8% of the screen height
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,     // Additional margin for spacing
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateGameScreen;
