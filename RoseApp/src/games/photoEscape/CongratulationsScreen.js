// /src/screens/CongratulationsScreen.js

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {generatePhotoEscapeData} from "./PhotoEscapeGeneratingFunctions";
import {firebase} from "../../firebase/firebase";

const CongratulationsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { item, winnerImage, name, selfieURL, pin } = route.params;
    const roomRef = firebase.database().ref(`room/${pin}`);


    const moveToNextGame = async () => {
        generatePhotoEscapeData(pin);
        roomRef.child('winner').remove();
        navigation.navigate('GameController', {pin, name, selfieURL});
    };

    return (
        <View style={styles.container}>
            <Text style={styles.congratsText}>Congratulations {name}!</Text>
            <Text style={styles.text}>You successfully found the {item}!</Text>

            {winnerImage ? (
                <Image source={{ uri: winnerImage }} style={styles.winnerImage} />
            ) : (
                <ActivityIndicator size="large" color="#FFCC00" />
            )}

            <Pressable style={styles.button} onPress={moveToNextGame}>
                <Text style={styles.buttonText}>Next Game</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CongratulationsScreen;
