import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
// Import Firebase
import { firebase } from '../firebase/firebase';  // Adjust the path as needed

const LoginForm = () => {
  const [email, setEmail] = useState('');  // Changed 'username' to 'email'
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Make handleLogin an async function to use 'await'
  const handleLogin = async () => {
    setError('');

    // Validate if fields are filled
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    // Attempt to sign in with Firebase Authentication
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Success', 'You have logged in successfully');
      // Handle successful login (store token, redirect, etc.)
    } catch (error) {
      // Set error message if sign-in fails
      setError(error.message);
    }
  };

  return (
      <View style={styles.form}>
        <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#808080"
            value={email}
            onChangeText={setEmail}
            inputMode="email"                // Changed from keyboardType
            keyboardType="email-address"     // Optional: Remove if not needed
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
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.forgotContainer}>
          <Text style={styles.forgotPassword}>Forgot Password</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Log in" onPress={handleLogin} color="#FF4B4B" />
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  form: {
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
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPassword: {
    color: '#FF4B4B',
  },
  buttonContainer: {
    backgroundColor: '#FF4B4B',
    borderRadius: 10,
    overflow: 'hidden',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default LoginForm;
