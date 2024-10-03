import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Alert,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    ActivityIndicator
} from 'react-native';
import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import { db, storage } from '../../../../FirebaseConfig'; // Adjust the import based on your structure
import { useGlobalSearchParams } from 'expo-router';
import { Linking } from 'react-native';
import Tts from 'react-native-tts'; // Import TTS library

const CourseManagement = () => {
    const { courseId, courseName } = useGlobalSearchParams();
    const [topics, setTopics] = useState([]);
    const [documents, setDocuments] = useState({});
    const [topicName, setTopicName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDocModalVisible, setIsDocModalVisible] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch topics from Firestore
    const fetchTopics = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, `courses/${courseId}/topics`));
            const topicList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTopics(topicList);

            const documentsMap = {};
            for (const topic of topicList) {
                const docs = await getDocs(collection(db, `courses/${courseId}/topics/${topic.id}/documents`));
                documentsMap[topic.id] = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
            setDocuments(documentsMap);

            if (topicList.length > 0) {
                const firstTopicId = topicList[0].id;
                setSelectedTopic(firstTopicId);
            }
        } catch (error) {
            console.error("Error fetching topics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle saving a new topic
    const saveTopic = async () => {
        if (!topicName.trim()) {
            Alert.alert("Error", "Please enter a topic name.");
            return;
        }

        try {
            await addDoc(collection(db, `courses/${courseId}/topics`), { topicName });
            setTopicName('');
            setIsModalVisible(false);
            fetchTopics();
        } catch (error) {
            console.error("Error adding topic:", error);
            Alert.alert("Error", "Failed to add topic.");
        }
    };

    // Function to handle saving a document
    const saveDocument = async () => {
        if (!file) {
            Alert.alert("Error", "Please select a file.");
            return;
        }

        try {
            const response = await fetch(file[0].uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `courses/${courseId}/topics/${selectedTopic}/documents/${file[0].name}`);

            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, `courses/${courseId}/topics/${selectedTopic}/documents`), {
                fileName: file[0].name,
                fileUrl: downloadURL,
            });

            setDocuments(prevDocuments => ({
                ...prevDocuments,
                [selectedTopic]: [
                    ...(prevDocuments[selectedTopic] || []),
                    { id: Date.now().toString(), fileName: file[0].name, fileUrl: downloadURL }
                ],
            }));

            setFile(null);
            setIsDocModalVisible(false);
        } catch (error) {
            console.error("Error uploading document:", error);
            Alert.alert("Error", "Failed to upload document.");
        }
    };

    // Function to delete a document
    const deleteDocument = async (topicId, documentId) => {
        try {
            await deleteDoc(doc(db, `courses/${courseId}/topics/${topicId}/documents`, documentId));
            // Update the documents state
            setDocuments(prevDocuments => {
                const updatedDocs = { ...prevDocuments };
                updatedDocs[topicId] = updatedDocs[topicId].filter(doc => doc.id !== documentId);
                return updatedDocs;
            });
        } catch (error) {
            console.error("Error deleting document:", error);
            Alert.alert("Error", "Failed to delete document.");
        }
    };

    // Function to handle opening a document
    const handleDocumentAccess = (fileUrl) => {
        Linking.openURL(fileUrl);
    };

    // Function to read PDF aloud
    const readPDFAloud = async (fileUrl) => {
        // Here you would implement logic to extract text from PDF
        // This is a placeholder implementation:
        const textToRead = "This is a placeholder text for the PDF content."; // Replace with extracted text
        Tts.speak(textToRead);
    };

    // Function to delete a topic
    const deleteTopic = async (topicId) => {
        try {
            await deleteDoc(doc(db, `courses/${courseId}/topics`, topicId));
            fetchTopics();
        } catch (error) {
            console.error("Error deleting topic:", error);
            Alert.alert("Error", "Failed to delete topic.");
        }
    };

    // Effect to fetch topics on component mount
    useEffect(() => {
        fetchTopics();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{courseName}</Text>

            {loading && <ActivityIndicator size="large" color="#007BFF" />}

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
                        {documents[item.id] && documents[item.id].length > 0 && (
                            <FlatList
                                data={documents[item.id]}
                                keyExtractor={(doc) => doc.id}
                                renderItem={({ item }) => (
                                    <View style={styles.documentItem}>
                                        {/* Vertical Line */}
                                        <View style={styles.verticalLine} />
                                        <View style={styles.documentContent}>
                                            <Text style={styles.documentText}>{item.fileName}</Text>
                                            <TouchableOpacity onPress={() => handleDocumentAccess(item.fileUrl)}>
                                                <Text style={styles.accessButton}>Open</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => readPDFAloud(item.fileUrl)}>
                                                <Text style={styles.accessButton}>Read Aloud</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => deleteDocument(item.id, item.id)}>
                                                <Text style={styles.accessButton}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                                style={styles.documentList}
                                contentContainerStyle={styles.documentListContainer}
                            />
                        )}

                    </View>
                )}
                contentContainerStyle={topics.length === 0 ? styles.emptyList : {}}
            />

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => setIsModalVisible(true)}
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
                                <Text style={styles.modalTitle}>Add Document</Text>
                                <TouchableOpacity onPress={async () => {
                                    const result = await DocumentPicker.pick({
                                        type: [DocumentPicker.types.allFiles],
                                    });
                                    setFile(result);
                                }}>
                                    <Text style={styles.uploadButton}>{file ? file[0].name : "Upload Document"}</Text>
                                </TouchableOpacity>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.saveButton} onPress={saveDocument}>
                                        <Text style={styles.buttonText}>Upload Document</Text>
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
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    topicItem: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    topicText: {
        fontSize: 18,
    },
    topicActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    addDocButton: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
    deleteButton: {
        color: 'red',
        fontWeight: 'bold',
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        paddingLeft: 10, // Add padding to indent
    },
    documentText: {
        flex: 1,
        fontSize: 16,
    },
    accessButton: {
        color: '#007BFF',
        marginHorizontal: 5,
    },
    documentList: {
        marginTop: 10,
    },
    documentListContainer: {
        paddingVertical: 10,
    },
    floatingButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#007BFF',
        borderRadius: 30,
        padding: 10,
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
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    saveButton: {
        backgroundColor: '#007BFF',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
    uploadButton: {
        color: '#007BFF',
        marginBottom: 20,
    },
    emptyList: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    verticalLine: {
        width: 2, // Width of the vertical line
        height: '100%', // Full height
        backgroundColor: '#ccc', // Color of the line
        marginRight: 10, // Space between line and document text
    },
    documentContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1, // Take the remaining space
    },
});

export default CourseManagement;
