// /src/screens/NewGameProcessing.js

import React, { useEffect } from 'react';
import { Alert, ActivityIndicator, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../firebase/firebase';

const NewGameProcessing = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pin } = route.params || {};

    useEffect(() => {
        const processExit = async () => {
            if (!pin) {
                Alert.alert('Error', 'Missing pin information.');
                navigation.navigate('Splash');
                return;
            }

            try {
                // 1. Turn off the listener of room/${pin}/currentGameIndex
                const currentGameIndexRef = firebase.database().ref(`room/${pin}/currentGameIndex`);
                currentGameIndexRef.off();
                console.log(`Listener for room/${pin}/currentGameIndex turned off.`);

                // 2. Check if exitedPlayers >= 2, then remove room/${pin}
                const exitedPlayersRef = firebase.database().ref(`room/${pin}/exitedPlayers`);
                const roomRef = firebase.database().ref(`room/${pin}`);

                const snapshot = await exitedPlayersRef.once('value');
                const exitedPlayers = snapshot.val() || 0;
                console.log(`Exited players: ${exitedPlayers}`);

                if (exitedPlayers >= 2) {
                    await roomRef.remove();
                    console.log(`Room ${pin} removed because exitedPlayers >= 2`);
                } else {
                    console.log(`Room ${pin} not removed. exitedPlayers is ${exitedPlayers}`);
                }
            } catch (error) {
                console.error(`Error processing room ${pin}:`, error);
                Alert.alert('Error', 'An error occurred while processing your request.');
            }

            // 3. Direct the user to 'Splash' with no params
            navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
            });
        };

        processExit();
    }, [navigation, pin]);

    // Optional: Display a loading indicator while processing
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#FF4B4B" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default NewGameProcessing;
