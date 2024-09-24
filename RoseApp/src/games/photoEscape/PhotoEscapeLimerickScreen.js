// /src/screens/PhotoEscapeLimerickScreen.js

import React, { useState, useEffect } from "react";
import { Alert, Text, View, StyleSheet, ActivityIndicator, ImageBackground, TouchableOpacity } from "react-native";
import { firebase } from "../../firebase/firebase";
import { useNavigation, useRoute } from '@react-navigation/native';

const PhotoEscapeLimerickScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, gameNumber = 1, name, selfieURL } = route.params || {};
    const [limerickResponse, setLimerickResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [itemName, setItemName] = useState('');

    useEffect(() => {
        const roomRef = firebase.database().ref(`room/${pin}`);

        const fetchItemAndLimerick = async () => {
            setLoading(true);
            try {
                const itemSnapshot = await roomRef.child('item').once('value');
                const limerickSnapshot = await roomRef.child('limerick').once('value');

                if (itemSnapshot.exists() && limerickSnapshot.exists()) {
                    setItemName(itemSnapshot.val());
                    setLimerickResponse(limerickSnapshot.val());
                } else {
                    Alert.alert('Error', 'Failed to retrieve the item or limerick.');
                }
            } catch (error) {
                console.error('Error fetching item and limerick:', error);
                Alert.alert('Error', 'Failed to retrieve the item or limerick.');
            } finally {
                setLoading(false);
            }
        };

        fetchItemAndLimerick();

        const winnerListener = roomRef.child('winner').on('value', (snapshot) => {
            if (snapshot.exists()) {
                const winnerData = snapshot.val();
                navigation.navigate('CongratulationsScreen', { itemName, winnerImage: winnerData.image, name, selfieURL });
            }
        });

        return () => roomRef.child('winner').off('value', winnerListener);
    }, [pin, navigation]);

    const startSearch = () => {
        navigation.navigate('PhotoEscapeCamera', { pin, gameNumber, itemName, name, selfieURL });
    };

    return (
        <ImageBackground
            source={require('./assets/background.jpeg')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Text style={styles.header}>Find the Object</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#FFFFFF" />
                ) : (
                    <>
                        <Text style={styles.limerickText}>{limerickResponse}</Text>
                    </>
                )}

                <View style={styles.searchButtonContainer}>
                    <Text style={styles.hintText}>When ready, tap below to start searching!</Text>
                    <TouchableOpacity style={styles.button} onPress={startSearch} disabled={loading}>
                        <Text style={styles.buttonText}>Start Search</Text>
                    </TouchableOpacity>
                </View>
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
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    limerickText: {
        fontSize: 24,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
        fontStyle: 'italic',
        lineHeight: 34,
    },
    searchButtonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    hintText: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#FF4B4B',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PhotoEscapeLimerickScreen;
