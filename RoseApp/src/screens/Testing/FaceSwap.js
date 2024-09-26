// Import necessary modules from React and React Native
import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    Alert,
    Text,
    ActivityIndicator,
    Animated, // Import Animated for scaling effect
} from 'react-native';
import { firebase } from '../../firebase/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';

// Get the screen width
const { width } = Dimensions.get('window');

const FaceSwap = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pin, name } = route.params || {};

    // Game state variables
    const [cards, setCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState('');
    const [playerScores, setPlayerScores] = useState({});
    const [gameOver, setGameOver] = useState(false);
    const [error, setError] = useState(null);

    // Firebase references
    const roomRef = useRef(null);
    const gameRef = useRef(null);

    // Card back cover URL
    const cardCover = { uri: 'https://firebasestorage.googleapis.com/v0/b/rose-date.appspot.com/o/Screenshot%202024-09-24%20022934.png?alt=media&token=26bafaaf-cbac-4a74-b977-e8db8004e9e5' };

    // Define Animated values and scaling factor
    const scaleAnimations = useRef({});
    const desiredScale = (2.6 * width) / (width - 80); // 65% of screen size

    useEffect(() => {
        if (!pin || !name) {
            Alert.alert('Error', 'Missing game information.');
            navigation.goBack();
            return;
        }

        roomRef.current = firebase.database().ref(`room/${pin}`);
        gameRef.current = roomRef.current.child('memoryGame');

        const fetchGameState = async () => {
            try {
                const snapshot = await gameRef.current.once('value');
                const gameState = snapshot.val();

                if (!gameState) {
                    setError('Game state is invalid.');
                    return;
                }

                setCards(gameState.cards || []);
                setCurrentPlayer(gameState.currentPlayer || '');
                setPlayerScores(gameState.playerScores || {});
                setGameOver(gameState.gameOver || false);

                if (gameState.gameOver && !gameOver) {
                    const winner = determineWinner(gameState.playerScores);
                    Alert.alert('Game Over', `${winner} wins!`, [
                        { text: 'OK', onPress: () => navigation.navigate('EndVideo', { pin }) },
                    ]);
                }
            } catch (fetchError) {
                console.error('Error fetching game state:', fetchError);
                setError('Failed to fetch game state.');
            }
        };

        const gameListener = gameRef.current.on('value', (snapshot) => {
            const gameState = snapshot.val();
            if (gameState) {
                setCards(gameState.cards || []);
                setCurrentPlayer(gameState.currentPlayer || '');
                setPlayerScores(gameState.playerScores || {});
                setGameOver(gameState.gameOver || false);

                if (gameState.gameOver && !gameOver) {
                    const winner = determineWinner(gameState.playerScores);
                    Alert.alert('Game Over', `${winner} wins!`, [
                        { text: 'OK', onPress: () => navigation.navigate('EndVideo', { pin }) },
                    ]);
                }
            }
        });

        // Fetch the initial game state
        fetchGameState();

        return () => {
            gameRef.current.off('value', gameListener);
        };
    }, [pin, name, navigation, gameOver]);

    // Handle card press and start the animation
    const handleCardPress = (card) => {
        if (currentPlayer !== name || card.isFlipped || card.isMatched) {
            return;
        }

        const updatedCards = cards.map((c) =>
            c.id === card.id ? { ...c, isFlipped: true } : c
        );

        const newSelectedCards = [...selectedCards, card];
        setSelectedCards(newSelectedCards);
        updateCardsInFirebase(updatedCards);

        // Start the scaling animation
        const scaleAnimation = scaleAnimations.current[card.id] || new Animated.Value(1);
        scaleAnimations.current[card.id] = scaleAnimation;

        Animated.sequence([
            Animated.timing(scaleAnimation, {
                toValue: desiredScale,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnimation, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();

        if (newSelectedCards.length === 2) {
            checkForMatch(newSelectedCards, updatedCards);
        }
    };

    const updateCardsInFirebase = (updatedCards) => {
        gameRef.current.update({
            cards: updatedCards,
        });
    };

    const checkForMatch = (selectedCardsPair, updatedCards) => {
        const [firstCard, secondCard] = selectedCardsPair;

        if (firstCard.pairId === secondCard.pairId) {
            const matchedCards = updatedCards.map((c) =>
                c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
            );

            const newPlayerScores = {
                ...playerScores,
                [name]: (playerScores[name] || 0) + 1,
            };

            const isGameOver = matchedCards.every((card) => card.isMatched);

            gameRef.current.update({
                cards: matchedCards,
                playerScores: newPlayerScores,
                gameOver: isGameOver,
            });

            setSelectedCards([]);

            if (isGameOver) {
                setGameOver(true);
            }
        } else {
            setTimeout(() => {
                const resetCards = updatedCards.map((c) =>
                    c.id === firstCard.id || c.id === secondCard.id
                        ? { ...c, isFlipped: false }
                        : c
                );

                roomRef.current
                    .child('participants')
                    .once('value')
                    .then((snapshot) => {
                        const participants = snapshot.val();
                        const participantNames = participants ? Object.keys(participants) : [];
                        const nextPlayer = participantNames.find((p) => p !== currentPlayer) || name;

                        gameRef.current.update({
                            cards: resetCards,
                            currentPlayer: nextPlayer,
                        });

                        setSelectedCards([]);
                    })
                    .catch((error) => {
                        console.error('Error fetching participants:', error);
                        Alert.alert('Error', 'Failed to switch players.');
                        setSelectedCards([]);
                    });
            }, 2000); // Ensuring card stays enlarged for the full 2-second animation
        }
    };

    const determineWinner = (scores) => {
        const players = Object.keys(scores);
        if (players.length === 0) return 'No one';
        if (players.length === 1) return players[0];
        if (scores[players[0]] > scores[players[1]]) {
            return players[0];
        } else if (scores[players[0]] < scores[players[1]]) {
            return players[1];
        } else {
            return 'No one, it\'s a tie!';
        }
    };

    // Render the card with animation
    const renderCard = (card) => {
        // Initialize scale animation for the card if it doesn't exist
        if (!scaleAnimations.current[card.id]) {
            scaleAnimations.current[card.id] = new Animated.Value(1);
        }

        const scaleAnimation = scaleAnimations.current[card.id];

        return (
            <TouchableOpacity
                key={card.id}
                onPress={() => handleCardPress(card)}
                disabled={card.isFlipped || card.isMatched || currentPlayer !== name}
                style={styles.cardContainer}
            >
                <Animated.Image
                    source={
                        card.isFlipped || card.isMatched
                            ? { uri: card.imageUrl }
                            : cardCover
                    }
                    style={[
                        styles.cardImage,
                        {
                            transform: [{ scale: scaleAnimation }],
                        },
                    ]}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        );
    };

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.gameTitle}>Face Swap Memory Game</Text>
            <Text style={styles.turnText}>
                {gameOver ? 'Game Over' : `Current Turn: ${currentPlayer}`}
            </Text>
            <View style={styles.scoresContainer}>
                {Object.entries(playerScores).map(([playerName, score]) => (
                    <Text key={playerName} style={styles.scoreText}>
                        {playerName}: {score}
                    </Text>
                ))}
            </View>
            <View style={styles.board}>{cards.map(renderCard)}</View>
        </View>
    );
};

const CARD_WIDTH = (width - 80) / 4;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D3D3D3',
        paddingTop: 50,
        alignItems: 'center',
    },
    gameTitle: {
        fontSize: 24,
        marginBottom: 20,
    },
    turnText: {
        fontSize: 18,
        marginBottom: 10,
    },
    scoresContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    scoreText: {
        marginHorizontal: 20,
        fontSize: 16,
    },
    board: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        margin: 10,
    },
    cardContainer: {
        margin: 5,
    },
    cardImage: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 10,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#D3D3D3',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default FaceSwap;
