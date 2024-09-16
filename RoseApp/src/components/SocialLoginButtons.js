import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const SocialLoginButtons = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.signInText}>Or Sign in with</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="facebook" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="google" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="apple" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  signInText: {
    color: '#FFFFFF', // White text
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  iconButton: {
    backgroundColor: '#FF4B4B', // Red button background
    padding: 10,
    borderRadius: 50,
  },
});

export default SocialLoginButtons;
