import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');

    // Validate if fields are filled
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    // Make a real API request to your Node.js backend
    fetch('http://localhost:5001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          Alert.alert('Success', 'You have logged in successfully');
          // Handle successful login (store token, redirect, etc.)
        } else {
          setError('Invalid username or password.');
        }
      })
      .catch(err => {
        setError('An error occurred. Please try again.');
        console.error(err);
      });
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#808080"
        value={username}
        onChangeText={setUsername}
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
