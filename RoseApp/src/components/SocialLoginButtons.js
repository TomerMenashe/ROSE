import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const SocialLoginButtons = () => {
  return (
    <View style={styles.container}>
      <Button title="Sign in with Google" onPress={() => {}} />
      <Button title="Sign in with Facebook" onPress={() => {}} />
      <Button title="Sign in with Apple" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    marginHorizontal: 10,
  },
});

export default SocialLoginButtons;
