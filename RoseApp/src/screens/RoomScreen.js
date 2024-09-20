import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, ActivityIndicator } from 'react-native';
import { firebase } from '../firebase/firebase';  // Import Firebase
import { useRoute, useNavigation } from '@react-navigation/native';  // Get the route params and navigation

const { height, width } = Dimensions.get('window');  // Get screen dimensions

const RoomScreen = () => {
    const [participants, setParticipants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const route = useRoute(); // Get the 'pin' from the route params
    const navigation = useNavigation(); // Navigation to next screen
    const { pin } = route.params;

    useEffect(() => {
        // Fetch the room's participants from Firebase
        const roomRef = firebase.database().ref(`room/${pin}/participants`);
        
        const participantListener = roomRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const participantsData = snapshot.val();
                const participantsList = Object.values(participantsData);
                setParticipants(participantsList);
                
                // If both users are connected, navigate to the next page (GameStart or other)
                if (participantsList.length === 2) {
                    setIsLoading(false);
                    setTimeout(() => {
                        navigation.navigate('GameStart', { pin });
                    }, 2000);  // Navigate to next page after 2 seconds
                }
            }
        });

        // Clean up the listener when component unmounts
        return () => roomRef.off('value', participantListener);
    }, [pin, navigation]);

    return (
        <ImageBackground
            source={require('../../assets/joinGame.jpeg')}  // Background image
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Text style={styles.title}>Room {pin}</Text>

                {isLoading ? (
                    <>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.loadingText}>Waiting for players to connect...</Text>
                    </>
                ) : (
                    <Text style={styles.loadingText}>Both players connected! Starting game...</Text>
                )}

                {/* Display the names of the participants */}
                {participants.length > 0 ? (
                    participants.map((participant, index) => (
                        <Text key={index} style={styles.participantText}>
                            {participant.name}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.participantText}>No participants yet.</Text>
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 40,
    },
    participantText: {
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 20,
        color: '#FFFFFF',
        marginTop: 20,
    },
});

export default RoomScreen;
