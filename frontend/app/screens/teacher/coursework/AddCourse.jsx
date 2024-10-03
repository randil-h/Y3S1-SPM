import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, StatusBar, FlatList, Alert, TouchableOpacity, Pressable, Dimensions, Modal, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../FirebaseConfig';
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/Ionicons'; // Importing icons

const { width } = Dimensions.get('window');

const LEVEL_OPTIONS = ['1', '2', '3', '4', '5'];

const AddCourse = () => {
    const [courseName, setCourseName] = useState('');
    const [subject, setSubject] = useState('');
    const [level, setLevel] = useState('1');
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state
    const router = useRouter();

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'courses'));
            const courseList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCourses(courseList);
        } catch (error) {
            console.error("Error fetching courses:", error);
            Alert.alert('Error', 'Failed to fetch courses.');
        } finally {
            setLoading(false);
        }
    };

    const saveCourse = async () => {
        if (!courseName || !subject || !level) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            if (selectedCourseId) {
                const courseRef = doc(db, 'courses', selectedCourseId);
                await updateDoc(courseRef, { courseName, subject, level });
                Alert.alert('Success', 'Course updated successfully!');
            } else {
                const newCourseRef = doc(collection(db, 'courses'));
                await setDoc(newCourseRef, { courseName, subject, level });
                Alert.alert('Success', 'Course saved successfully!');
            }
            clearSelection();
            fetchCourses();
        } catch (error) {
            console.error("Error saving course:", error);
            Alert.alert('Error', 'Failed to save the course.');
        } finally {
            setLoading(false);
        }
    };

    const handleCoursePress = (course) => {
        setCourseName(course.courseName);
        setSubject(course.subject);
        setLevel(course.level);
        setSelectedCourseId(course.id);
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this course?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'courses', id));
                            Alert.alert('Success', 'Course deleted successfully!');
                            fetchCourses();
                        } catch (error) {
                            console.error("Error deleting course:", error);
                            Alert.alert('Error', 'Failed to delete the course.');
                        }
                    }
                }
            ]
        );
    };

    const clearSelection = () => {
        setCourseName('');
        setSubject('');
        setLevel('1');
        setSelectedCourseId(null);
        setIsModalVisible(false);
    };

    const renderLevelItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.levelItem, level === item ? styles.selectedLevel : {}]}
            onPress={() => setLevel(item)}
        >
            <Text style={styles.levelText}>{item}</Text>
        </TouchableOpacity>
    );

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* Modal for adding/editing course */}
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
                                    placeholder="Course Name"
                                    placeholderTextColor="#efefef"
                                    value={courseName}
                                    onChangeText={setCourseName}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Subject"
                                    placeholderTextColor="#efefef"
                                    value={subject}
                                    onChangeText={setSubject}
                                />
                                <View style={styles.pickerContainer}>
                                    <Text style={styles.label}>Select Level</Text>
                                    <FlatList
                                        data={LEVEL_OPTIONS}
                                        horizontal
                                        renderItem={renderLevelItem}
                                        keyExtractor={(item) => item}
                                        contentContainerStyle={styles.levelList}
                                    />
                                </View>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={saveCourse}
                                    >
                                        <Text style={styles.buttonText}>{selectedCourseId ? "Update" : "Save Course"}</Text>
                                    </TouchableOpacity>
                                    {selectedCourseId && (
                                        <TouchableOpacity
                                            style={styles.clearButton}
                                            onPress={clearSelection}
                                        >
                                            <Text style={styles.clearButtonText}>×</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={[styles.saveButton, { backgroundColor: '#ccc' }]}
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

            <View style={styles.listContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#007BFF" />
                ) : (
                    <>
                        {courses.length === 0 ? (
                            <Text>No courses available.</Text>
                        ) : (
                            <FlatList
                                data={courses}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View style={styles.courseItem}>
                                        <TouchableOpacity onPress={() => router.push({
                                            pathname: 'screens/teacher/coursework/CourseManagement',
                                            params: { courseId: item.id, courseName: item.courseName }
                                        })} style={styles.courseDetails}>
                                            <Text style={styles.courseName}>{item.courseName}</Text>
                                            <Text style={styles.courseText}>Subject: <Text style={styles.courseValue}>{item.subject}</Text></Text>
                                            {/*<Text style={styles.courseLevel}>{item.level}</Text>*/}
                                        </TouchableOpacity>
                                        <View style={styles.buttonContainer}>
                                            <TouchableOpacity
                                                style={styles.topicButton}
                                                onPress={() => handleCoursePress(item)}
                                            >
                                                <Icon name="cog" size={20} color="#fff" />
                                            </TouchableOpacity>
                                            <Pressable style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                                                <Icon name="trash-outline" size={20} color="#fff" />
                                            </Pressable>
                                        </View>
                                    </View>
                                )}
                            />
                        )}
                    </>
                )}
            </View>

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => {
                    clearSelection();
                    setIsModalVisible(true);
                }}
            >
                <Text style={styles.floatingButtonText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 30,
        paddingHorizontal: 10,
        marginHorizontal: 6,
        backgroundColor: '#f5f5f5',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        elevation: 5,
    },
    input: {
        borderBottomWidth: 1.5,
        borderColor: '#2a5a06',
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    label: {
        fontSize: 20,
        marginVertical: 10,
        marginLeft: 10,
        fontWeight: 'bold',
        color: '#2a5a06',
    },
    pickerContainer: {
        marginBottom: 20,
    },
    levelItem: {
        padding: 10,
        height: 40,
        width: 40,
        borderRadius: 25,
        backgroundColor: '#2a5a06',
        marginHorizontal: 5,
        alignItems: 'center',
    },
    selectedLevel: {
        backgroundColor: '#5cb85c',
    },
    levelText: {
        color: '#fff',
        fontSize: 16,
    },
    levelList: {
        paddingHorizontal: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#2a5a06',
        padding: 15,
        alignItems: 'center',
        borderRadius: 15,
        marginRight: 10,
    },
    clearButton: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButtonText: {
        fontSize: 24,
        color: 'red',
    },
    deleteButton: {
        backgroundColor: '#aa0000',
        padding: 10,
        borderRadius: 25,
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    courseItem: {
        backgroundColor: '#ffffff',
        padding: 15,
        marginVertical: 5,
        borderRadius: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    courseText: {
        fontSize: 16,
        color: '#1f2023',
    },
    courseValue: {
        fontWeight: 'bold',
    },
    courseDetails: {
        flex: 1,
    },
    courseName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2023',
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    topicButton: {
        backgroundColor: '#2a5a06',
        padding: 10,
        borderRadius: 25,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#2a5a06',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    floatingButtonText: {
        fontSize: 30,
        color: '#fff',
    },
});

export default AddCourse;
