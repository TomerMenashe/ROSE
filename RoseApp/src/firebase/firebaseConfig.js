import Constants from 'expo-constants';

const firebaseConfig = {
    apiKey: Constants.expoConfig.extra.firebaseApiKey,
    authDomain: Constants.expoConfig.extra.firebaseAuthDomain,
    databaseURL: Constants.expoConfig.extra.firebaseDatabaseURL,
    projectId: Constants.expoConfig.extra.firebaseProjectId,
    storageBucket: Constants.expoConfig.extra.firebaseStorageBucket,
    messagingSenderId: Constants.expoConfig.extra.firebaseMessagingSenderId,
    appId: Constants.expoConfig.extra.firebaseAppId,
    measurementId: Constants.expoConfig.extra.firebaseMeasurementId
};

export default firebaseConfig;
