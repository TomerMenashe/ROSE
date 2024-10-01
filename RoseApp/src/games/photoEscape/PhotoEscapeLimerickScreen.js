// /src/screens/PhotoEscapeLimerickScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';
import usePreventBack from "../../components/usePreventBack";


const PhotoEscapeLimerickScreen = () => {
    usePreventBack(); // **Added Hook Call**
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, name, selfieURL, item, limerick } = route.params || {}; // Destructure item and limerick from route.params
    const [isLoading, setIsLoading] = useState(false); // Initialize as false since data is already fetched

    useEffect(() => {
        // Check if all necessary parameters are present
        if (!pin || !name || !selfieURL || !item || !limerick) {
            console.error('[PhotoEscapeLimerickScreen] Missing game information:', { pin, name, selfieURL, item, limerick });
            Alert.alert('Error', 'Missing game information.');
            navigation.goBack();
            return;
        }

        // No need to fetch data; data is already passed via navigation
        setIsLoading(false); // Ensure loading state is false

        // Setup Firebase listener for winner updates
        const roomRef = firebase.database().ref(`room/${pin}`);

        const winnerListener = roomRef.child('winner').on('value', (snapshot) => {
            if (snapshot.exists()) {
                const winnerData = snapshot.val();
                const winnerName = winnerData.name;
                const winnerImage = winnerData.image;

                if (winnerName === name) {
                    navigation.navigate('CongratulationsScreen', {
                        item,
                        winnerImage,
                        name,
                        selfieURL,
                        pin,
                    });
                } else {
                    navigation.navigate('LoserScreen', {
                        item,
                        winnerImage, // Passing the winner's image to LoserScreen
                        name,
                        selfieURL,
                        pin,
                    });
                }
            }
        });

        // Clean up listener when component is unmounted
        return () => {
            roomRef.child('winner').off('value', winnerListener);
        };
    }, [pin, name, selfieURL, item, limerick, navigation]);

    const handleStart = () => {
        navigation.navigate('PhotoEscapeCamera', { pin, name, selfieURL, limerick, item });
    };

    // Since data is already fetched, no need to display loading indicator
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Photo Escape</Text>
            <Text style={styles.limerickText}>{limerick}</Text>
            <TouchableOpacity style={styles.button} onPress={handleStart}>
                <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    // Removed loadingContainer and loadingText styles as they are no longer needed
    container: {
        flex: 1,
        backgroundColor: '#101010',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center', // Added to center content horizontally
    },
    title: {
        fontSize: 32,
        color: '#FFCC00',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    limerickText: {
        fontSize: 24,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#FF4B4B',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 50,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PhotoEscapeLimerickScreen;
