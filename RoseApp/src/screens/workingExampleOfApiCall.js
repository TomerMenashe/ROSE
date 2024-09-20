import React, {useState} from "react";
import {Pressable, Text, View} from "react-native";

const [testResponse, setTestResponse] = useState('');  // State to hold the test response
// Function to call the testGenerateResponse Firebase function
const callTestGenerateResponse = async () => {
    try {
        const generateResponse = httpsCallable(functions, 'testGenerateResponse');
        const result = await generateResponse();
        const { response } = result.data;
        setTestResponse(response);
        Alert.alert('Test Response', response);
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to get response from the server.');
    }
};
<Pressable style={styles.testButton} onPress={callTestGenerateResponse}>
    <Text style={styles.loginButtonText}>Test Generate Response</Text>
</Pressable>

{/* Display Test Response */}
{testResponse !== '' && (
    <View style={styles.responseContainer}>
        <Text style={styles.responseText}>{testResponse}</Text>
    </View>
)}