import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import { db } from '../../../../FirebaseConfig'; // Adjust the import based on your structure
import { useRouter, useGlobalSearchParams } from 'expo-router';

const CourseManagement = () => {
    const { courseId, courseName } = useGlobalSearchParams(); // Accessing courseId and courseName
    const [topics, setTopics] = useState([]);
    const [topicName, setTopicName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDocModalVisible, setIsDocModalVisible] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const storage = getStorage();

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

    // Save document to the selected topic
    const saveDocument = async () => {
        if (!fileName || fileSize === 0) {
            Alert.alert('Error', 'Please select a file to upload.');
            return;
        }

        try {
            // Create a reference to the file in Firebase Storage
            const fileRef = ref(storage, `courses/${courseId}/topics/${selectedTopic}/documents/${fileName}`);
            const file = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });

            const response = await fetch(file.uri);
            const blob = await response.blob();

            // Upload the file
            await uploadBytes(fileRef, blob);
            const fileUrl = await getDownloadURL(fileRef);

            // Save file metadata in Firestore
            const fileData = {
                fileName,
                fileSize,
                fileUrl,
                createdAt: new Date(), // Add a timestamp
            };
            const newDocRef = collection(db, `courses/${courseId}/topics/${selectedTopic}/documents`);
            await addDoc(newDocRef, fileData);

            Alert.alert('Success', 'Document added successfully!');
            setFileName(''); // Reset the input
            setFileSize(0);
            setIsDocModalVisible(false); // Close the modal
            fetchTopics(); // Refresh the topic list
        } catch (error) {
            console.error("Error adding document:", error);
            Alert.alert('Error', 'Failed to add the document.');
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
            <Text style={styles.title}>{courseName}</Text>

            {/* Topic List */}
            <FlatList
                data={topics}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.topicItem}>
                        <Text style={styles.topicText}>{item.topicName}</Text>
                        <View style={styles.topicActions}>
                            <TouchableOpacity onPress={() => {
                                setSelectedTopic(item.id);
                                setIsDocModalVisible(true);
                            }}>
                                <Text style={styles.addDocButton}>Add Document</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => deleteTopic(item.id)}>
                                <Text style={styles.deleteButton}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={topics.length === 0 ? styles.emptyList : {}}
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
                                <Text style={styles.modalTitle}>Add New Topic</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Topic Name"
                                    value={topicName}
                                    onChangeText={(text) => setTopicName(text)}
                                    placeholderTextColor="#999"
                                />
                                <View style={styles.buttonContainer}>
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
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Modal for adding document */}
            <Modal
                visible={isDocModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDocModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsDocModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Add Document to Topic</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Document Name"
                                    value={fileName}
                                    onChangeText={(text) => setFileName(text)}
                                    placeholderTextColor="#999"
                                />
                                <Text style={styles.fileSizeText}>File Size: {fileSize} bytes</Text>
                                <TouchableOpacity onPress={async () => {
                                    const file = await DocumentPicker.pick({
                                        type: [DocumentPicker.types.allFiles],
                                    });
                                    setFileName(file.name);
                                    setFileSize(file.size);
                                }}>
                                    <Text style={styles.selectFileButton}>Select File</Text>
                                </TouchableOpacity>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.saveButton} onPress={saveDocument}>
                                        <Text style={styles.buttonText}>Add Document</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setIsDocModalVisible(false)}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
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
        fontSize: 28,
        marginBottom: 20,
        fontWeight: '500',
        color: '#1e1e1e',
    },
    topicItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    topicText: {
        fontSize: 16,
        color: '#333',
    },
    topicActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addDocButton: {
        color: '#2a5a06',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
        marginRight: 15,
    },
    deleteButton: {
        color: '#e74c3c',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 40,
        right: 40,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2a5a06',
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker background for better contrast
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#ffffff',
        padding: 25,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2a5a06',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#f9f9f9', // Light background for the input
    },
    fileSizeText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
    selectFileButton: {
        color: '#2a5a06',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#2a5a06',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginRight: 5, // Space between buttons
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#e74c3c',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginLeft: 5, // Space between buttons
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyList: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});

export default CourseManagement;
