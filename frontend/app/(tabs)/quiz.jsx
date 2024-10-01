import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView, State, TapGestureHandler } from 'react-native-gesture-handler';
import * as Speech from 'expo-speech';
import questionsData from '../../assets/quiz/questions.json';

const Quiz = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('#F5FCFF');
    const [tapCount, setTapCount] = useState(0);
    const [tapTimeout, setTapTimeout] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const currentQuestion = questionsData[currentQuestionIndex];

    useEffect(() => {
        // Clean up on component unmount
        return () => {
            Speech.stop();
        };
    }, []);

    useEffect(() => {
        readQuestionAndAnswers();
    }, [currentQuestionIndex]);

    useEffect(() => {
        let timer;
        if (selectedAnswer !== null) {
            timer = setTimeout(() => {
                if (!isSpeaking) { // Only navigate when speech is done
                    handleNextQuestion();
                }
            }, 5000); // Wait for 5 seconds before moving to the next question
        }
        return () => clearTimeout(timer);
    }, [selectedAnswer, isSpeaking]);

    const speakText = async (text) => {
        setIsSpeaking(true);
        try {
            await Speech.speak(text, {
                language: 'en-GB',
                rate: 0.8,
                onDone: () => setIsSpeaking(false),
                onStopped: () => setIsSpeaking(false),
            });
        } catch (error) {
            console.warn('Speech failed', error);
            setIsSpeaking(false);
        }
    };

    const handleAnswerSelection = (answer) => {
        setSelectedAnswer(answer);
        const correct = answer === currentQuestion.correctAnswer;
        setIsCorrect(correct);
        setBackgroundColor(correct ? '#00FF00' : '#FF0000');

        // Read out if the answer is correct or incorrect
        speakText(correct ? 'Correct!' : 'Incorrect. Try again.');
    };

    const readQuestionAndAnswers = () => {
        const textToRead = `${currentQuestion.question}. 
            Answer 1: ${currentQuestion.answers[0]}. 
            Answer 2: ${currentQuestion.answers[1]}. 
            Answer 3: ${currentQuestion.answers[2]}. 
            Answer 4: ${currentQuestion.answers[3]}.`;

        speakText(textToRead);
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setIsCorrect(false);
        setTapCount(0);
        setBackgroundColor('#F5FCFF');
        if (currentQuestionIndex < questionsData.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            speakText('Quiz Completed');
            alert('Quiz Completed');
        }
    };

    const handleTap = (event) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            if (tapTimeout) {
                clearTimeout(tapTimeout);
            }

            // Increment tap count
            const newTapCount = tapCount + 1;
            setTapCount(newTapCount);

            // Set a timeout to finalize the selection after a short delay
            const timeout = setTimeout(() => {
                if (newTapCount >= 1 && newTapCount <= 4) {
                    handleAnswerSelection(currentQuestion.answers[newTapCount - 1]);
                }

                // Reset tap count after the selection is made
                setTapCount(0);
            }, 500); // Short delay to wait for additional taps (adjusted to 500ms)

            // Save the timeout so we can clear it on subsequent taps
            setTapTimeout(timeout);
        }
    };

    return (
        <GestureHandlerRootView style={[styles.container, { backgroundColor }]}>
            <TapGestureHandler onHandlerStateChange={handleTap}>
                <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>
                </View>
            </TapGestureHandler>

            <View style={styles.answersContainer}>
                <TouchableOpacity
                    style={[styles.answerButton, styles.topLeft]}
                    onPress={() => handleAnswerSelection(currentQuestion.answers[0])}
                >
                    <Text style={styles.answerText}>{currentQuestion.answers[0]}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.answerButton, styles.topRight]}
                    onPress={() => handleAnswerSelection(currentQuestion.answers[1])}
                >
                    <Text style={styles.answerText}>{currentQuestion.answers[1]}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.answerButton, styles.bottomLeft]}
                    onPress={() => handleAnswerSelection(currentQuestion.answers[2])}
                >
                    <Text style={styles.answerText}>{currentQuestion.answers[2]}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.answerButton, styles.bottomRight]}
                    onPress={() => handleAnswerSelection(currentQuestion.answers[3])}
                >
                    <Text style={styles.answerText}>{currentQuestion.answers[3]}</Text>
                </TouchableOpacity>
            </View>

            {selectedAnswer && (
                <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
                    <Text style={styles.nextButtonText}>
                        {isCorrect ? 'Correct! Next Question' : 'Incorrect! Try Again'}
                    </Text>
                </TouchableOpacity>
            )}
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    questionContainer: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    questionText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    answersContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    answerButton: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    answerText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FFFFFF',
    },
    topLeft: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: '#FF0000',
    },
    topRight: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: '#478747',
    },
    bottomLeft: {
        position: 'absolute',
        bottom: 120,
        left: 20,
        backgroundColor: '#0000FF',
    },
    bottomRight: {
        position: 'absolute',
        bottom: 120,
        right: 20,
        backgroundColor: '#000000',
    },
    nextButton: {
        position: 'absolute',
        bottom: 20,
        padding: 20,
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Quiz;