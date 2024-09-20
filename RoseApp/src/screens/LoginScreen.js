import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ImageBackground, Pressable, Alert, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

// Import Firebase
import { firebase } from '../firebase/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';  // Import necessary Firebase functions

const { height, width } = Dimensions.get('window');  // Get the screen height and width

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');  // State for email input
  const [password, setPassword] = useState('');  // State for password input
  const [error, setError] = useState('');  // State for error messages

  // Initialize Firebase Functions
  const functions = getFunctions(firebase.app(), 'us-central1');  // Replace 'YOUR_REGION' with your Firebase Functions region, e.g., 'us-central1'

  // Function to handle user login
  const handleLogin = async () => {
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    // Attempt to sign in with Firebase Authentication
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      // On successful login, navigate to Home screen
      navigation.replace('Home', { email });
    } catch (error) {
      // Set error message if sign-in fails
      setError(error.message);
    }
  };



  return (
      <ImageBackground
          source={require('../../assets/background.jpeg')}  // Background image
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.heading}>Log In</Text>

          <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#808080"
              value={email}
              onChangeText={setEmail}
              inputMode="email"          // Changed from keyboardType
              autoCapitalize="none"      // Prevent auto-capitalization
          />

          <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#808080"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log in</Text>
          </Pressable>

          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUp')}>
              Sign up
            </Text>
          </Text>
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
    borderColor: '#FF4B4B',
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
  loginButton: {
    width: '100%',
    backgroundColor: '#FF4B4B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButton: {
    width: '100%',
    backgroundColor: '#4B94FF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  signupLink: {
    color: '#FF4B4B',
    fontWeight: 'bold',
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    width: '100%',
  },
  responseText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
});

export default LoginScreen;
