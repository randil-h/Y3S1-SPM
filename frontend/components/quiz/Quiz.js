import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView, State, TapGestureHandler } from 'react-native-gesture-handler';
import * as Speech from 'expo-speech';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import app from '../../FirebaseConfig';
import {useFocusEffect} from "@react-navigation/native";

const Quiz = ({ quiz, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('#F5FCFF');
    const [tapCount, setTapCount] = useState(0);
    const [tapTimeout, setTapTimeout] = useState(null);
    const [attemptCount, setAttemptCount] = useState(0);
    const [marks, setMarks] = useState(0); // Holds total marks across all questions
    const [questionMarks, setQuestionMarks] = useState(0); // Holds the marks awarded for the current question
    const [gesture, setGesture] = useState(null);
    const [gestureTimeout, setGestureTimeout] = useState(false);
    let ws;

    const firestore = getFirestore(app); // Firestore reference

    const currentQuestion = quiz.questions[currentQuestionIndex];

    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    useEffect(() => {
        readQuestionAndAnswers();
        setAttemptCount(0); // Reset attempt count for new question
        setQuestionMarks(0); // Reset the question-specific marks for each question
    }, [currentQuestionIndex]);

    useFocusEffect(
        React.useCallback(() => {
            // WebSocket connection starts when the page is focused
            ws = new WebSocket('ws://192.168.1.4:8765');

            ws.onopen = () => {
                console.log('WebSocket connection established');
            };

            ws.onmessage = (event) => {
                const { gesture } = JSON.parse(event.data);
                handleGestureSelection(gesture);
            };

            ws.onclose = () => {
                console.log('WebSocket connection is closed');
            };

            // Cleanup function to close WebSocket when page is unfocused
            return () => {
                if (ws) {
                    ws.close();
                    console.log('WebSocket connection closed');
                }
            };
        }, [])
    );

    const handleAnswerSelection = (answer) => {
        setSelectedAnswer(answer);
        const correct = answer === currentQuestion.answers[currentQuestion.correctAnswerIndex];
        setIsCorrect(correct);

        let awardedMarks;
        if (attemptCount === 0) {
            awardedMarks = 10;
        } else if (attemptCount === 1) {
            awardedMarks = 5;
        } else {
            awardedMarks = 3;
        }

        if (correct || attemptCount >= 2) {
            setMarks(marks + awardedMarks);
        }
        setQuestionMarks(awardedMarks);

        setBackgroundColor(correct ? '#00FF00' : '#FF0000');
        Speech.speak(correct ? `Correct! ${awardedMarks} marks.` : `Incorrect. You have ${2 - attemptCount} attempts left.`);

        // Increment attempt count if incorrect
        if (!correct) {
            setAttemptCount(attemptCount + 1);
        }

        // If correct or out of attempts, move to the next question
        if (correct || attemptCount >= 2) {
            setTimeout(handleNextQuestion, 3000);
        }
    };

    const handleGestureSelection = (gesture) => {
        if(gestureTimeout) return;

        setGestureTimeout(true);

        if (gesture === 'Selected answer: One') {
            handleAnswerSelection(currentQuestion.answers[0]);
        } else if (gesture === 'Selected answer: Two') {
            handleAnswerSelection(currentQuestion.answers[1]);
        } else if (gesture === 'Selected answer: Three') {
            handleAnswerSelection(currentQuestion.answers[2]);
        } else if (gesture === 'Selected answer: Four') {
            handleAnswerSelection(currentQuestion.answers[3]);
        } else if (gesture === 'Submit') {
            handleNextQuestion();
        }else if (gesture === 'Previous Tab' || gesture === 'Next Tab') {

        }

        setTimeout(() => {
            setGestureTimeout(false);
        }, 3000);
    };

    const readQuestionAndAnswers = () => {
        const textToRead = `${currentQuestion.questionText}. 
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

        // If the quiz is not over, move to the next question
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            Speech.speak('Quiz Completed');
            // Send total marks and attempts data to Firestore
            saveQuizResultsToFirestore();
            onComplete();
        }
    };

    const saveQuizResultsToFirestore = async () => {
        try {
            const docRef = await addDoc(collection(firestore, 'quiz_attempts'), {
                quizName: quiz.quizName,
                totalMarks: marks,
                totalQuestions: quiz.questions.length,
                timestamp: new Date().toISOString(),
            });
            console.log('Quiz results saved with ID: ', docRef.id);
        } catch (e) {
            console.error('Error adding document: ', e);
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

            // Save the timeout ,so we can clear it on subsequent taps
            setTapTimeout(timeout);
        }
    };

    return (
        <GestureHandlerRootView style={[styles.container, { backgroundColor }]}>
            <TapGestureHandler onHandlerStateChange={handleTap}>
                <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
                </View>
            </TapGestureHandler>

            <View style={styles.answersContainer}>
                {currentQuestion.answers.map((answer, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.answerButton, styles[`answer${index + 1}`]]}
                        onPress={() => handleAnswerSelection(answer)}
                    >
                        <Text style={styles.answerText}>{answer}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {selectedAnswer && (
                <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
                    <Text style={styles.nextButtonText}>
                        {isCorrect || attemptCount >= 2
                            ? 'Next Question'
                            : `Incorrect! Try Again (Attempts Left: ${2 - attemptCount})`}
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
    answer1: {
        position: 'absolute',
        top: 50,
        left: 0,
        backgroundColor: '#FF0000',
    },
    answer2: {
        position: 'absolute',
        top: 50,
        right: 0,
        backgroundColor: '#478747',
    },
    answer3: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        backgroundColor: '#0000FF',
    },
    answer4: {
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