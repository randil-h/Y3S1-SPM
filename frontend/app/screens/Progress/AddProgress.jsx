import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView  } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc } from "firebase/firestore";
import {db} from "../../../FirebaseConfig"; // Import from Firebase Firestore


const AddProgress = () => {
    const [studentName, setStudentName] = useState('');
    const [studentID, setStudentID] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [courseworkProgress, setCourseworkProgress] = useState('');
    const [maths, setMaths] = useState('');
    const [english, setEnglish] = useState('');
    const [geography, setGeography] = useState('');
    const [hist, setHistory] = useState('');
    const [science, setScience] = useState('');

    const router = useRouter();

    const handleSubmit = async () => {
        console.log('Submitting data...');
        if (!studentName || !studentID || !studentClass || !courseworkProgress || !maths || !english || !geography || !hist || !science) {
            console.log('Validation failed');
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            console.log('Adding document to Firestore...');
            const docRef = await addDoc(collection(db, 'progress'), {
                studentName,
                studentID,
                studentClass,
                courseworkProgress,
                maths,
                english,
                geography,
                hist,
                science,
                createdAt: new Date(),
            });
            console.log('Document written with ID: ', docRef.id);
            Alert.alert('Success', `Student ${studentName}'s progress added successfully`);
            router.back();
        } catch (error) {
            console.error('Error adding document: ', error);
            Alert.alert('Error', 'Failed to add progress');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Add Student Progress</Text>
            <Text style={styles.pickerLabel}>Student Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Student Name"
                value={studentName}
                onChangeText={setStudentName}
            />
            <Text style={styles.pickerLabel}>Student ID</Text>
            <TextInput
                style={styles.input}
                placeholder="Student ID"
                value={studentID}
                onChangeText={setStudentID}
            />
            <Text style={styles.pickerLabel}>Student's Class</Text>
            <TextInput
                style={styles.input}
                placeholder="Student Class"
                value={studentClass}
                onChangeText={setStudentClass}
            />
            <Text style={styles.pickerLabel}>Grades</Text>
            <View style={styles.inputContainer}>
                <View style={styles.inputGroupLeft}>
                    <TextInput
                        style={styles.inputLarge}
                        placeholder="Maths"
                        keyboardType="numeric"
                        value={maths}
                        onChangeText={setMaths}
                    />
                    <TextInput
                        style={styles.inputLarge}
                        placeholder="English"
                        keyboardType="numeric"
                        value={english}
                        onChangeText={setEnglish}
                    />
                    <TextInput
                        style={styles.inputLarge}
                        placeholder="Geography"
                        keyboardType="numeric"
                        value={geography}
                        onChangeText={setGeography}
                    />
                </View>
                <View style={styles.inputGroupRight}>
                    <TextInput
                        style={styles.inputSmall}
                        placeholder="History"
                        keyboardType="numeric"
                        value={hist}
                        onChangeText={setHistory}
                    />
                    <TextInput
                        style={styles.inputSmall}
                        placeholder="Science"
                        keyboardType="numeric"
                        value={science}
                        onChangeText={setScience}
                    />
                </View>
            </View>
            <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Coursework Progress</Text>
                <Picker
                    selectedValue={courseworkProgress}
                    style={styles.picker}
                    onValueChange={(itemValue) => setCourseworkProgress(itemValue)}
                >
                    <Picker.Item label="Excellent" value="excellent" />
                    <Picker.Item label="Good" value="good" />
                    <Picker.Item label="Average" value="average" />
                    <Picker.Item label="Need Improvement" value="need_improvement" />
                </Picker>
            </View>

            {/* Container for buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.roundButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.roundButton} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
</ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    formContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop:20,
    },
    pickerContainer: {
        width: '100%',
        marginVertical: 10,
    },
    pickerLabel: {
        fontSize: 16,
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    inputGroupLeft: {
        width: '48%',
    },
    inputGroupRight: {
        width: '48%',
    },
    inputLarge: {
        width: '100%',
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#fff',
        height: 135 / 3, // Height for Maths, English, Geography
    },
    inputSmall: {
        width: '100%',
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#fff',
        height: 90 / 2, // One-third of the height of inputLarge
    },
    picker: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    input: {
        width: '100%',
        padding: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Space between the buttons
        marginTop: 20,
    },
    roundButton: {
        backgroundColor: '#007BFF', // Change to your desired color
        width: 120, // Set width and height to make the button round
        height: 120,
        borderRadius: 60, // Half of width/height to make it round
        justifyContent: 'center', // Center the text vertically
        alignItems: 'center', // Center the text horizontally
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default AddProgress;
