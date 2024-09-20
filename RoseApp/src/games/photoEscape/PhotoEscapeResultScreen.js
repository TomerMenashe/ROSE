// /src/games/photoEscape/PhotoEscapeResultScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const PhotoEscapeResultScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Over!</Text>
      <Button
        title="Back to Home"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default PhotoEscapeResultScreen;
