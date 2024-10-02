import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import QuizSelection from '../../components/quiz/QuizSelection';
import Quiz from '../../components/quiz/Quiz';

const QuizManager = () => {
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const handleQuizSelect = (quiz) => {
        setSelectedQuiz(quiz);
    };

    const handleQuizComplete = () => {
        setSelectedQuiz(null);
    };

    return (
        <View style={styles.container}>
            {selectedQuiz ? (
                <Quiz quiz={selectedQuiz} onComplete={handleQuizComplete} />
            ) : (
                <QuizSelection onQuizSelect={handleQuizSelect} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default QuizManager;