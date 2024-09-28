// PhotoEscapeLimerickScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';
import { fetchLimerick, fetchItem } from './PhotoEscapeGeneratingFunctions';

const PhotoEscapeLimerickScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, name, selfieURL } = route.params || {};
    const [limerick, setLimerick] = useState('');
    const [item, setItem] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!pin || !name || !selfieURL) {
            console.error('[PhotoEscapeLimerickScreen] Missing game information:', { pin, name, selfieURL });
            Alert.alert('Error', 'Missing game information.');
            navigation.goBack();
            return;
        }

        const fetchData = async () => {
            try {
                const [fetchedItem, fetchedLimerick] = await Promise.all([
                    fetchItem(pin),
                    fetchLimerick(pin),
                ]);

                if (fetchedItem && fetchedLimerick) {
                    setItem(fetchedItem);
                    setLimerick(fetchedLimerick);
                    setIsLoading(false);
                } else {
                    throw new Error('Failed to fetch item or limerick');
                }
            } catch (error) {
                console.error('[PhotoEscapeLimerickScreen] Error fetching data:', error);
                Alert.alert('Error', 'An error occurred while fetching limerick and item.');
                navigation.goBack();
            }
        };

        fetchData();

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
            } else {
            }
        });

        // Clean up listener when component is unmounted
        return () => {
            roomRef.child('winner').off('value', winnerListener);
        };
    }, [pin, name, selfieURL, navigation]);

    const handleStart = () => {
        navigation.navigate('PhotoEscapeCamera', { pin, name, selfieURL, limerick, item });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4B4B" />
                <Text style={styles.loadingText}>Loading limerick...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Limerick</Text>
            <Text style={styles.limerickText}>{limerick}</Text>
            <TouchableOpacity style={styles.button} onPress={handleStart}>
                <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#101010',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 10,
        fontSize: 16,
    },
    container: {
        flex: 1,
        backgroundColor: '#101010',
        padding: 20,
        justifyContent: 'center',
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