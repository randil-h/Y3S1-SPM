import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useRoute } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../FirebaseConfig';

const QuizDetails = () => {
    const route = useRoute();
    const router = useRouter();
    const { id } = route.params; // Get `id` from route parameters
    const [quiz, setQuiz] = useState(null);
    const [newQuizName, setNewQuizName] = useState('');
    const [quizInstructions, setQuizInstructions] = useState('');

    useEffect(() => {
        async function fetchQuizDetails() {
            try {
                const docRef = doc(db, 'quizzes', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setQuiz(data);
                    setNewQuizName(data.quizName);
                    setQuizInstructions(data.quizInstructions);
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching quiz details: ', error);
            }
        }

        fetchQuizDetails();
    }, [id]);

    const handleUpdate = async () => {
        try {
            const docRef = doc(db, 'quizzes', id);
            await updateDoc(docRef, {
                quizName: newQuizName,
                quizInstructions: quizInstructions,
            });
            Alert.alert('Success', 'Quiz updated successfully!');
            router.push('/screens/teacher/assessment/QuizPage'); // Navigate back to quiz list
        } catch (error) {
            console.error('Error updating quiz: ', error);
            Alert.alert('Error', 'Failed to update quiz.');
        }
    };

    if (!quiz) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quiz Details</Text>
            <TextInput
                style={styles.input}
                placeholder="Quiz Name"
                value={newQuizName}
                onChangeText={setNewQuizName}
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Quiz Instructions"
                value={quizInstructions}
                onChangeText={setQuizInstructions}
                multiline
                numberOfLines={4}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={handleUpdate}
            >
                <Text style={styles.buttonText}>Update Quiz</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    textArea: {
        height: 100,
    },
    button: {
        backgroundColor: '#1e90ff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
});

export default QuizDetails;
