import React, { useState } from 'react';
import { View, Text, Modal, Button, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../../FirebaseConfig';

const LessonManager = ({ course, isVisible, onClose }) => {
    const [lessons, setLessons] = useState(course.lessons || []);

    // Upload PDF file and update lessons in the course
    const uploadLesson = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
        });

        if (result.type === 'success') {
            const newLesson = { name: result.name, uri: result.uri };
            setLessons([...lessons, newLesson]);
            await updateDoc(doc(db, 'courses', course.id), {
                lessons: arrayUnion(newLesson),
            });
        }
    };

    // Delete lesson with confirmation
    const deleteLesson = async (lesson) => {
        Alert.alert(
            'Delete Lesson',
            `Are you sure you want to delete ${lesson.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: async () => {
                        setLessons(lessons.filter(l => l.uri !== lesson.uri));
                        await updateDoc(doc(db, 'courses', course.id), {
                            lessons: arrayRemove(lesson),
                        });
                    }}
            ]
        );
    };

    return (
        <Modal visible={isVisible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Manage Lessons for {course.courseName}</Text>

                    <FlatList
                        data={lessons}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.lessonItem}>
                                <Text>{item.name}</Text>
                                <TouchableOpacity onPress={() => deleteLesson(item)}>
                                    <Text style={styles.deleteButton}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />

                    <Button title="Upload Lesson (PDF)" onPress={uploadLesson} />
                    <Button title="Close" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    lessonItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    deleteButton: {
        color: 'red',
    },
});

export default LessonManager;
