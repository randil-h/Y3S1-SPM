import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView, State, TapGestureHandler } from 'react-native-gesture-handler';
import questionsData from '../../assets/quiz/questions.json';
import * as Speech from "expo-speech";

const Quiz = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('#F5FCFF');
    const [tapCount, setTapCount] = useState(0);
    const [tapTimeout, setTapTimeout] = useState(null);

    const currentQuestion = questionsData[currentQuestionIndex];

    useEffect(() => {
        return () => {
            Speech.stop();  // Stop any ongoing speech when the component unmounts
        };
    }, []);

    useEffect(() => {
        readQuestionAndAnswers();
    }, [currentQuestionIndex]);

    useEffect(() => {
        let timer;
        if (selectedAnswer !== null) {
            timer = setTimeout(() => {
                handleNextQuestion();
            }, 5000); // Wait for 5 seconds before moving to the next question
        }
        return () => clearTimeout(timer);
    }, [selectedAnswer]);

    const handleAnswerSelection = (answer) => {
        setSelectedAnswer(answer);
        const correct = answer === currentQuestion.correctAnswer;
        setIsCorrect(correct);
        setBackgroundColor(correct ? '#00FF00' : '#FF0000');

        // Read out if the answer is correct or incorrect
        Speech.speak(correct ? 'Correct!' : 'Incorrect. Try again.');
    };

    const readQuestionAndAnswers = () => {
        const textToRead = `${currentQuestion.question}. 
            Answer 1: ${currentQuestion.answers[0]}. 
            Answer 2: ${currentQuestion.answers[1]}. 
            Answer 3: ${currentQuestion.answers[2]}. 
            Answer 4: ${currentQuestion.answers[3]}.`;

        Speech.speak(textToRead);
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setIsCorrect(false);
        setTapCount(0);
        setBackgroundColor('#F5FCFF');
        if (currentQuestionIndex < questionsData.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            Speech.speak('Quiz Completed');
            alert('Quiz Completed');
        }
    };

    const handleTap = (event) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            // Clear the previous timeout if it exists, to avoid premature answer selection
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
        top: '50%',
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
        left: 0,
        backgroundColor: '#FF0000',
    },
    topRight: {
        position: 'absolute',
        top: 50,
        right: 0,
        backgroundColor: '#478747',
    },
    bottomLeft: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        backgroundColor: '#0000FF',
    },
    bottomRight: {
        position: 'absolute',
        bottom: 20,
        right: 0,
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