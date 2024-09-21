import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { firebase } from '../../firebase/firebase';

const TestPhotoCapture = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [cameraType, setCameraType] = useState('front');
    const cameraRef = useRef(null);
    const storage = firebase.storage();
    const photoRef = firebase.database().ref('photo');
    const itemRef = firebase.database().ref('item');
    const winnerRef = firebase.database().ref('winner');
    const [itemName, setItemName] = useState('');
    const [resultMessage, setResultMessage] = useState('');
    const functions = firebase.functions();

    // Generate a new item using the getRandomItem cloud function
    const generateNewItem = async () => {
        try {
            const getRandomItem = firebase.functions().httpsCallable('getRandomItem');
            const result = await getRandomItem();
            const newItem = result.data.item;
            itemRef.set(newItem);
            setItemName(newItem);
        } catch (error) {
            console.error('Error generating new item:', error);
        }
    };

    useEffect(() => {
        if (!permission) {
            requestPermission();
        } else if (!permission.granted) {
            requestPermission();
        }

        // Fetch a random item from the cloud function
        generateNewItem();

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
            setResultMessage(''); // Clear any previous result message
        }
    };

    // Convert blob to Base64 format for checking the item in the image
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
        }
    };

    const checkItemInPhoto = async (photoBlob, photoUrl) => {
        try {
            const base64Image = await blobToBase64(photoBlob);
            const isItemInImage = firebase.functions().httpsCallable('isItemInImage');
            const itemSnapshot = await itemRef.once('value');
            const item = itemSnapshot.val();

            const result = await isItemInImage({ currentItem: item, image: base64Image });
            const { isPresent } = result.data;
            if (isPresent) {
                winnerRef.set(photoUrl).then(() => {
                    setResultMessage('Congrats! Item found in the photo!');
                    generateNewItem(); // Generate a new item for the next round
                });
            } else {
                setResultMessage(`Try Again. There is no ${item} in the image!`);
                resetCapture();
            }
        } catch (error) {
            console.error('Error checking item in image:', error);
        }
    };

    const resetCapture = () => {
        setPhoto(null);
        setResultMessage('');
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
        },
        text: {
            fontSize: 20,
            color: '#333',
            marginBottom: 20,
        },
        camera: {
            width: '100%',
            height: '70%',
        },
        cameraOverlay: {
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 20,
        },
        captureButton: {
            width: 100,
            height: 50,
            backgroundColor: '#ff5722',
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
        },
        captureButtonText: {
            color: '#fff',
            fontSize: 18,
        },
        capturedPhoto: {
            width: 300,
            height: 400,
            marginVertical: 20,
        },
        retakeButton: {
            backgroundColor: '#2196F3',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
        },
        submitButton: {
            backgroundColor: '#4CAF50',
            padding: 10,
            borderRadius: 5,
        },
        buttonText: {
            color: '#fff',
            fontSize: 16,
        },
        resultText: {
            fontSize: 18,
            color: 'green',
            marginTop: 10,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Item: {itemName}</Text>
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity style={styles.retakeButton} onPress={resetCapture}>
                            <Text style={styles.buttonText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={submitPhoto}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                    {resultMessage ? (
                        <Text style={styles.resultText}>{resultMessage}</Text>
                    ) : null}
                </View>
            )}
        </View>
    );
};

export default TestPhotoCapture;
