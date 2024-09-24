// /src/games/photoEscape/PhotoEscapeResultScreen.js

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const PhotoEscapeResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name, selfieURL } = route.params || {};

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Game Over!</Text>
        <Button
            title="Back to Home"
            onPress={() => navigation.navigate('Home', { name, imageUrl: selfieURL })}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  // Styles remain the same as before
});

export default PhotoEscapeResultScreen;
