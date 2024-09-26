// /src/screens/LoadingScreen.js

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { firebase } from '../../firebase/firebase'; // Adjust the path as necessary
import { useNavigation, useRoute } from '@react-navigation/native';

const LoadingScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, name, selfieURL } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Firebase references
    const roomRef = useRef(null);
    const gameRef = useRef(null);

    useEffect(() => {
        if (!pin || !name) {
            Alert.alert('Error', 'Missing game information.');
            navigation.goBack();
            return;
        }

        roomRef.current = firebase.database().ref(`room/${pin}`);
        gameRef.current = roomRef.current.child('memoryGame');

        const initializeAndPrefetch = async () => {
            try {
                const snapshot = await gameRef.current.once('value');
                if (!snapshot.exists()) {
                    await setupGame();
                }

                // Fetch the game state again after setup
                const updatedSnapshot = await gameRef.current.once('value');
                const gameState = updatedSnapshot.val();

                if (!gameState || !gameState.cards) {
                    throw new Error('Game state is invalid.');
                }

                const imageUrls = gameState.cards.map(card => card.imageUrl);

                // Prefetch all images
                await prefetchImages(imageUrls);

                setLoading(false);
                navigation.replace('FaceSwap', { pin, name, selfieURL });
            } catch (initError) {
                console.error('Error during initialization and prefetching:', initError);
                setError('Failed to load game. Please try again.');
                setLoading(false);
            }
        };

        initializeAndPrefetch();
    }, [pin, name, navigation, selfieURL]);

    const setupGame = async () => {
        try {
            // Fetch the faceSwaps data from Firebase
            const faceSwapsSnapshot = await roomRef.current.child('faceSwaps').once('value');

            if (!faceSwapsSnapshot.exists()) {
                Alert.alert('Error', 'No face swaps available.');
                return;
            }

            const faceSwapsData = faceSwapsSnapshot.val();
            const faceSwapsKeys = Object.keys(faceSwapsData).slice(0, 3); // Get the first three keys

            let cardValues = [];

            // Correctly access the URLs as arrays
            faceSwapsKeys.forEach((key) => {
                const swapEntry = faceSwapsData[key];

                if (
                    swapEntry &&
                    swapEntry.url1 &&
                    Array.isArray(swapEntry.url1) &&
                    swapEntry.url1[0] &&
                    swapEntry.url2 &&
                    Array.isArray(swapEntry.url2) &&
                    swapEntry.url2[0]
                ) {
                    cardValues.push({ imageUrl: swapEntry.url1[0], pairId: key });
                    cardValues.push({ imageUrl: swapEntry.url2[0], pairId: key });
                } else {
                    console.warn(`Invalid URLs for faceSwap key: ${key}`);
                }
            });

            if (cardValues.length < 6) {
                Alert.alert('Error', 'Not enough valid face swaps to start the game.');
                return;
            }

            shuffleArray(cardValues);

            const newCards = cardValues.map((value, index) => ({
                id: index,
                imageUrl: value.imageUrl,
                pairId: value.pairId,
                isFlipped: false,
                isMatched: false,
            }));

            const initialGameState = {
                cards: newCards,
                currentPlayer: name,
                playerScores: { [name]: 0 },
                gameOver: false,
            };

            await gameRef.current.set(initialGameState);
        } catch (error) {
            console.error('Error setting up game:', error);
            Alert.alert('Error', 'Failed to set up game.');
        }
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    const prefetchImages = async (urls) => {
        try {
            const prefetchPromises = urls.map(url => Image.prefetch(url));
            const results = await Promise.all(prefetchPromises);

            // Check if all images were prefetched successfully
            const allPrefetched = results.every(result => result === true);
            if (!allPrefetched) {
                throw new Error('One or more images failed to load.');
            }
        } catch (prefetchError) {
            console.error('Error prefetching images:', prefetchError);
            throw prefetchError;
        }
    };

    return (
        <View style={styles.container}>
            {loading && (
                <>
                    <ActivityIndicator size="large" color="#FF4B4B" />
                    <Text style={styles.loadingText}>Loading game...</Text>
                </>
            )}
            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
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
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: '#FFCC00',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default LoadingScreen;
