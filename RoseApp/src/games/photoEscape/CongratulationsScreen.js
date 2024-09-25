// /src/screens/CongratulationsScreen.js

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const CongratulationsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { itemName, winnerImage, name, selfieURL } = route.params;

    const moveToNextGame = () => {
        navigation.navigate('FaceSwap', { name, selfieURL });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.congratsText}>Winner of the round is... {name}!</Text>
            <Text style={styles.text}>You successfully found the {itemName}!</Text>

            {winnerImage && <Image source={{ uri: winnerImage }} style={styles.winnerImage} />}

            <Pressable style={styles.button} onPress={moveToNextGame}>
                <Text style={styles.buttonText}>Next Game</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#101010',
    },
    congratsText: {
        fontSize: 36,
        color: '#FFCC00',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    text: {
        fontSize: 24,
        color: '#FFFFFF',
        marginVertical: 20,
        textAlign: 'center',
    },
    winnerImage: {
        width: 250,
        height: 300,
        borderRadius: 10,
        marginVertical: 20,
        borderWidth: 2,
        borderColor: '#FFCC00',
    },
    button: {
        backgroundColor: '#FF4B4B',
        padding: 10,
        borderRadius: 10,
        width: 200,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CongratulationsScreen;
