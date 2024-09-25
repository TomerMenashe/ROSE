import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ImageBackground, Pressable, Alert, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');  // Get the screen height and width

const WelcomeScreen = ({ navigation }) => {
  const [name, setName] = useState('');  // State for name input
  const [error, setError] = useState('');  // State for error messages

  // Function to handle user proceeding to the next screen
  const handleProceed = () => {
    setError('');

    // Basic validation for name input
    if (!name.trim()) {
      setError('Please enter your name to continue.');
      return;
    }

    // Check for a valid legal name (only letters and spaces allowed)
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setError('Please enter a valid name using only letters.');
      return;
    }

    // Navigate to SelfieScreen with the user's name
    navigation.replace('Selfie', { name }); // Changed 'SelfieScreen' to 'Selfie' to match the name in App.js
  };

  return (
      <ImageBackground
          source={require('../../assets/background.jpeg')}  // Background image
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.heading}>Lets get to know you!</Text>

          <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#808080"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"  // Capitalize the first letter of each word
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.proceedButton} onPress={handleProceed}>
            <Text style={styles.proceedButtonText}>Continue</Text>
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
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent background to make the input fields stand out
    borderRadius: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#FF0000',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#2C2C3E',
    color: '#FFFFFF',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  proceedButton: {
    width: '100%',
    backgroundColor: '#FF0000', 
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
    background: 'linear-gradient(145deg, #FF0000, #D50000)', // Rich red gradient
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0 4px 10px rgba(255, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4)', // Bold red glow and subtle shadow
    border: '2px solid #FF0000', // Bold red border for definition
  },  
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
