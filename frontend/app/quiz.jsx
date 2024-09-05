import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import questionsData from '../assets/quiz/questions.json';

const Quiz = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);

    const currentQuestion = questionsData[currentQuestionIndex];

    const handleAnswerSelection = (answer) => {
        setSelectedAnswer(answer);
        setIsCorrect(answer === currentQuestion.correctAnswer);
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setIsCorrect(false);
        if (currentQuestionIndex < questionsData.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            alert('Quiz Completed');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.questionContainer}>
                <Text style={styles.questionText} accessibilityLabel={`Question: ${currentQuestion.question}`}>
                    {currentQuestion.question}
                </Text>
            </View>

            <View style={styles.answersContainer}>
                <TouchableOpacity
                    style={[styles.answerButton, styles.topLeft]}
                    onPress={() => handleAnswerSelection(currentQuestion.answers[0])}
                    accessibilityLabel={`Answer: ${currentQuestion.answers[0]}`}
                >
                    <Text style={styles.answerText}>{currentQuestion.answers[0]}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.answerButton, styles.topRight]}
                    onPress={() => handleAnswerSelection(currentQuestion.answers[1])}
                    accessibilityLabel={`Answer: ${currentQuestion.answers[1]}`}
                >
                    <Text style={styles.answerText}>{currentQuestion.answers[1]}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.answerButton, styles.bottomLeft]}
                    onPress={() => handleAnswerSelection(currentQuestion.answers[2])}
                    accessibilityLabel={`Answer: ${currentQuestion.answers[2]}`}
                >
                    <Text style={styles.answerText}>{currentQuestion.answers[2]}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.answerButton, styles.bottomRight]}
                    onPress={() => handleAnswerSelection(currentQuestion.answers[3])}
                    accessibilityLabel={`Answer: ${currentQuestion.answers[3]}`}
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
        </View>
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
        width: 150, // Increased size
        height: 150, // Increased size
        borderRadius: 0, // Square shape
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20, // Increased margin to accommodate larger buttons
        elevation: 4, // Add shadow for Android
        shadowColor: '#000', // Add shadow for iOS
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
        backgroundColor: '#FF0000', // Red
    },
    topRight: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: '#478747', // Green
    },
    bottomLeft: {
        position: 'absolute',
        bottom: 120, // Adjusted to move up
        left: 20,
        backgroundColor: '#0000FF', // Blue
    },
    bottomRight: {
        position: 'absolute',
        bottom: 120, // Adjusted to move up
        right: 20,
        backgroundColor: '#000000', // Black
    },
    nextButton: {
        position: 'absolute',
        bottom: 20,
        padding: 20,
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        elevation: 4, // Add shadow for Android
        shadowColor: '#000', // Add shadow for iOS
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
