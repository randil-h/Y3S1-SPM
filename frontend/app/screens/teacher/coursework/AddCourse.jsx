import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, StatusBar, FlatList, Alert, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../FirebaseConfig'; // Make sure FirebaseConfig is correct

const { width } = Dimensions.get('window'); // Get screen width for horizontal layout

const AddCourse = () => {
    const [courseName, setCourseName] = useState('');
    const [subject, setSubject] = useState('');
    const [level, setLevel] = useState('1');
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    // Fetch courses from Firestore
    const fetchCourses = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'courses'));
            const courseList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCourses(courseList);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    // Save or update course to Firestore
    const saveCourse = async () => {
        console.log("Saving Course with the following data:");
        console.log({ courseName, subject, level });

        if (courseName === '' || subject === '' || level === '') {
            Alert.alert('Error', 'Please fill in all fields.');
            console.log("Form submission failed: Missing fields");
            return;
        }

        try {
            if (selectedCourseId) {
                // Update existing course
                const courseRef = doc(db, 'courses', selectedCourseId);
                await updateDoc(courseRef, {
                    courseName,
                    subject,
                    level,
                });
                console.log("Course updated successfully!");
                Alert.alert('Success', 'Course updated successfully!');
            } else {
                // Add new course
                await addDoc(collection(db, 'courses'), {
                    courseName,
                    subject,
                    level,
                });
                console.log("Course saved successfully!");
                Alert.alert('Success', 'Course saved successfully!');
            }

            // Reset form
            setCourseName('');
            setSubject('');
            setLevel('1');
            setSelectedCourseId(null);

            // Refresh the course list
            fetchCourses();
        } catch (error) {
            console.error("Error saving course:", error);
            Alert.alert('Error', 'Failed to save the course.');
        }
    };

    // Handle course selection
    const handleCoursePress = (course) => {
        setCourseName(course.courseName);
        setSubject(course.subject);
        setLevel(course.level);
        setSelectedCourseId(course.id);
    };

    // Handle course deletion
    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'courses', id));
            console.log("Course deleted successfully!");
            Alert.alert('Success', 'Course deleted successfully!');
            fetchCourses(); // Refresh the course list
        } catch (error) {
            console.error("Error deleting course:", error);
            Alert.alert('Error', 'Failed to delete the course.');
        }
    };

    // Clear selected course
    const clearSelection = () => {
        setCourseName('');
        setSubject('');
        setLevel('1');
        setSelectedCourseId(null);
    };

    // Horizontal level selector
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

            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Course Name"
                    value={courseName}
                    onChangeText={(text) => setCourseName(text)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Subject"
                    value={subject}
                    onChangeText={(text) => setSubject(text)}
                />

                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Select Level</Text>
                    <FlatList
                        data={['1', '2', '3', '4', '5']}
                        horizontal
                        renderItem={renderLevelItem}
                        keyExtractor={(item) => item}
                        contentContainerStyle={styles.levelList}
                    />
                </View>

                <Button
                    title={selectedCourseId ? "Update Course" : "Save Course"}
                    onPress={saveCourse}
                />

                {selectedCourseId && (
                    <Button
                        title="Clear"
                        onPress={clearSelection}
                        color="#e74c3c"
                    />
                )}
            </View>

            <View style={styles.listContainer}>
                <FlatList
                    data={courses}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.courseItem}>
                            <TouchableOpacity onPress={() => handleCoursePress(item)}>
                                <View>
                                    <Text style={styles.courseText}>Course Name: {item.courseName}</Text>
                                    <Text style={styles.courseText}>Subject: {item.subject}</Text>
                                    <Text style={styles.courseText}>Level: {item.level}</Text>
                                </View>
                            </TouchableOpacity>
                            <Pressable style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </Pressable>
                        </View>
                    )}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    formContainer: {
        paddingTop: 30,
        paddingHorizontal: 20,
        backgroundColor: '#efefef',
    },
    input: {
        width: '100%',
        height: 40,
        backgroundColor: '#bababa',
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    pickerContainer: {
        width: '100%',
        marginBottom: 20,
    },
    levelList: {
        flexDirection: 'row',
    },
    levelItem: {
        backgroundColor: '#bababa',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginRight: 10,
    },
    selectedLevel: {
        backgroundColor: '#007BFF',
    },
    levelText: {
        color: '#fff',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    courseItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    courseText: {
        fontSize: 16,
        marginBottom: 5,
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AddCourse;
