// /src/screens/PhotoEscapeCameraScreen.js

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Dimensions
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Using CameraView as per SelfieScreen
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../../firebase/firebase';

const { height, width } = Dimensions.get('window');

const PhotoEscapeCameraScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [cameraType, setCameraType] = useState('front'); // 'back' or 'front'
    const [loading, setLoading] = useState(false);
    const [wrongObject, setWrongObject] = useState(false);
    const cameraRef = useRef(null);
    const storage = firebase.storage();
    const navigation = useNavigation();
    const { pin, gameNumber, itemName, name, selfieURL } = useRoute().params || {};
    const roomRef = firebase.database().ref(`room/${pin}`);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        } else if (!permission.granted) {
            requestPermission();
        }

        const winnerListener = roomRef.child('winner').on('value', (snapshot) => {
            if (snapshot.exists()) {
                const winnerData = snapshot.val();
                navigation.navigate('CongratulationsScreen', {
                    itemName,
                    winnerImage: winnerData.image,
                    name,
                    selfieURL,
                });
            }
        });

        // Cleanup listener on unmount
        return () => {
            roomRef.child('winner').off('value', winnerListener);
        };
    }, [permission, roomRef, navigation, itemName, selfieURL, name]);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const options = { quality: 0.5 };
                const data = await cameraRef.current.takePictureAsync(options);
                setPhoto(data.uri);
                setWrongObject(false);
            } catch (error) {
                console.error('Error taking picture:', error);
                Alert.alert('Error', 'Failed to take picture. Please try again.');
            }
        }
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const submitPhoto = async () => {
        if (!photo) return;
        setLoading(true);
        try {
            const response = await fetch(photo);
            const blob = await response.blob();
            const fileName = `photo_${new Date().getTime()}.png`;
            const storageRef = storage.ref().child(`photos/${fileName}`);

            const snapshot = await storageRef.put(blob);
            const url = await snapshot.ref.getDownloadURL();

            await checkItemInPhoto(blob, url);
        } catch (error) {
            console.error('Error uploading file:', error);
            Alert.alert('Error', 'Failed to upload photo. Please try again.');
            setLoading(false);
        }
    };

    const checkItemInPhoto = async (photoBlob, photoUrl) => {
        try {
            const base64Image = await blobToBase64(photoBlob);
            const isItemInImage = firebase.functions().httpsCallable('isItemInImage');
            const result = await isItemInImage({ currentItem: itemName, image: base64Image });
            const { isPresent } = result.data;

            if (isPresent) {
                await roomRef.child('winner').set({ image: photoUrl, name, selfieURL });
                navigation.navigate('CongratulationsScreen', {
                    itemName,
                    winnerImage: photoUrl,
                    name,
                    selfieURL,
                });
            } else {
                setWrongObject(true);
                setPhoto(null);
                setLoading(false);
                Alert.alert('Wrong Object', `The desired item was not found in the image. Please try again.`);
            }
        } catch (error) {
            console.error('Error checking item in image:', error);
            Alert.alert('Error', 'Failed to verify the photo. Please try again.');
            setLoading(false);
        }
    };

    const resetCapture = () => {
        setPhoto(null);
        setWrongObject(false);
    };

    const handleGiveUp = () => {
        navigation.navigate('LostScreen', { name, selfieURL });
    };

    const handleBackToLimerick = () => {
        navigation.navigate('PhotoEscapeLimerick', { pin, name, selfieURL });
    };

    // Ensure camera is unmounted when navigating away
    useEffect(() => {
        return () => {
            if (cameraRef.current) {
                cameraRef.current.pausePreview();
            }
        };
    }, []);

    // Check for camera permissions status
    if (!permission || permission.status === 'undetermined') {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>Requesting camera permissions...</Text>
            </View>
        );
    }
    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>No access to camera</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Back to Limerick Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBackToLimerick}>
                <Text style={styles.backButtonText}>← BACK TO RIDDLE</Text>
            </TouchableOpacity>

            {!photo ? (
                <View style={styles.cameraContainer}>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing={cameraType} // Use 'back' or 'front'
                    >
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                                <Text style={styles.captureButtonText}>Capture</Text>
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </View>
            ) : (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: photo }} style={styles.capturedPhoto} />
                    {!loading && (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.actionButton} onPress={resetCapture}>
                                <Text style={styles.buttonText}>Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={submitPhoto}>
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Processing your image...</Text>
                        </View>
                    )}
                    {wrongObject && (
                        <View style={styles.wrongObjectContainer}>
                            <Text style={styles.wrongObjectText}>❌ Wrong Object! Please try again.</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Smaller Give Up Button in Grey */}
            <TouchableOpacity style={styles.giveUpButton} onPress={handleGiveUp}>
                <Text style={styles.giveUpButtonText}>Give Up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionText: {
        color: '#FFFFFF',
        fontSize: 18,
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#FF4B4B',
        padding: 10,
        borderRadius: 10,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 40, // Adjust based on your design
        left: 20,
        backgroundColor: 'transparent',
        padding: 10,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    cameraContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    camera: {
        width: width * 0.8, // Make the camera window smaller (80% of screen width)
        height: height * 0.5, // Adjust height as needed (50% of screen height)
        borderRadius: 10,
        overflow: 'hidden',
        borderColor: '#FFFFFF',
        borderWidth: 2,
    },
    cameraOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 20,
    },
    captureButton: {
        width: 120,
        height: 50,
        backgroundColor: '#FF4B4B',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    previewContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    capturedPhoto: {
        width: '100%',
        height: '70%',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFCC00',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 20,
    },
    actionButton: {
        backgroundColor: '#FF4B4B',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    wrongObjectContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    wrongObjectText: {
        color: '#FF4B4B',
        fontSize: 18,
        fontWeight: 'bold',
    },
    giveUpButton: {
        backgroundColor: '#808080', // Grey color
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
        position: 'absolute',
        bottom: 20,
        left: '40%', // Centered horizontally
        right: '40%',
        alignItems: 'center',
    },
    giveUpButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default PhotoEscapeCameraScreen;
