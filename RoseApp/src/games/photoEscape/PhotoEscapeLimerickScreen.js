// /src/screens/PhotoEscapeLimerickScreen.js

import React, { useState, useEffect } from "react";
import {
    Alert,
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    ImageBackground,
    Pressable,
    Image,
} from "react-native";
import { firebase } from "../../firebase/firebase";
import { useNavigation, useRoute } from '@react-navigation/native';

const PhotoEscapeLimerickScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, gameNumber = 1, name, selfieURL } = route.params || {};
    const [limerickResponse, setLimerickResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [itemName, setItemName] = useState('');
    const [otherPlayer, setOtherPlayer] = useState(null);

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

        const fetchOtherPlayerData = async () => {
            try {
                const participantsSnapshot = await roomRef.child('participants').once('value');
                if (participantsSnapshot.exists()) {
                    const participantsData = participantsSnapshot.val();
                    const otherPlayers = Object.entries(participantsData).filter(
                        ([playerName]) => playerName !== name
                    );

                    if (otherPlayers.length > 0) {
                        const [otherPlayerName, otherPlayerData] = otherPlayers[0];
                        setOtherPlayer({
                            name: otherPlayerName,
                            selfieURL: otherPlayerData.selfieURL,
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching other player data:', error);
            }
        };

        fetchItemAndLimerick();
        fetchOtherPlayerData();

        const winnerListener = roomRef.child('winner').on('value', (snapshot) => {
            if (snapshot.exists()) {
                const winnerData = snapshot.val();
                const winnerName = winnerData.name;
                const winnerImage = winnerData.image;

                if (winnerName === name) {
                    navigation.navigate('CongratulationsScreen', {
                        itemName,
                        winnerImage: winnerImage,
                        name,
                        selfieURL,
                    });
                } else {
                    navigation.navigate('LoserScreen', {
                        itemName,
                        winnerImage: winnerImage,
                        name,
                        selfieURL,
                    });
                }
            }
        });

        return () => roomRef.child('winner').off('value', winnerListener);
    }, [pin, navigation, name, selfieURL, itemName]);

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
                {/* User Circles */}
                {otherPlayer && (
                    <View style={styles.userCirclesContainer}>
                        {/* Current User */}
                        <View style={styles.userContainer}>
                            <Image source={{ uri: selfieURL }} style={styles.userImage} />
                            <Text style={styles.userName}>{name}</Text>
                        </View>
                        {/* Other Player */}
                        <View style={styles.userContainer}>
                            <Image source={{ uri: otherPlayer.selfieURL }} style={styles.userImage} />
                            <Text style={styles.userName}>{otherPlayer.name}</Text>
                        </View>
                    </View>
                )}

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
                    <Pressable style={styles.button} onPress={startSearch} disabled={loading}>
                        <Text style={styles.buttonText}>Start Search</Text>
                    </Pressable>
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
    userCirclesContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    userContainer: {
        alignItems: 'center',
        marginLeft: 10,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 12,
        marginTop: 5,
    },
});


export default PhotoEscapeLimerickScreen;
