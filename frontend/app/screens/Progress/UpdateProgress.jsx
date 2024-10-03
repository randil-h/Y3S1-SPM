import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../FirebaseConfig'; // Ensure the path to your Firebase config is correct
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';

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
                <TextInput
                    style={styles.input}
                    value={progressData.courseworkProgress}
                    onChangeText={(text) => handleInputChange('courseworkProgress', text)}
                />
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.roundButton, styles.updateButton]}
                    onPress={handleUpdate}
                >
                    <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.roundButton, styles.closeButton]}
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
        padding: 20,
        backgroundColor: '#F0F4F8', // Light blue-gray background
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2C3E50',
        marginBottom: 24,
        marginTop: 40,
        textAlign: 'center',
        letterSpacing: 1,
    },
    form: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
        color: '#34495E',
    },
    input: {
        borderWidth: 1,
        borderColor: '#BDC3C7',
        padding: 12,
        marginBottom: 20,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#ECF0F1',
        color: '#2C3E50',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32,
        paddingBottom: 30,
    },
    roundButton: {
        width: 140,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    updateButton: {
        backgroundColor: '#3498DB',
    },
    closeButton: {
        backgroundColor: '#E74C3C',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C3E50',
        marginTop: 24,
        marginBottom: 16,
    },
    marksContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
    },
});

export default UpdateProgress;