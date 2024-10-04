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
import Tts from 'react-native-tts';
import {FontAwesome, MaterialIcons} from "@expo/vector-icons"; // Import TTS library

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

            // Get the size of the file
            const fileSize = file[0].size; // assuming `file` object has size attribute

            await addDoc(collection(db, `courses/${courseId}/topics/${selectedTopic}/documents`), {
                fileName: file[0].name,
                fileUrl: downloadURL,
                fileSize: fileSize, // Add file size here
            });

            setDocuments(prevDocuments => ({
                ...prevDocuments,
                [selectedTopic]: [
                    ...(prevDocuments[selectedTopic] || []),
                    { id: Date.now().toString(), fileName: file[0].name, fileUrl: downloadURL, fileSize: fileSize } // Add file size here
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
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this document?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Delete canceled"),
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: async () => {
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
                    },
                    style: "destructive"
                }
            ]
        );
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
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this topic?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Delete canceled"),
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, `courses/${courseId}/topics`, topicId));
                            fetchTopics(); // Re-fetch topics after deletion
                        } catch (error) {
                            console.error("Error deleting topic:", error);
                            Alert.alert("Error", "Failed to delete topic.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
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
                                            {/* Open Button with Preview Icon */}
                                            <TouchableOpacity onPress={() => handleDocumentAccess(item.fileUrl)} style={styles.iconButton}>
                                                <FontAwesome name="eye" size={16} color="white" />
                                            </TouchableOpacity>

                                            {/* Read Aloud Button with Sound Icon */}
                                            <TouchableOpacity onPress={() => readPDFAloud(item.fileUrl)} style={styles.iconButton}>
                                                <MaterialIcons name="volume-up" size={16} color="white" />
                                            </TouchableOpacity>

                                            {/* Delete Button with Delete Icon */}
                                            <TouchableOpacity onPress={() => deleteDocument(item.id)} style={styles.iconButton}>
                                                <FontAwesome name="trash" size={16} color="white" />
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
        fontSize: 22,
    },
    iconButton: {
        backgroundColor: '#959595', // Change this color as per your theme
        padding: 5,
        borderRadius: 50, // Makes the button circular
        margin: 6, // Spacing between buttons
        justifyContent: 'center',
        alignItems: 'center',
    },
    topicActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    addDocButton: {
        color: '#2a5a06',
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
        fontSize: 14,
        color: '#515151',
    },
    accessButton: {
        color: '#2a5a06',
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
        height: 60,
        width: 60,
        backgroundColor: '#2a5a06',
        borderRadius: 30,
        padding: 10,
    },
    floatingButtonText: {
        color: '#fff',
        fontSize: 24,
        textAlign: 'center',
        justifyContent: 'center',
        textAlignVertical: 'center',
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
        borderRadius: 0,
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
        borderRadius: 0,
        padding: 10,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    saveButton: {
        backgroundColor: '#2a5a06',
        borderRadius: 0,
        padding: 10,
        flex: 1,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ccc',
        borderRadius: 0,
        padding: 10,
        flex: 1,
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
    uploadButton: {
        color: '#2a5a06',
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
        marginRight: 20, // Space between line and document text
    },
    documentContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1, // Take the remaining space
    },
});

export default CourseManagement;
