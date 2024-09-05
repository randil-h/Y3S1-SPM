import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from "../../../FirebaseConfig";
import { useRouter, useLocalSearchParams } from 'expo-router';

const UpdateProgress = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
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
        if (params && params.id && params.id !== progressData.id) {
            setProgressData({
                id: params.id || '',
                studentName: params.studentName || '',
                studentID: params.studentID || '',
                studentClass: params.studentClass || '',
                maths: params.maths || '',
                english: params.english || '',
                geography: params.geography || '',
                hist: params.hist || '',
                science: params.science || '',
                courseworkProgress: params.courseworkProgress || '',
            });
        }
    }, [params]);

    const handleUpdate = async () => {
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
            Alert.alert('Success', 'Progress updated successfully');
            router.back(); // Navigate back to the ViewProgress screen
        } catch (error) {
            Alert.alert('Error', 'Failed to update progress');
            console.error('Error updating document: ', error);
        }
    };

    const handleInputChange = (field, value) => {
        setProgressData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Update Student Progress</Text>
            <View style={styles.form}>
                <Text style={styles.label}>Student Name:</Text>
                <TextInput
                    style={styles.input}
                    value={progressData.studentName}
                    onChangeText={(text) => handleInputChange('studentName', text)}
                />

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

                <Text style={styles.label}>Coursework Progress:</Text>
                <TextInput
                    style={styles.input}
                    value={progressData.courseworkProgress}
                    onChangeText={(text) => handleInputChange('courseworkProgress', text)}
                />

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
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    form: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 15,
        borderRadius: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Space out buttons horizontally
        alignItems: 'center', // Center buttons vertically
        marginTop: 20,
        paddingHorizontal: 20, // Adjust if necessary
    },
    roundButton: {
        width: 100, // Width and height to make the button round
        height: 100,
        borderRadius: 50, // Half of width/height to make it round
        justifyContent: 'center', // Center text vertically
        alignItems: 'center', // Center text horizontally
    },
    updateButton: {
        backgroundColor: '#4CAF50', // Green for Update
    },
    closeButton: {
        backgroundColor: '#F44336', // Red for Close
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default UpdateProgress;