import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { collection, getDocs, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../../FirebaseConfig';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import {query} from "@react-native-firebase/firestore";
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from "expo-font";

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

    let [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    if (!fontsLoaded) {
        return null;
    }

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

    const fetchQuizAttempts = async (quizName) => {
        try {
            const attemptsQuery = query(collection(db, 'quiz_attempts'), where('quizName', '==', quizName));
            const attemptsSnapshot = await getDocs(attemptsQuery);
            const attemptsList = attemptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return attemptsList;
        } catch (error) {
            console.error("Error fetching quiz attempts:", error);
            return [];
        }
    };

    const handleLongPress = async (quiz) => {
        const quizAttempts = await fetchQuizAttempts(quiz.quizName);
        const currentDate = new Date();
        let currentDateTime = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
            + `T${String(currentDate.getHours()).padStart(2, '0')}-${String(currentDate.getMinutes()).padStart(2, '0')}-${String(currentDate.getSeconds()).padStart(2, '0')}`;

        currentDateTime = currentDateTime.slice(0, 10) + ' ' + currentDateTime.slice(11);

        if (quizAttempts.length === 0) {
            Alert.alert('No data', 'No quiz attempts found for this quiz.');
            return;
        }

        const htmlContent = generateReportHTML(quiz, quizAttempts);

        try {
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false
            });
            console.log("PDF generated at:", uri);
            await shareReport(uri, `${quiz.quizName} report as at ${currentDateTime}.pdf`);
        } catch (error) {
            console.error("Error generating or sharing PDF report:", error);
            Alert.alert('Error', 'Failed to generate or share the PDF report.');
        }
    };

    const generateReportHTML = (quiz, attempts) => {
        let totalMarksSum = 0;
        let totalQuestionsSum = 0;

        const attemptsHTML = attempts.map((attempt, index) => {
            totalMarksSum += attempt.totalMarks;
            totalQuestionsSum += attempt.totalQuestions;

            return `
                <h3>Attempt ${index + 1}</h3>
                <p>Timestamp: ${new Date(attempt.timestamp).toLocaleString()}</p>
                <p>Total Marks: ${attempt.totalMarks}</p>
                <p>Total Questions: ${attempt.totalQuestions}</p>
            `;
        }).join('');

        const averageMarks = totalMarksSum / attempts.length;
        const averageQuestions = totalQuestionsSum / attempts.length;

        return `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    h1 { color: #4CAF50; }
                    h2 { color: #2196F3; }
                    .summary { background-color: #f2f2f2; padding: 10px; border-radius: 5px; }
                </style>
            </head>
            <body>
                <h1>Report for Quiz: ${quiz.quizName}</h1>
                <p>Total Attempts: ${attempts.length}</p>
                
                <h2>Attempts Details</h2>
                ${attemptsHTML}
                
                <h2>Summary</h2>
                <div class="summary">
                    <p>Average Marks: ${averageMarks.toFixed(2)}</p>
                    <p>Average Questions: ${averageQuestions.toFixed(2)}</p>
                </div>
            </body>
            </html>
        `;
    };

    const shareReport = async (fileUri, filename) => {
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert('Error', 'Sharing is not available on this device');
            return;
        }

        try {
            const shareableUri = `${FileSystem.cacheDirectory}${filename}`;
            await FileSystem.copyAsync({
                from: fileUri,
                to: shareableUri
            });

            await Sharing.shareAsync(shareableUri, { UTI: '.pdf', mimeType: 'application/pdf' });

            await FileSystem.deleteAsync(shareableUri, { idempotent: true });
        } catch (error) {
            console.error('Error sharing PDF report:', error);
            Alert.alert('Error', 'Failed to share the PDF report.');
        }
    };

    const generateReportContent = (quiz, attempts) => {
        let report = `Report for Quiz: ${quiz.quizName}\n\n`;
        report += `Total Attempts: ${attempts.length}\n\n`;

        let totalMarksSum = 0;
        let totalQuestionsSum = 0;

        attempts.forEach((attempt, index) => {
            report += `Attempt ${index + 1}:\n`;
            report += `Timestamp: ${attempt.timestamp}\n`;
            report += `Total Marks: ${attempt.totalMarks}\n`;
            report += `Total Questions: ${attempt.totalQuestions}\n\n`;

            totalMarksSum += attempt.totalMarks;
            totalQuestionsSum += attempt.totalQuestions;
        });

        const averageMarks = totalMarksSum / attempts.length;
        const averageQuestions = totalQuestionsSum / attempts.length;

        report += `Summary:\n`;
        report += `Average Marks: ${averageMarks.toFixed(2)}\n`;
        report += `Average Questions Attempted: ${averageQuestions.toFixed(2)}\n`;

        return report;
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
                onLongPress={() => handleLongPress(item)}
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
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setIsModalVisible(false);
                                setIsEditing(false);
                            }}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Quizzes</Text>
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
                <Text style={styles.addButtonText}> + </Text>
            </TouchableOpacity>
            {renderQuizModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA', // Light grey background
        paddingTop: 80,
    },
    heading: {
        alignSelf: 'center',
        fontFamily: "Inter_700Bold",
        fontSize: 48,
        color: '#323232',
        marginBottom: 30,
    },
    addButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        paddingBottom: 5,
        backgroundColor: '#55b0f8',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
    },
    addButtonText: {
        color: 'white',
        fontSize: 36,
        fontFamily: "Inter_600SemiBold",
    },
    listContainer: {
        padding: 16,
    },
    quizItemContainer: {
        marginBottom: 16,
    },
    quizItem: {
        backgroundColor: 'white',
        borderRadius: 4,
        padding: 16,
        elevation: 2,
    },
    quizText: {
        color: '#212121', // Almost black
        fontSize: 16,
        fontFamily: "Inter_500Medium",
    },
    editButton: {
        position: 'absolute',
        bottom: 6,
        left: 16,
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    editButtonText: {
        color: 'white',
        fontFamily: "Inter_600SemiBold",
        fontSize: 14,
    },
    saveButtonText: {
        color: 'white',
        fontFamily: "Inter_600SemiBold",
        fontSize: 14,
    },
    closeButtonText: {
        color: 'white',
        fontFamily: "Inter_600SemiBold",
        fontSize: 14,
    },
    saveButton: {
        position: 'absolute',
        bottom: 6,
        left: 16,
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
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 8,
    },
    deleteButtonText: {
        color: '#B00020', // Error color
        fontSize: 14,
        fontFamily: "Inter_500Medium",
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
        backgroundColor: 'white',
        borderRadius: 4,
        elevation: 24,
        overflow: 'hidden',
    },
    modalScrollContent: {
        padding: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: "Inter_600SemiBold",
        marginBottom: 16,
        color: '#212121',
    },
    quizInstructions: {
        fontSize: 16,
        marginBottom: 24,
        fontFamily: "Inter_400Regular",
        color: '#757575',
    },
    questionContainer: {
        marginBottom: 24,
    },
    questionText: {
        fontSize: 18,
        fontFamily: "Inter_500Medium",
        marginBottom: 12,
        color: '#212121',
    },
    answerText: {
        fontSize: 16,
        marginLeft: 16,
        marginBottom: 8,
        fontFamily: "Inter_400Regular",
        color: '#424242',
    },
    correctAnswer: {
        color: '#4CAF50',
        fontFamily: "Inter_500Medium",
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginLeft: 8,
    },
    actionButtonText: {
        color: '#6200EE',
        fontFamily: "Inter_500Medium",
        fontSize: 14,
        textTransform: 'uppercase',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
        fontFamily: "Inter_400Regular",
        fontSize: 16,
        color: '#212121',
    },
    answerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    correctAnswerToggle: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#478747',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    correctAnswerToggleSelected: {
        backgroundColor: '#478747',
    },
    correctAnswerToggleText: {
        fontSize: 16,
        fontFamily: "Inter_600SemiBold",
        color: 'white',
    },
});

export default QuizPage;