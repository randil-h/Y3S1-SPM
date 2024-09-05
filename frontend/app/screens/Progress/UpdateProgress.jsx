import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../FirebaseConfig'; // Ensure the path to your Firebase config is correct
import { useRouter, useLocalSearchParams } from 'expo-router';

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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    roundButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateButton: {
        backgroundColor: '#4CAF50',
    },
    closeButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default UpdateProgress;