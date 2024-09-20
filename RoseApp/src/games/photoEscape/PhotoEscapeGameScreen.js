// /src/games/photoEscape/PhotoEscapeGameScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const PhotoEscapeGameScreen = ({ navigation }) => {
  // Game logic goes here
  const finishGame = () => {
    navigation.navigate('PhotoEscapeResult');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Playing PhotoEscape!</Text>
      {/* Add your game components and logic here */}
      <Button title="Finish Game" onPress={finishGame} />
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

export default PhotoEscapeGameScreen;
