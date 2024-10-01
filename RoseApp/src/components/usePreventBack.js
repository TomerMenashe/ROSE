// /src/components/usePreventBack.js

import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';

const usePreventBack = () => {
    const navigation = useNavigation();

    useEffect(() => {
        // Disable swipe back gesture on iOS
        navigation.setOptions({ gestureEnabled: false });
    }, [navigation]);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => true; // Prevent back action

            // Add event listener for Android back button
            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                // Remove event listener on cleanup
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [])
    );
};

export default usePreventBack;
