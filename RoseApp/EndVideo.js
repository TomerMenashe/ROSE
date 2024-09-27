// /src/screens/EndVideo.js

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Alert,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { firebase } from './src/firebase/firebase'; // Adjust the path as necessary
import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

const EndVideo = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pin } = route.params || {};

    const [imageUrls, setImageUrls] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [isPlaying, setIsPlaying] = useState(true);
    const [downloadAllPressed, setDownloadAllPressed] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading state for "Download All"

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

                const urlSet = new Set(); // Use a Set to store unique URLs

                const traverse = (node) => {
                    if (node === null || node === undefined) return;
                    if (typeof node === 'string' && node.startsWith('http')) {
                        // Optionally, handle case-insensitivity
                        // const normalizedUrl = node.toLowerCase();
                        const normalizedUrl = node; // Use as-is if URLs are case-sensitive
                        urlSet.add(normalizedUrl);
                        console.log('Found URL:', normalizedUrl);
                    } else if (Array.isArray(node)) {
                        node.forEach((child) => traverse(child));
                    } else if (typeof node === 'object') {
                        Object.values(node).forEach((child) => traverse(child));
                    }
                };

                traverse(data);

                if (urlSet.size > 0) {
                    setImageUrls(Array.from(urlSet)); // Convert Set back to Array
                } else {
                    console.warn('No image URLs found.');
                    Alert.alert('No Images', 'No image URLs were found for this pin.');
                }
            } catch (error) {
                console.error('Error fetching image URLs:', error);
                Alert.alert('Error', 'Failed to fetch image URLs.');
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
                setIsPlaying(false);
            }
        });
    };

    const requestPermission = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Cannot save images without permission.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Permission Error:', error);
            Alert.alert('Error', 'Failed to request permissions.');
            return false;
        }
    };

    /**
     * Downloads an image from the given URL into the local filesystem (used for single image download).
     * @param {string} url - The URL of the image to download.
     */
    const downloadImage = async (url) => {
        try {
            const hasPermission = await requestPermission();
            if (!hasPermission) return;

            let fileName;
            let directory = '';
            let fileUri;

            try {
                const urlObject = new URL(url);
                const pathname = decodeURIComponent(urlObject.pathname);
                const pathAfterO = pathname.split('/o/')[1];
                const fullPath = pathAfterO ? pathAfterO.split('?')[0] : null;

                if (fullPath) {
                    const pathSegments = fullPath.split('/');
                    fileName = pathSegments.pop();
                    directory = pathSegments.join('/');
                } else {
                    throw new Error('Invalid URL structure.');
                }

                if (!fileName) {
                    fileName = `image_${Date.now()}.jpg`;
                }

                const localDir = `${FileSystem.documentDirectory}${directory}/`;
                await FileSystem.makeDirectoryAsync(localDir, { intermediates: true });

                fileUri = `${localDir}${fileName}`;
            } catch (parseError) {
                console.warn('Failed to parse URL, using fallback method:', parseError);
                fileName = url.split('/').pop().split('?')[0];
                if (!fileName) {
                    fileName = `image_${Date.now()}.jpg`;
                }
                fileUri = `${FileSystem.documentDirectory}${fileName}`;
            }

            const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
            const { uri } = await downloadResumable.downloadAsync();

            if (Platform.OS === 'ios') {
                await Sharing.shareAsync(uri);
                Alert.alert('Success', 'Image shared successfully!');
            } else {
                await MediaLibrary.saveToLibraryAsync(uri);
                Alert.alert('Success', 'Image saved to your gallery!');
            }
        } catch (error) {
            console.error('Download Error for URL:', url, error);
            Alert.alert('Error', `Failed to download image from ${url}`);
        }
    };

    /**
     * Downloads all images in the `imageUrls` array without using `downloadImage`.
     */
    const downloadAllImages = async () => {
        setDownloadAllPressed(true);
        setIsLoading(true); // Start loading
        try {
            const hasPermission = await requestPermission();
            if (!hasPermission) {
                setDownloadAllPressed(false);
                setIsLoading(false);
                return;
            }

            // Iterate over imageUrls and download each image
            for (const url of imageUrls) {
                try {
                    let fileName = url.split('/').pop().split('?')[0];
                    if (!fileName) {
                        fileName = `image_${Date.now()}.jpg`;
                    }

                    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
                    const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
                    const { uri } = await downloadResumable.downloadAsync();

                    if (Platform.OS === 'ios') {
                        await Sharing.shareAsync(uri);
                        // Optionally, skip sharing if you don't want individual shares during bulk download
                    } else {
                        await MediaLibrary.saveToLibraryAsync(uri);
                        // Optionally, delete the file after saving to the gallery
                        // await FileSystem.deleteAsync(uri);
                    }
                } catch (error) {
                    console.error('Error downloading image:', error);
                    // Optionally, collect failed URLs to inform the user later
                }
            }

            // Single success message after all images are downloaded
            Alert.alert('Success', 'All images have been downloaded!');
        } catch (error) {
            console.error('Download All Error:', error);
            Alert.alert('Error', 'Failed to download some or all images.');
        } finally {
            setDownloadAllPressed(false);
            setIsLoading(false); // End loading
        }
    };

    const watchVideoAgain = () => {
        setCurrentImageIndex(0);
        setIsPlaying(true);
    };

    return (
        <View style={styles.container}>
            {/* Always show the "Download All Images" button at the top */}
            <TouchableOpacity
                style={styles.downloadAllButton}
                onPress={downloadAllImages}
                disabled={downloadAllPressed || isLoading} // Disable when loading
            >
                <Text style={styles.buttonText}>
                    {isLoading ? 'Downloading...' : 'Download All Images'}
                </Text>
            </TouchableOpacity>

            {/* Show loading spinner and message if downloading all */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFCC00" />
                    <Text style={styles.loadingText}>Downloading all images...</Text>
                </View>
            )}

            {/* Display the current image with download option */}
            {imageUrls.length > 0 && isPlaying && (
                <View style={styles.imageContainer}>
                    <Animated.Image
                        source={{ uri: imageUrls[currentImageIndex] }}
                        style={[styles.image, { opacity: fadeAnim }]}
                        resizeMode="contain"
                        onError={(error) => {
                            console.error('Image Load Error:', error.nativeEvent.error);
                            Alert.alert('Error', 'Failed to load an image.');
                        }}
                    />
                    <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={() => downloadImage(imageUrls[currentImageIndex])}
                        disabled={isLoading} // Optionally disable when downloading all
                    >
                        <Text style={styles.buttonText}>Download Image</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Display "Watch Video Again" button when animations are done */}
            {!isPlaying && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.mainButton} onPress={watchVideoAgain}>
                        <Text style={styles.buttonText}>Watch Video Again</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Show message if no images are available */}
            {imageUrls.length === 0 && !isPlaying && (
                <Text style={styles.loadingText}>No images available.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010',
        justifyContent: 'flex-start', // Align items from the top
        alignItems: 'center',
        padding: 20,
    },
    downloadAllButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    imageContainer: {
        alignItems: 'center',
        flex: 1, // Take up available space
        justifyContent: 'center',
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
        width: '100%',
    },
    buttonText: {
        color: '#101010',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        color: '#FFCC00',
        fontSize: 18,
        marginLeft: 10,
    },
});

export default EndVideo;
