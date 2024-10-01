// /src/screens/LoserScreen.js

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {fetchItem} from "./PhotoEscapeGeneratingFunctions";
import CustomButton from "../../components/CustomButton";
import usePreventBack from "../../components/usePreventBack";

const LoserScreen = () => {
    usePreventBack(); // **Added Hook Call**
    const navigation = useNavigation();
    const route = useRoute();
    const { item, name, selfieURL, pin, winnerImage } = route.params;

    const moveToNextGame = () => {
        navigation.navigate('GameController', { pin, name, selfieURL });
    };


    return (
        <View style={styles.container}>
            <Text style={styles.loserText}>Sorry {name} darling😞!</Text>
            <Text style={styles.text}>
                You didn't find the item before your wonderful partner
            </Text>

            {winnerImage ? (
                <Image source={{ uri: winnerImage }} style={styles.winnerImage} />
            ) : (
                <ActivityIndicator size="large" color="#FFCC00" />
            )}

            <CustomButton style={styles.button} onPress={moveToNextGame}>
                <Text style={styles.buttonText}>Next Game</Text>
            </CustomButton>
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
    loserText: {
        fontSize: 36,
        color: '#FFCC00',
        fontWeight: 'bold',
        marginBottom: 20,
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

export default LoserScreen;