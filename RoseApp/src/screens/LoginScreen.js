import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LoginForm from '../components/LoginForm';
import SocialLoginButtons from '../components/SocialLoginButtons';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login here</Text>
      <Text style={styles.subheading}>Welcome back you’ve been missed!</Text>
      <LoginForm />
      <Text style={styles.forgotPassword}>Forgot your password?</Text>
      <SocialLoginButtons />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F41BB',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 20,
  },
  forgotPassword: {
    textAlign: 'right',
    marginTop: 10,
    color: '#1F41BB',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
