import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../FirebaseConfig';

const QuizPage = () => {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedQuiz, setEditedQuiz] = useState(null);
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'quizzes'));
            let quizList = [];

            querySnapshot.forEach((doc) => {
                const quiz = doc.data();
                quizList.push({ ...quiz, id: doc.id });
            });

            setQuizzes(quizList);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

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

    const handleEdit = () => {
        setEditedQuiz({ ...selectedQuiz });
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            await updateDoc(doc(db, 'quizzes', editedQuiz.id), {
                quizName: editedQuiz.quizName,
                quizInstructions: editedQuiz.quizInstructions,
                questions: editedQuiz.questions,
            });
            setQuizzes((prevQuizzes) =>
                prevQuizzes.map((quiz) =>
                    quiz.id === editedQuiz.id ? editedQuiz : quiz
                )
            );
            setSelectedQuiz(editedQuiz);
            setIsEditing(false);
            Alert.alert('Success', 'Quiz updated successfully');
            fetchData(); // Refresh the quiz list
        } catch (error) {
            console.error('Error updating quiz: ', error);
            Alert.alert('Error', 'Failed to update quiz');
        }
    };

    const renderQuizItem = ({ item }) => (
        <View style={styles.quizItemContainer}>
            <TouchableOpacity
                style={styles.quizItem}
                onPress={() => {
                    setSelectedQuiz(item);
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

    const renderQuizModal = () => (
        <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => {
                setIsModalVisible(false);
                setIsEditing(false);
            }}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <ScrollView contentContainerStyle={styles.modalScrollContent}>
                        {isEditing ? (
                            <View>
                                <TextInput
                                    style={styles.input}
                                    value={editedQuiz.quizName}
                                    onChangeText={(text) => setEditedQuiz({ ...editedQuiz, quizName: text })}
                                    placeholder="Quiz Name"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={editedQuiz.quizInstructions}
                                    onChangeText={(text) => setEditedQuiz({ ...editedQuiz, quizInstructions: text })}
                                    placeholder="Quiz Instructions"
                                    multiline
                                />
                                {editedQuiz.questions.map((question, index) => (
                                    <View key={index} style={styles.questionContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={question.questionText}
                                            onChangeText={(text) => {
                                                const updatedQuestions = [...editedQuiz.questions];
                                                updatedQuestions[index].questionText = text;
                                                setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
                                            }}
                                            placeholder={`Question ${index + 1}`}
                                        />
                                        {question.answers.map((answer, answerIndex) => (
                                            <View key={answerIndex} style={styles.answerContainer}>
                                                <TextInput
                                                    style={styles.input}
                                                    value={answer}
                                                    onChangeText={(text) => {
                                                        const updatedQuestions = [...editedQuiz.questions];
                                                        updatedQuestions[index].answers[answerIndex] = text;
                                                        setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
                                                    }}
                                                    placeholder={`Answer ${answerIndex + 1}`}
                                                />
                                                <TouchableOpacity
                                                    style={[
                                                        styles.correctAnswerToggle,
                                                        answerIndex === question.correctAnswerIndex ? styles.correctAnswerToggleSelected : null
                                                    ]}
                                                    onPress={() => {
                                                        const updatedQuestions = [...editedQuiz.questions];
                                                        updatedQuestions[index].correctAnswerIndex = answerIndex;
                                                        setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
                                                    }}
                                                >
                                                    <Text style={styles.correctAnswerToggleText}>
                                                        {answerIndex === question.correctAnswerIndex ? '✓' : ' '}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View>
                                <Text style={styles.modalTitle}>{selectedQuiz?.quizName}</Text>
                                <Text style={styles.quizInstructions}>{selectedQuiz?.quizInstructions}</Text>
                                {selectedQuiz?.questions.map((question, index) => (
                                    <View key={index} style={styles.questionContainer}>
                                        <Text style={styles.questionText}>Question {index + 1}: {question.questionText}</Text>
                                        {question.answers.map((answer, answerIndex) => (
                                            <Text key={answerIndex} style={[
                                                styles.answerText,
                                                answerIndex === question.correctAnswerIndex ? styles.correctAnswer : null
                                            ]}>
                                                {answerIndex + 1}. {answer}
                                            </Text>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                    <View style={styles.modalButtonContainer}>
                        {isEditing ? (
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                                <Text style={styles.buttonText}>Edit</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setIsModalVisible(false);
                                setIsEditing(false);
                            }}
                        >
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
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
                style={styles.addButton}
                onPress={() => router.push('screens/teacher/assessment/AddQuiz')}
            >
                <Text style={styles.buttonText}>Add Quiz</Text>
            </TouchableOpacity>
            {renderQuizModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    addButton: {
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
        fontSize: 16,
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
        width: '90%',
        maxHeight: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    modalScrollContent: {
        paddingBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    quizInstructions: {
        fontSize: 16,
        marginBottom: 20,
        fontStyle: 'italic',
    },
    questionContainer: {
        marginBottom: 20,
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    answerText: {
        fontSize: 16,
        marginLeft: 10,
        marginBottom: 5,
    },
    correctAnswer: {
        color: 'green',
        fontWeight: 'bold',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    editButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    closeButton: {
        backgroundColor: '#1e90ff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
    },
    answerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    correctAnswerToggle: {
        width: 30,
        height: 30,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    correctAnswerToggleSelected: {
        backgroundColor: '#4CAF50',
    },
    correctAnswerToggleText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default QuizPage;