// /src/screens/PhotoEscapeLimerickScreen.js

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';
import usePreventBack from "../../components/usePreventBack";

const PhotoEscapeLimerickScreen = () => {
    usePreventBack(); // **Added Hook Call**
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, name, selfieURL, item, limerick } = route.params || {};
    const [isLoading, setIsLoading] = useState(false);

    // New state variables
    const [isReady, setIsReady] = useState(false); // Local ready state
    const [bothReady, setBothReady] = useState(false); // Both users ready
    const [waitingForPartner, setWaitingForPartner] = useState(false); // Waiting indicator
    const [fadeAnim] = useState(new Animated.Value(1)); // Animation value for instructions
    const [showInstructions, setShowInstructions] = useState(true); // Control visibility

    useEffect(() => {
        if (!pin || !name || !selfieURL || !item || !limerick) {
            console.error('[PhotoEscapeLimerickScreen] Missing game information:', {
                pin,
                name,
                selfieURL,
                item,
                limerick,
            });
            Alert.alert('Error', 'Missing game information.');
            navigation.goBack();
            return;
        }

        setIsLoading(false);

        const roomRef = firebase.database().ref(`room/${pin}`);

        // Listener for 'winner' updates (existing code)
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
                        winnerImage,
                        name,
                        selfieURL,
                        pin,
                    });
                }
            }
        });

        // New listener for 'ready' status
        const readyListener = roomRef.child('ready').on('value', (snapshot) => {
            const readyData = snapshot.val() || {};
            const usersReady = Object.values(readyData).filter(Boolean);

            if (usersReady.length >= 2) {
                // Both users are ready
                setBothReady(true);
                // Start the fade-out animation for instructions
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => {
                    setShowInstructions(false);
                });
            } else {
                setBothReady(false);
            }
        });

        // Clean up listeners when component is unmounted
        return () => {
            roomRef.child('winner').off('value', winnerListener);
            roomRef.child('ready').off('value', readyListener);
        };
    }, [pin, name, selfieURL, item, limerick, navigation, fadeAnim]);

    const handleReady = () => {
        setIsReady(true);
        setWaitingForPartner(true);
        const roomRef = firebase.database().ref(`room/${pin}`);
        roomRef.child('ready').update({ [name]: true });
    };

    const handleStart = () => {
        navigation.navigate('PhotoEscapeCamera', { pin, name, selfieURL, limerick, item });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Photo Escape</Text>

            {showInstructions ? (
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.instructionsText}>
                        Welcome to Photo Escape! The game where you race to capture a selfie with
                        the correct item based on the limerick provided. Press "Ready" when you're
                        set to start the game. May the fastest photographer win!
                    </Text>
                </Animated.View>
            ) : (
                // Render the limerick when instructions are gone
                <Animated.View style={{ opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                }) }}>
                    <Text style={styles.limerickText}>{limerick}</Text>
                </Animated.View>
            )}

            {isReady && !bothReady ? (
                // Waiting for partner
                <View style={styles.waitingContainer}>
                    <ActivityIndicator size="large" color="#FF4B4B" />
                    <Text style={styles.waitingText}>Waiting for your partner...</Text>
                </View>
            ) : (
                // Render the appropriate button
                <TouchableOpacity
                    style={styles.button}
                    onPress={showInstructions ? handleReady : handleStart}
                >
                    <Text style={styles.buttonText}>
                        {showInstructions ? 'Ready' : 'Start Game'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        color: '#FFCC00',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    instructionsText: {
        fontSize: 20,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 40,
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
        marginTop: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    waitingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    waitingText: {
        color: '#FF4B4B',
        fontSize: 18,
        marginLeft: 10,
    },
});

export default PhotoEscapeLimerickScreen;
