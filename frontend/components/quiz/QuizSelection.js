import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';
import * as Speech from 'expo-speech'; // Import speech

const QuizSelection = ({ onQuizSelect }) => {
    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'quizzes'));
            const quizList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuizzes(quizList);

            // Start reading the number of quizzes and their names aloud
            if (quizList.length > 0) {
                const numberOfQuizzesMessage = `There are ${quizList.length} quizzes available.`;
                Speech.speak(numberOfQuizzesMessage, {
                    onDone: () => {
                        quizList.forEach((quiz, index) => {
                            Speech.speak(`Quiz ${index + 1}: ${quiz.quizName}`);
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        }
    };

    const handleQuizSelect = (item) => {
        // Read aloud the selected quiz name
        const selectedQuizMessage = `You selected ${item.quizName}. Navigating now.`;
        Speech.speak(selectedQuizMessage, {
            onDone: () => {
                // Add a delay of 5 seconds before navigating
                setTimeout(() => {
                    onQuizSelect(item);
                }, 5000); // 5000ms = 5 seconds
            }
        });
    };

    const renderQuizItem = ({ item }) => (
        <TouchableOpacity
            style={styles.quizItem}
            onPress={() => handleQuizSelect(item)}
        >
            <Text style={styles.quizName}>{item.quizName}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select a Quiz</Text>
            <FlatList
                data={quizzes}
                renderItem={renderQuizItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5FCFF',
    },
    title: {
        marginTop: 60,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    listContainer: {
        flexGrow: 1,
    },
    quizItem: {
        backgroundColor: '#fff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        elevation: 3,
    },
    quizName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default QuizSelection;
