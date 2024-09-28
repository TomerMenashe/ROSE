// /src/screens/LoserScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchItem } from './PhotoEscapeGeneratingFunctions';

const LoserScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [item, setItem] = useState(""); // Using state to handle item
    const { name, selfieURL, pin, winnerImage } = route.params; // Removed item from direct destructuring

    // Effect to handle updating the item parameter when screen is focused
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setItem(route.params?.item || ""); // Update item state when the screen gains focus
        });
        return unsubscribe;
    }, [navigation, route.params]);

    const moveToNextGame = () => {
        navigation.navigate('LoadingScreen', { pin, name, selfieURL });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.loserText}>Sorry {name} darling 😞 !</Text>
            <Text style={styles.text}>
                You didn't find the {fetchItem(pin)} before your wonderful partner.
            </Text>

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
