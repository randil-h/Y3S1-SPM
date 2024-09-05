import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, TextInput, Button, ScrollView } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../FirebaseConfig';

const QuizPage = () => {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newQuizName, setNewQuizName] = useState('');
    const [quizInstructions, setQuizInstructions] = useState('');
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        async function fetchData() {
            try {
                const querySnapshot = await getDocs(collection(db, 'quizzes'));
                let quizList = [];

                querySnapshot.forEach((doc) => {
                    const quiz = doc.data();
                    quizList.push({ ...quiz, id: doc.id });
                });

                setQuizzes(quizList);
                console.log(quizList);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        }

        fetchData();
    }, []);

    const handleDelete = async (id) => {
        Alert.alert(
            'Delete Quiz',
            'Are you sure you want to delete this quiz?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'quizzes', id));
                            setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== id));
                        } catch (error) {
                            console.error('Error deleting quiz: ', error);
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = async () => {
        if (selectedQuiz && newQuizName.trim() && quizInstructions.trim() && questions.length > 0) {
            try {
                await updateDoc(doc(db, 'quizzes', selectedQuiz.id), {
                    quizName: newQuizName,
                    quizInstructions: quizInstructions,
                    questions: questions,
                });
                setQuizzes((prevQuizzes) =>
                    prevQuizzes.map((quiz) =>
                        quiz.id === selectedQuiz.id ? { ...quiz, quizName: newQuizName, quizInstructions, questions } : quiz
                    )
                );
                setIsModalVisible(false);
            } catch (error) {
                console.error('Error updating quiz: ', error);
            }
        }
    };

    const addQuestion = () => {
        if (newQuestion.trim() && newAnswer.trim()) {
            setQuestions([...questions, { question: newQuestion, answer: newAnswer }]);
            setNewQuestion('');
            setNewAnswer('');
        }
    };

    const renderQuizItem = ({ item }) => (
        <View style={styles.quizItemContainer}>
            <TouchableOpacity
                style={styles.quizItem}
                onPress={() => {
                    setSelectedQuiz(item);
                    setNewQuizName(item.quizName);
                    setQuizInstructions(item.quizInstructions || '');
                    setQuestions(item.questions || []);
                    setIsModalVisible(true);
                }}
            >
                <Text style={styles.quizText}>{item.quizName}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
            >
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={quizzes}
                renderItem={renderQuizItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('screens/teacher/assessment/AddQuiz')}
            >
                <Text style={styles.buttonText}>Add Quiz</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    button: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: '#1e90ff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    listContainer: {
        marginTop: 100,
        padding: 20,
    },
    quizItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    quizItem: {
        flex: 1,
        backgroundColor: '#9f9f9f',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginRight: 10,
    },
    quizText: {
        color: 'white',
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: 'red',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 10,
    },
    quizTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 5,
    },
    quizName: {
        fontSize: 16,
        marginBottom: 10,
    },
    quizInstructions: {
        fontSize: 16,
        marginBottom: 20,
    },
    questionContainer: {
        marginBottom: 10,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    answerText: {
        fontSize: 14,
        color: 'grey',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        marginTop: 15,
    },
});

export default QuizPage;