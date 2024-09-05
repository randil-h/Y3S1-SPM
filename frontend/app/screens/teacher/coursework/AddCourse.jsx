import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, StatusBar, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BlurView } from 'expo-blur';
import { addDoc, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../../FirebaseConfig'; // Make sure FirebaseConfig is correct

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

    // Save course to Firestore
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
                    <Picker
                        selectedValue={level}
                        style={styles.picker}
                        onValueChange={(itemValue) => setLevel(itemValue)}
                    >
                        <Picker.Item label="1" value="1" />
                        <Picker.Item label="2" value="2" />
                        <Picker.Item label="3" value="3" />
                        <Picker.Item label="4" value="4" />
                        <Picker.Item label="5" value="5" />
                    </Picker>
                </View>

                <Button
                    title={selectedCourseId ? "Update Course" : "Save Course"}
                    onPress={saveCourse}
                />
            </View>

            <View style={styles.listContainer}>
                <FlatList
                    data={courses}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleCoursePress(item)}>
                            <View style={styles.courseItem}>
                                <Text style={styles.courseText}>Course Name: {item.courseName}</Text>
                                <Text style={styles.courseText}>Subject: {item.subject}</Text>
                                <Text style={styles.courseText}>Level: {item.level}</Text>
                            </View>
                        </TouchableOpacity>
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
    picker: {
        height: 50,
        width: '100%',
        backgroundColor: '#bababa',
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
    },
    courseText: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default AddCourse;
