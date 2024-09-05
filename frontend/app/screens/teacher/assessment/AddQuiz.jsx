import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, Button, ScrollView, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { collection, addDoc } from "firebase/firestore";
import {db} from "../../../../FirebaseConfig";

const AddQuiz = () => {
    const [quizName, setQuizName] = useState('');
    const [quizInstructions, setQuizInstructions] = useState('');
    const [questions, setQuestions] = useState([
        { questionText: '', answers: ['', '', '', ''], correctAnswerIndex: null }
    ]);
    const [isSubmitted, setIsSubmitted] = useState(false);

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


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TextInput
                    style={styles.openTextField}
                    placeholder="Enter Quiz Name"
                    value={quizName}
                    onChangeText={setQuizName}
                    editable={!isSubmitted}
                />
                <TextInput
                    style={styles.instructionsInput}
                    placeholder="Enter Quiz Instructions (Optional)"
                    value={quizInstructions}
                    onChangeText={setQuizInstructions}
                    editable={!isSubmitted}
                    multiline
                />
                <Text style={styles.toggleLabel}>Toggle on the correct answer</Text>

                {questions.map((question, questionIndex) => (
                    <View key={questionIndex} style={styles.questionContainer}>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeQuestion(questionIndex)}
                        >
                            <Text style={styles.removeButtonText}>X</Text>
                        </TouchableOpacity>
                        <Text style={styles.label}>Question {questionIndex + 1}:</Text>
                        <TextInput
                            style={styles.questionInput}
                            placeholder="Enter the question"
                            value={question.questionText}
                            onChangeText={(text) => handleQuestionChange(text, questionIndex)}
                            editable={!isSubmitted}
                        />
                        {question.answers.map((answer, answerIndex) => (
                            <View key={answerIndex} style={styles.answerContainer}>
                                <TextInput
                                    style={styles.answerInput}
                                    placeholder={`Answer ${answerIndex + 1}`}
                                    value={answer}
                                    onChangeText={(text) => handleAnswerChange(text, questionIndex, answerIndex)}
                                    editable={!isSubmitted}
                                />
                                <Switch
                                    value={question.correctAnswerIndex === answerIndex}
                                    onValueChange={() => handleToggleChange(questionIndex, answerIndex)}
                                    style={styles.switch}
                                    disabled={isSubmitted}
                                />
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
            {!isSubmitted && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmitQuiz}
                    >
                        <Text style={styles.submitButtonText}>Submit Quiz</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addQuestionButton}
                        onPress={addNewQuestion}
                    >
                        <Text style={styles.addQuestionButtonText}>Add Question</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    topBar: {
        height: 10,
        backgroundColor: '#007BFF00',
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 80,
    },
    openTextField: {
        marginTop: 20,
        height: 50,
        fontSize: 22,
        fontWeight: 'bold',
        paddingHorizontal: 5,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderColor: '#333',
    },
    instructionsInput: {
        height: 100,
        borderColor: '#333',
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 20,
        backgroundColor: '#FFF',
        fontSize: 16,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    questionContainer: {
        marginBottom: 30,
        position: 'relative',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#FFF',
    },
    removeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    removeButtonText: {
        color: '#D7D7D7',
        fontSize: 18,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    questionInput: {
        height: 50,
        borderColor: '#333',
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#FFF',
        fontSize: 18,
    },
    answerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    answerInput: {
        height: 50,
        flex: 1,
        borderColor: '#333',
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        fontSize: 18,
        marginRight: 10,
    },
    switch: {
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#F5FCFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        alignItems: 'center',
    },
    submitButton: {
        marginBottom: 10,
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 8,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    addQuestionButton: {
        marginBottom: 10,
        backgroundColor: '#28A745',
        padding: 10,
        borderRadius: 8,
    },
    addQuestionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddQuiz;