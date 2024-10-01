import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ImageBackground, Pressable, Alert, Dimensions } from 'react-native';
import CustomButton from "../components/CustomButton";
import usePreventBack from "../components/usePreventBack";

const { height, width } = Dimensions.get('window');  // Get the screen height and width

const WelcomeScreen = ({ navigation }) => {
  usePreventBack(); // **Added Hook Call**
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

          <CustomButton style={styles.proceedButton} onPress={handleProceed}>
            <Text style={styles.proceedButtonText}>Continue</Text>
          </CustomButton>
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
    backgroundColor: '#FF0000', // Changed to bright red
    paddingVertical: height * 0.02, // 2% of screen height
    paddingHorizontal: width * 0.12, // 12% of screen width
    borderRadius: width * 0.03, // 3% of screen width
    marginTop: height * 0.05, // 5% of screen height
    shadowColor: '#FF0000', // Changed to bright red shadow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
    // Removed invalid CSS properties and kept React Native compatible styles
  },  
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
