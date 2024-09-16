import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LoginForm from '../components/LoginForm';
import SocialLoginButtons from '../components/SocialLoginButtons';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Log In</Text>
      <LoginForm />
      <SocialLoginButtons />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1E1E2C', // Dark background color
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF', // White text
    marginBottom: 20,
  },
});

export default LoginScreen;
