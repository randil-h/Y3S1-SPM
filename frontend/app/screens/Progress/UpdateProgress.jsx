import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../FirebaseConfig'; // Ensure the path to your Firebase config is correct
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { Picker } from '@react-native-picker/picker';

const UpdateProgress = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    console.log('Received params:', params);

    const [progressData, setProgressData] = useState({
        id: '',
        studentName: '',
        studentID: '',
        studentClass: '',
        maths: '',
        english: '',
        geography: '',
        hist: '',
        science: '',
        courseworkProgress: '',
    });
    const [progressStatus, setProgressStatus] = useState(progressData.courseworkProgress || '');

    useEffect(() => {
        console.log('Params in useEffect:', params);
        console.log('ID from params:', params?.id);

        const fetchData = async () => {
            if (params?.id) {
                try {
                    console.log('Fetching document with ID:', params.id);
                    const docRef = doc(db, 'progress', params.id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setProgressData({ id: params.id, ...docSnap.data() });
                        console.log('Document data:', docSnap.data());
                    } else {
                        console.log('No such document!');
                        Alert.alert('Error', 'No such document!');
                    }
                } catch (error) {
                    console.error('Error fetching document: ', error);
                    Alert.alert('Error', 'Failed to fetch progress data');
                }
            } else {
                console.log('No ID found in params');
                Alert.alert('Error', 'No document ID found');
            }
        };

        fetchData();
    }, [params?.id]);

    const handleUpdate = async () => {
        console.log('Update initiated. Document ID:', progressData.id);
        if (!progressData.id) {
            console.log('No ID found in progressData');
            Alert.alert('Error', 'No document ID found');
            return;
        }

        try {
            const progressDocRef = doc(db, 'progress', progressData.id);
            await updateDoc(progressDocRef, {
                studentName: progressData.studentName,
                studentID: progressData.studentID,
                studentClass: progressData.studentClass,
                maths: progressData.maths,
                english: progressData.english,
                geography: progressData.geography,
                hist: progressData.hist,
                science: progressData.science,
                courseworkProgress: progressData.courseworkProgress,
            });
            console.log('Document successfully updated');
            Alert.alert('Success', 'Progress updated successfully');
            // Create a summary of updated information for speech
            const updatedInfo = `
            Student Name: ${progressData.studentName}, 
            Student ID: ${progressData.studentID}, 
            Class: ${progressData.studentClass}, 
            Maths: ${progressData.maths}, 
            English: ${progressData.english}, 
            Geography: ${progressData.geography}, 
            History: ${progressData.hist}, 
            Science: ${progressData.science}, 
            Coursework Progress: ${progressData.courseworkProgress}
        `;

            Speech.speak(`Progress updated successfully. Updated information: ${updatedInfo}`); // Include the updated info
            router.back();
        } catch (error) {
            console.error('Error updating document: ', error);
            Alert.alert('Error', 'Failed to update progress');
        }
    };

    const handleInputChange = (field, value) => {
        setProgressData(prevData => ({
            ...prevData,
            [field]: value
        }));
        Speech.speak(`Changed ${field} to ${value}`); // Provide auditory feedback on field change
    };
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Update Student Progress</Text>
            <Text style={styles.sectionTitle}>Student Information</Text>
            <View style={styles.form}>
                <Text style={styles.label}>Student Name:</Text>
                <TextInput
                    style={styles.input}
                    value={progressData.studentName}
                    onChangeText={(text) => handleInputChange('studentName', text)}
></TextInput>
                <Text style={styles.label}>Student ID:</Text>
                <TextInput
                    style={styles.input}
                    value={progressData.studentID}
                    onChangeText={(text) => handleInputChange('studentID', text)}
                />

                <Text style={styles.label}>Class:</Text>
                <TextInput
                    style={styles.input}
                    value={progressData.studentClass}
                    onChangeText={(text) => handleInputChange('studentClass', text)}
                />
            </View>
            <Text style={styles.sectionTitle}>Academic Progress</Text>
            <View style={styles.marksContainer}>
                <Text style={styles.label}>Maths Marks:</Text>
                <TextInput
                    style={styles.input}
                    value={progressData.maths}
                    onChangeText={(text) => handleInputChange('maths', text)}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>English Marks:</Text>
                <TextInput
                    style={styles.input}
                    value={progressData.english}
                    onChangeText={(text) => handleInputChange('english', text)}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Geography Marks:</Text>
                <TextInput
                    style={styles.input}
                    value={progressData.geography}
                    onChangeText={(text) => handleInputChange('geography', text)}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>History Marks:</Text>
                <TextInput
                    style={styles.input}
                    value={progressData.hist}
                    onChangeText={(text) => handleInputChange('hist', text)}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Science Marks:</Text>
                <TextInput
                    style={styles.input}
                    value={progressData.science}
                    onChangeText={(text) => handleInputChange('science', text)}
                    keyboardType="numeric"
                />
            </View>
            <Text style={styles.sectionTitle}>Coursework Progress</Text>
            <View style={styles.form}>
                <Text style={styles.label}>Progress Status:</Text>
                <Picker
                    selectedValue={progressStatus}
                    style={styles.picker}
                    onValueChange={(itemValue) => setProgressStatus(itemValue)} // Update picker state
                >
                    <Picker.Item label="Excellent" value="excellent" />
                    <Picker.Item label="Good" value="good" />
                    <Picker.Item label="Average" value="average" />
                    <Picker.Item label="Needs Improvement" value="needs_improvement" />
                </Picker>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.updateButton]} // Add styles.button here
                    onPress={handleUpdate}
                >
                    <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.closeButton]} // Add styles.button here
                    onPress={() => router.back()}
                >
                    <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 30,
        marginTop: 40,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a8e5f',
        marginBottom: 15,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 10,
        marginBottom: 20,
        fontSize: 16,
        color: '#333333',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        marginBottom: 40,
    },
    button: {
        flex: 1,
        height: 50, // Ensure a fixed height
        justifyContent: 'center', // Center the content vertically
        alignItems: 'center', // Center the content horizontally
        borderRadius: 8,
        marginHorizontal: 5,
    },
    updateButton: {
        backgroundColor: '#1a8e5f',
    },
    closeButton: {
        backgroundColor: '#333333',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 22, // Ensure lineHeight is consistent with font size
        textAlignVertical: 'center', // Center text vertically (for Android)
    },
});


export default UpdateProgress;