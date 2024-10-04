import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { TextInput, Switch, Button, Text, useTheme, Provider as PaperProvider } from 'react-native-paper';
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../../FirebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

const AddQuiz = () => {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
    });

    const theme = useTheme();

    const [quizName, setQuizName] = useState('');
    const [quizInstructions, setQuizInstructions] = useState('');
    const [questions, setQuestions] = useState([
        { questionText: '', answers: ['', '', '', ''], correctAnswerIndex: null }
    ]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    let ws;

    useFocusEffect(
        React.useCallback(() => {
            ws = new WebSocket('ws://192.168.1.4:8765');

            ws.onopen = () => {
                console.log('WebSocket connection established');
            };

            ws.onmessage = (event) => {
                const { gesture } = JSON.parse(event.data);
                handleSubmitGesture(gesture);
            };

            ws.onclose = () => {
                console.log('WebSocket connection is closed');
            };

            return () => {
                if (ws) {
                    ws.close();
                    console.log('WebSocket connection closed');
                }
            };
        }, [])
    );

    const handleSubmitGesture = (gesture) => {
        if (gesture === 'Submit') {
            handleSubmitQuiz();
        } else if(gesture === 'Return') {
            router.back();
        }
    };

    const handleQuestionChange = (text, index) => {
        const newQuestions = [...questions];
        newQuestions[index].questionText = text;
        setQuestions(newQuestions);
    };

    const handleAnswerChange = (text, questionIndex, answerIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].answers[answerIndex] = text;
        setQuestions(newQuestions);
    };

    const handleToggleChange = (questionIndex, answerIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].correctAnswerIndex = answerIndex;
        setQuestions(newQuestions);
    };

    const addNewQuestion = () => {
        setQuestions([...questions, { questionText: '', answers: ['', '', '', ''], correctAnswerIndex: null }]);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSubmitQuiz = async () => {
        const incompleteQuestions = questions.some(
            (q) => q.questionText === '' || q.answers.includes('') || q.correctAnswerIndex === null
        );

        if (incompleteQuestions) {
            Alert.alert('Incomplete Quiz', 'Please ensure all questions and answers are filled, and a correct answer is selected for each question.');
            return;
        }

        const quizData = {
            quizName,
            quizInstructions,
            questions,
            createdAt: new Date(),
        };

        try {
            const docRef = await addDoc(collection(db, 'quizzes'), quizData);
            console.log('Quiz submitted with ID: ', docRef.id);
            setIsSubmitted(true);
            Alert.alert('Quiz Submitted', 'Your quiz has been submitted successfully.');
        } catch (e) {
            console.error('Error adding document: ', e);
            Alert.alert('Submission Failed', 'There was an issue submitting your quiz. Please try again.');
        }
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <PaperProvider theme={{
            ...theme,
            fonts: {
                ...theme.fonts,
                regular: { fontFamily: 'Inter_400Regular' },
                medium: { fontFamily: 'Inter_400Regular' },
                light: { fontFamily: 'Inter_400Regular' },
                thin: { fontFamily: 'Inter_400Regular' },
            },
        }}>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.heading}>Add Quiz</Text>
                    <TextInput
                        label="Quiz Name"
                        value={quizName}
                        onChangeText={setQuizName}
                        mode="outlined"
                        style={styles.quizNameInput}
                        disabled={isSubmitted}
                    />
                    <TextInput
                        label="Quiz Instructions (Optional)"
                        value={quizInstructions}
                        onChangeText={setQuizInstructions}
                        mode="outlined"
                        multiline
                        numberOfLines={4}
                        style={styles.instructionsInput}
                        disabled={isSubmitted}
                    />
                    <Text style={styles.toggleLabel}>Toggle on the correct answer</Text>

                    {questions.map((question, questionIndex) => (
                        <View key={questionIndex} style={styles.questionContainer}>
                            <Button
                                icon="close"
                                mode="contained"
                                onPress={() => removeQuestion(questionIndex)}
                                style={styles.removeButton}>
                            </Button>
                            <Text style={styles.questionLabel}>Question {questionIndex + 1}:</Text>
                            <TextInput
                                label="Enter the question"
                                value={question.questionText}
                                onChangeText={(text) => handleQuestionChange(text, questionIndex)}
                                mode="outlined"
                                style={styles.questionInput}
                                disabled={isSubmitted}
                            />
                            {question.answers.map((answer, answerIndex) => (
                                <View key={answerIndex} style={styles.answerContainer}>
                                    <TextInput
                                        label={`Answer ${answerIndex + 1}`}
                                        value={answer}
                                        onChangeText={(text) => handleAnswerChange(text, questionIndex, answerIndex)}
                                        mode="outlined"
                                        style={styles.answerInput}
                                        disabled={isSubmitted}
                                    />
                                    <Switch
                                        value={question.correctAnswerIndex === answerIndex}
                                        onValueChange={() => handleToggleChange(questionIndex, answerIndex)}
                                        disabled={isSubmitted}
                                        trackColor={{false: '#767577', true: '#a0f1a7'}}
                                        thumbColor={{false: '#000000', true: '#f4f3f4'}}
                                    />
                                </View>
                            ))}
                        </View>
                    ))}
                </ScrollView>
                {!isSubmitted && (
                    <View style={styles.bottomBar}>
                        <Button mode="outlined" onPress={handleSubmitQuiz} style={styles.submitButton}>
                            <Text style={styles.submitButtonText}> Submit </Text>
                        </Button>
                        <Button mode="outlined" onPress={addNewQuestion} style={styles.addQuestionButton}>
                            <Text style = {styles.addQuestionButtonText}> Add Question </Text>
                        </Button>
                    </View>
                )}
            </SafeAreaView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ededed',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 80,
    },
    heading: {
        alignSelf: 'center',
        fontFamily: "Inter_700Bold",
        fontSize: 48,
        color: '#323232',
        marginTop: 15,
        marginBottom: 30,
    },
    quizNameInput: {
        marginBottom: 15,
        fontFamily: 'Inter_700Bold',
    },
    instructionsInput: {
        marginBottom: 20,
    },
    toggleLabel: {
        marginBottom: 20,
        fontFamily: 'Inter_700Bold',
        fontSize: 16,
    },
    questionContainer: {
        marginBottom: 30,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    removeButton: {
        paddingLeft: 15,
        width: 10,
        borderRadius: 15,
        backgroundColor: 'red',
        alignSelf: 'flex-end',
    },
    questionLabel: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        marginBottom: 10,
    },
    questionInput: {
        marginBottom: 15,
    },
    answerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    answerInput: {
        flex: 1,
        marginRight: 10,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#d6d6d6',
    },
    submitButton: {
        flex: 1,
        marginRight: 10,
        backgroundColor: '#f8f8f8',
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        borderColor: '#323232'
    },
    submitButtonText: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: '#323232',
    },
    addQuestionButtonText: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: '#323232',
    },
    addQuestionButton: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        borderColor: '#323232'
    },
});

export default AddQuiz;