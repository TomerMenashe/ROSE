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
    Image,
} from 'react-native';
import { firebase } from './src/firebase/firebase'; // Adjust the path as necessary
import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import usePreventBack from "./src/components/usePreventBack";

const EndVideo = () => {
    usePreventBack(); // **Added Hook Call**
    const navigation = useNavigation();
    const route = useRoute();
    const { pin } = route.params || {};

    const [imageUrls, setImageUrls] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [isPlaying, setIsPlaying] = useState(true);
    const [downloadAllPressed, setDownloadAllPressed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const gameRef = firebase.database().ref(`room`);

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
                        // const normalizedUrl = node.toLowerCase();
                        const normalizedUrl = node; // Use as-is if URLs are case-sensitive
                        urlSet.add(normalizedUrl);
                        //console.log('Found URL:', normalizedUrl);
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

    const endGame = async () => {
        try {
            // Remove any active listeners to prevent `currentGameIndex` from being recreated
            gameRef.child(`${pin}/currentGameIndex`).off();
            gameRef.child(`${pin}/playersInGameControl`).off();

            // Remove `currentGameIndex` first
            await gameRef.child(`${pin}/currentGameIndex`).remove();

            // Then remove the entire room
            await gameRef.child(`${pin}`).remove();

            // Navigate back to the Welcome screen
            navigation.replace('Welcome');
        } catch (error) {
        }
    };

    const watchVideoAgain = () => {
        setCurrentImageIndex(0);
        setIsPlaying(true);
    };
    return (
        <View style={styles.container}>
            {/* Thank you message always visible above the gif */}
            <Text style={styles.thankYouText}>
                Thank you for playing with us, you two beautiful souls
            </Text>

            {/* Gif positioned above the image frame */}
            <Image
                source={require('./assets/rose.gif')}
                style={styles.gif}
                resizeMode="contain"
            />

            {/* Display the current image with download options */}
            {imageUrls.length > 0 && isPlaying && (
                <View style={styles.imageContainer}>
                    <View style={styles.imageFrame}>
                        <Animated.Image
                            source={{ uri: imageUrls[currentImageIndex] }}
                            style={[styles.image, { opacity: fadeAnim }]}
                            resizeMode="contain"
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.downloadButton, styles.enhancedButton]}
                        onPress={() => downloadImage(imageUrls[currentImageIndex])}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>Download Image</Text>
                    </TouchableOpacity>

                    {/* "Download All Images" button below "Download Image" button */}
                    <TouchableOpacity
                        style={[styles.downloadAllButton, styles.enhancedButton]}
                        onPress={downloadAllImages}
                        disabled={downloadAllPressed || isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Downloading...' : 'Download All Images'}
                        </Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                        style={[styles.downloadAllButton, styles.enhancedButton]}
                        onPress={endGame}
                    >
                        <Text style={styles.buttonText}>
                            {'End Game'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* "Watch Video Again" button */}
            {!isPlaying && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.mainButton, styles.enhancedButton]} onPress={watchVideoAgain}>
                        <Text style={styles.buttonText}>Watch Video Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.downloadAllButton, styles.enhancedButton]}
                        onPress={endGame}
                    >
                        <Text style={styles.buttonText}>
                            {'End Game'}
                        </Text>
                    </TouchableOpacity>
                </View>
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
    downloadAllButton: {
        padding: 15,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
        marginTop: 10,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    imageFrame: {
        width: 300,
        height: 300,
        borderWidth: 4,
        borderColor: '#FF4B4B',
        borderRadius: 15,
        padding: 10,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -10, // Adjusted to make sure it touches the bottom of the gif
    },
    downloadButton: {
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
    },
    mainButton: {
        marginVertical: 10,
        padding: 15,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
        width: '100%',
    },
    enhancedButton: {
        backgroundColor: '#FF4B4B',
        borderColor: '#000000',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'sans-serif-condensed', // More stylish font
    },
    thankYouText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'cursive', // Beautiful font style
        textAlign: 'center',
        marginBottom: 5, // Positioned just above the gif
    },
    gif: {
        width: 150,
        height: 150,
        marginBottom: -15, // Positioned exactly on top of the image frame
    },
});

export default EndVideo;
