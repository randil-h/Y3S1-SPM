import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../FirebaseConfig'; // Adjust the import based on your structure
import { useRouter, useGlobalSearchParams } from 'expo-router';

const CourseManagement = () => {
    const { courseId, courseName } = useGlobalSearchParams(); // Accessing courseId and courseName
    const [topics, setTopics] = useState([]);
    const [topicName, setTopicName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Fetch topics from Firestore
    const fetchTopics = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, `courses/${courseId}/topics`));
            const topicList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTopics(topicList);
        } catch (error) {
            console.error("Error fetching topics:", error);
        }
    };

    // Save topic to Firestore
    const saveTopic = async () => {
        if (topicName === '') {
            Alert.alert('Error', 'Please enter a topic name.');
            return;
        }

        try {
            const newTopicRef = collection(db, `courses/${courseId}/topics`);
            await addDoc(newTopicRef, {
                topicName,
                createdAt: new Date() // Add a timestamp
            });
            Alert.alert('Success', 'Topic added successfully!');
            setTopicName(''); // Reset the input
            setIsModalVisible(false); // Close the modal
            fetchTopics(); // Refresh the topic list
        } catch (error) {
            console.error("Error adding topic:", error);
            Alert.alert('Error', 'Failed to add the topic.');
        }
    };

    // Delete a topic from Firestore
    const deleteTopic = async (topicId) => {
        try {
            await deleteDoc(doc(db, `courses/${courseId}/topics`, topicId));
            Alert.alert('Success', 'Topic deleted successfully!');
            fetchTopics(); // Refresh the topic list
        } catch (error) {
            console.error("Error deleting topic:", error);
            Alert.alert('Error', 'Failed to delete the topic.');
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{courseName} - Manage Topics</Text>

            {/* Topic List */}
            <FlatList
                data={topics}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.topicItem}>
                        <Text style={styles.topicText}>{item.topicName}</Text>
                        <TouchableOpacity onPress={() => deleteTopic(item.id)}>
                            <Text style={styles.deleteButton}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Floating '+' button */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => setIsModalVisible(true)} // Show modal to add topic
            >
                <Text style={styles.floatingButtonText}>+</Text>
            </TouchableOpacity>

            {/* Modal for adding topic */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Topic Name"
                                    value={topicName}
                                    onChangeText={(text) => setTopicName(text)}
                                />
                                <TouchableOpacity style={styles.saveButton} onPress={saveTopic}>
                                    <Text style={styles.buttonText}>Add Topic</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setIsModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
        fontSize: 24,
        marginBottom: 20,
    },
    topicItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    topicText: {
        fontSize: 16,
    },
    deleteButton: {
        color: 'red',
        fontWeight: 'bold',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 40,
        right: 40,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#529a25',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    floatingButtonText: {
        color: '#fff',
        fontSize: 24,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    saveButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default CourseManagement;
