import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useNavigation and useRoute for navigation
import { firebase } from '../../firebase/firebase';

const PhotoEscapeCameraScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [cameraType, setCameraType] = useState('front');
    const [loading, setLoading] = useState(false); // For showing loading spinner
    const [wrongObject, setWrongObject] = useState(false); // To track if the wrong object is found
    const cameraRef = useRef(null);
    const storage = firebase.storage();
    const photoRef = firebase.database().ref('photo');
    const winnerRef = firebase.database().ref('winner');
    const navigation = useNavigation(); // Use navigation for page redirection
    const { params } = useRoute(); // Get the passed item (object) from the route parameters
    const { pin, gameNumber, itemName } = params; // itemName is passed from the previous screen
    const functions = firebase.functions();

    useEffect(() => {
        if (!permission) {
            requestPermission();
        } else if (!permission.granted) {
            requestPermission();
        }
    }, [permission]);

    if (!permission || permission.status === 'undetermined') {
        return <View><Text>Requesting camera permissions...</Text></View>;
    }
    if (!permission.granted) {
        return <View><Text>No access to camera</Text></View>;
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            const options = { quality: 0.5, base64: true };
            const data = await cameraRef.current.takePictureAsync(options);
            setPhoto(data.uri);
            setWrongObject(false); // Reset wrong object state when taking a new picture
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
        setLoading(true); // Start loading
        const response = await fetch(photo);
        const blob = await response.blob();
        const fileName = 'photo_' + new Date().getTime() + '.png';
        const storageRef = storage.ref().child('photos/' + fileName);

        try {
            const snapshot = await storageRef.put(blob);
            const url = await snapshot.ref.getDownloadURL();
            photoRef.set(url);
            checkItemInPhoto(blob, url);
        } catch (error) {
            console.error('Error uploading file:', error);
            setLoading(false); // Stop loading in case of an error
        }
    };

    const checkItemInPhoto = async (photoBlob, photoUrl) => {
        try {
            const base64Image = await blobToBase64(photoBlob);
            const isItemInImage = firebase.functions().httpsCallable('isItemInImage');

            const result = await isItemInImage({ currentItem: itemName, image: base64Image });  // Use the item passed from the previous screen
            const { isPresent } = result.data;
            setLoading(false); // Stop loading after checking
            if (isPresent) {
                winnerRef.set(photoUrl).then(() => {
                    navigation.navigate('CongratulationsScreen', { itemName }); // Navigate to the Congratulations screen
                });
            } else {
                setWrongObject(true); // Display wrong object message
            }
        } catch (error) {
            console.error('Error checking item in image:', error);
            setLoading(false); // Stop loading in case of an error
        }
    };

    const resetCapture = () => {
        setPhoto(null);
        setWrongObject(false); // Reset wrong object state
    };

    // Handle give up, navigate to Lost screen
    const handleGiveUp = () => {
        navigation.navigate('LostScreen');  // Navigate to the Lost screen
    };

    return (
        <View style={styles.container}>
            {/* Camera View */}
            {!photo ? (
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={cameraType}
                >
                    <View style={styles.cameraOverlay}>
                        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                            <Text style={styles.captureButtonText}>Capture</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            ) : (
                <View>
                    <Image source={{ uri: photo }} style={styles.capturedPhoto} />
                    {!loading && !wrongObject && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={styles.redButton} onPress={resetCapture}>
                                <Text style={styles.buttonText}>🔄 Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.redButton} onPress={submitPhoto}>
                                <Text style={styles.buttonText}>✅ Submit</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Show loading indicator while waiting */}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <Image source={require('./assets/loadingGif.gif')} style={styles.loadingGif} />
                            <Text style={styles.loadingText}>Processing your image...</Text>
                        </View>
                    )}

                    {/* Show wrong object message and Try Again button */}
                    {wrongObject && !loading && (
                        <View style={styles.wrongObjectContainer}>
                            <Text style={styles.resultText}>❌ Wrong Object! Please try again.</Text>
                            <TouchableOpacity style={styles.redButton} onPress={resetCapture}>
                                <Text style={styles.buttonText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Give Up Button */}
            <TouchableOpacity style={styles.giveUpButton} onPress={handleGiveUp}>
                <Text style={styles.giveUpButtonText}>Give Up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#101010',
    },
    camera: {
        width: '90%',
        height: '60%',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    captureButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    capturedPhoto: {
        width: 300,
        height: 400,
        marginVertical: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFCC00',
    },
    redButton: {
        backgroundColor: '#FF4B4B',
        padding: 10,
        borderRadius: 10,
        marginRight: 10,
        marginLeft: 10,
        width: 120,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    giveUpButton: {
        backgroundColor: '#FF4B4B',
        padding: 15,
        borderRadius: 10,
        marginTop: 30,
        width: '80%',
        alignItems: 'center',
    },
    giveUpButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    loadingGif: {
        width: 50,
        height: 50,
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 10,
    },
    wrongObjectContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    resultText: {
        fontSize: 20,
        color: '#FFCC00',
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
});

export default PhotoEscapeCameraScreen;
