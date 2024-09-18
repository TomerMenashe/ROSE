import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ImageBackground, Pressable } from 'react-native';
// Import Firebase
import { firebase } from '../firebase/firebase';  // Adjust the path as needed

const SignUpScreen = ({ navigation }) => {
  const [firstName, setFirstName]         = useState('');
  const [lastName, setLastName]           = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                 = useState('');

  // Make handleSignUp an async function to use 'await'
  const handleSignUp = async () => {
    setError('');

    if (!firstName || !lastName || !email || !password || password !== confirmPassword) {
      setError('Please fill all fields and ensure passwords match.');
      return;
    }

    // Attempt to sign up with Firebase Authentication
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      // Optionally, update the user's profile with first and last name
      await firebase.auth().currentUser.updateProfile({
        displayName: `${firstName} ${lastName}`,
      });
      // On successful sign-up, navigate to Home screen or Login screen
      navigation.replace('Home');
    } catch (error) {
      // Set error message if sign-up fails
      setError(error.message);
    }
  };

  return (
      <ImageBackground
          source={require('../../assets/background.jpeg')}  // Corrected path to the background image
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.heading}>Sign Up</Text>
          <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#808080"
              value={firstName}
              onChangeText={setFirstName}
          />
          <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#808080"
              value={lastName}
              onChangeText={setLastName}
          />
          <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#808080"
              value={email}
              onChangeText={setEmail}
              inputMode="email"                // Changed from keyboardType
              // keyboardType="email-address"   // Optional: Remove if not needed
              autoCapitalize="none"            // Prevent auto-capitalization
          />
          <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#808080"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
          />
          <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#808080"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </Pressable>
          </View>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              Log in
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
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#FF4B4B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#2C2C3E',
    color: '#FFFFFF',
  },
  buttonContainer: {
    backgroundColor: '#FF4B4B',
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  link: {
    color: '#FF4B4B',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default SignUpScreen;
