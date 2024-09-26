// /src/screens/EndVideo.js

import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Image,
    TouchableOpacity,
    Alert,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { firebase } from './src/firebase/firebase'; // Adjusted the path to match FaceSwap
import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';

const EndVideo = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pin } = route.params || {}; // Ensure pin is destructured correctly

    const [imageUrls, setImageUrls] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [showButtons, setShowButtons] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [downloadAllPressed, setDownloadAllPressed] = useState(false);

    useEffect(() => {
        if (!pin) {
            Alert.alert('Error', 'Missing pin information.');
            navigation.goBack();
            return;
        }

        // Fetch image URLs from Firebase
        const fetchImageUrls = async () => {
            try {
                const roomRef = firebase.database().ref(`room/${pin}`);
                const snapshot = await roomRef.once('value');
                const data = snapshot.val();

                const urls = [];
                const traverse = (node) => {
                    if (!node) return;
                    if (typeof node === 'string' && node.startsWith('http')) {
                        urls.push(node);
                    } else if (typeof node === 'object') {
                        Object.values(node).forEach((child) => traverse(child));
                    }
                };

                traverse(data);

                if (urls.length > 0) {
                    setImageUrls(urls);
                } else {
                    console.warn('No image URLs found.');
                }
            } catch (error) {
                console.error('Error fetching image URLs:', error);
            }
        };

        fetchImageUrls();
    }, [pin, navigation]);

    useEffect(() => {
        if (imageUrls.length > 0 && isPlaying) {
            animateImage();
        }
    }, [currentImageIndex, imageUrls, isPlaying]);

    const animateImage = () => {
        fadeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000, // Fade in duration
                useNativeDriver: true,
            }),
            Animated.delay(2000), // Display duration
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1000, // Fade out duration
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (currentImageIndex < imageUrls.length - 1) {
                setCurrentImageIndex(currentImageIndex + 1);
            } else {
                setShowButtons(true);
                setIsPlaying(false);
            }
        });
    };

    const requestPermission = async () => {
        if (Platform.OS === 'android') {
            const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Cannot save images without permission.');
                return false;
            }
        }
        return true;
    };

    const downloadImage = async (url) => {
        try {
            const hasPermission = await requestPermission();
            if (!hasPermission) return;

            const fileName = url.split('/').pop().split('?')[0];
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
            const { uri } = await downloadResumable.downloadAsync();

            if (Platform.OS === 'ios') {
                await Sharing.shareAsync(uri);
            } else {
                await MediaLibrary.saveToLibraryAsync(uri);
                Alert.alert('Success', 'Image downloaded to your gallery!');
            }
        } catch (error) {
            console.error('Download Error:', error);
            Alert.alert('Error', 'Failed to download image.');
        }
    };

    const downloadAllImages = async () => {
        setDownloadAllPressed(true);
        for (const url of imageUrls) {
            await downloadImage(url);
        }
        setDownloadAllPressed(false);
    };

    const watchVideoAgain = () => {
        setCurrentImageIndex(0);
        setShowButtons(false);
        setIsPlaying(true);
    };

    return (
        <View style={styles.container}>
            {imageUrls.length > 0 && isPlaying && (
                <View style={styles.imageContainer}>
                    <Animated.Image
                        source={{ uri: imageUrls[currentImageIndex] }}
                        style={[styles.image, { opacity: fadeAnim }]}
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={() => downloadImage(imageUrls[currentImageIndex])}
                    >
                        <Text style={styles.buttonText}>Download</Text>
                    </TouchableOpacity>
                </View>
            )}

            {showButtons && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.mainButton}
                        onPress={downloadAllImages}
                        disabled={downloadAllPressed}
                    >
                        <Text style={styles.buttonText}>
                            {downloadAllPressed ? 'Downloading...' : 'Download all images'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mainButton} onPress={watchVideoAgain}>
                        <Text style={styles.buttonText}>Watch Video Again</Text>
                    </TouchableOpacity>
                </View>
            )}

            {imageUrls.length === 0 && (
                <Text style={styles.loadingText}>No images available.</Text>
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
    imageContainer: {
        alignItems: 'center',
    },
    image: {
        width: 300,
        height: 300,
    },
    downloadButton: {
        marginTop: 10,
        backgroundColor: '#FF4B4B',
        padding: 10,
        borderRadius: 5,
    },
    mainButton: {
        marginVertical: 10,
        backgroundColor: '#FFCC00',
        padding: 15,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#101010',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        color: '#FFCC00',
        fontSize: 18,
    },
});

export default EndVideo;
