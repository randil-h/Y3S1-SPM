import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView  } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc } from "firebase/firestore";
import {db} from "../../../FirebaseConfig"; // Import from Firebase Firestore
import * as Haptics from 'expo-haptics'; // Import Haptics
import { Audio } from 'expo-av';
import {useFocusEffect} from "@react-navigation/native";
import * as Speech from "expo-speech";

const beepSound = require('../../../assets/sounds/beep.mp3');
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
    let ws;

    const router = useRouter();
    const [sound, setSound] = useState();

    useFocusEffect(
        React.useCallback(() => {
            // WebSocket connection starts when the page is focused
            ws = new WebSocket('ws://192.168.1.4:8765');  //ip address and port number of server

            ws.onopen = () => {
                console.log('WebSocket connection established');
            };

            ws.onmessage = (event) => {
                const { gesture } = JSON.parse(event.data);
                handleGesture(gesture);
            };

            ws.onclose = () => {
                console.log('WebSocket connection is closed');
            };

            // Cleanup function to close WebSocket when page is unfocused
            return () => {
                if (ws) {
                    ws.close();
                    console.log('WebSocket connection closed');
                }
            };
        }, [])
    );

    const handleGesture = (gesture) => {
        console.log(`Gesture Detected : ${gesture}`);

        if(gesture === 'Return') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            playSound();
            router.back();
        } else if (gesture === 'Submit') {
            handleSubmit();
        }
    };

    // Load sound effect
    const playSound = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(beepSound);
            setSound(sound);
            await sound.playAsync(); // Play the sound
        } catch (error) {
            console.error("Error loading or playing sound: ", error);
        }
    };

    // Cleanup the sound effect
    React.useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

// Function to handle speech
    const speak = (message) => {
        Speech.speak(message, {
            language: 'en',
            pitch: 1,
            rate: 1,
        });
    };
    const handleInputChange = (setter) => (text) => {
        setter(text);
        speak(text); // Speak the current input value
    };
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
            Alert.alert('Success', `Student ${studentName}'s progress added successfully. Document ID: ${docRef.id}`);
// Play sound and trigger haptic feedback on successful submission
            await playSound();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            speak(`Student ${studentName}'s progress has been added successfully.`);
            // Navigate back to the previous screen
            console.log('Navigating back...');
            router.back();
        } catch (error) {
            console.error('Error adding document: ', error);
            Alert.alert('Error', 'Failed to add progress: ' + error.message);
        }
    };
    const handleClose = async () => {
        // Play sound and trigger haptic feedback on close button press
        await playSound();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        speak('Closing the form.');
        console.log('Navigating back...');
        router.back();
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Add Student Progress</Text>
                <Text style={styles.pickerLabel}>Student Details</Text>
                <View style={styles.detailsContainer}>
                {/* Input fields */}
                <TextInput
                    style={styles.input}
                    placeholder="Student Name"
                    value={studentName}
                    onChangeText={handleInputChange(setStudentName)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Student ID"
                    value={studentID}
                    onChangeText={handleInputChange(setStudentID)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Student Class"
                    value={studentClass}
                    onChangeText={handleInputChange(setStudentClass)}
                />
                </View>
                {/* Grades */}
                <Text style={styles.pickerLabel}>Grades</Text>
                <View style={styles.detailsContainer}>
                <View style={styles.inputContainer}>
                    <View style={styles.inputGroupLeft}>
                        <TextInput
                            style={styles.inputLarge}
                            placeholder="Maths"
                            keyboardType="numeric"
                            value={maths}
                            onChangeText={handleInputChange(setMaths)}
                        />
                        <TextInput
                            style={styles.inputLarge}
                            placeholder="English"
                            keyboardType="numeric"
                            value={english}
                            onChangeText={handleInputChange(setEnglish)}
                        />
                        <TextInput
                            style={styles.inputLarge}
                            placeholder="Geography"
                            keyboardType="numeric"
                            value={geography}
                            onChangeText={handleInputChange(setGeography)}
                        />
                    </View>
                    <View style={styles.inputGroupRight}>
                        <TextInput
                            style={styles.inputSmall}
                            placeholder="History"
                            keyboardType="numeric"
                            value={hist}
                            onChangeText={handleInputChange(setHistory)}
                        />
                        <TextInput
                            style={styles.inputSmall}
                            placeholder="Science"
                            keyboardType="numeric"
                            value={science}
                            onChangeText={handleInputChange(setScience)}
                        />
                    </View>
                </View>
                </View>
                {/* Coursework Progress */}
                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Coursework Progress</Text>
                    <View style={styles.detailsContainer}>
                    <Picker
                        selectedValue={courseworkProgress}
                        style={styles.picker}
                        onValueChange={(itemValue) => {
                            setCourseworkProgress(itemValue);
                            speak(itemValue); // Speak the selected value
                        }}
                        >
                        <Picker.Item label="Excellent" value="excellent" />
                        <Picker.Item label="Good" value="good" />
                        <Picker.Item label="Average" value="average" />
                        <Picker.Item label="Need Improvement" value="need_improvement" />
                    </Picker>
                </View>
                </View>
                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={handleClose}>
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
        backgroundColor: '#ffffff',
    },
    formContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    formTitle: {
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
    inputContainer: {
        marginBottom: 20,
    },
    inputGroupLeft: {
        marginBottom: 10,
    },
    inputGroupRight: {
        marginBottom: 10,
    },
    inputLarge: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 10,
        marginBottom: 15,
        fontSize: 16,
        color: '#333333',
    },
    inputSmall: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 10,
        marginBottom: 15,
        fontSize: 16,
        color: '#333333',
    },
    pickerContainer: {
        marginBottom: 20,
        borderWidth: 1, // Add border width
    },
    pickerLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a8e5f',
        marginBottom: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        marginBottom: 40,
    },
    button: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 5,
    },
    submitButton: {
        backgroundColor: '#1a8e5f',
    },
    closeButton: {
        backgroundColor: '#333333',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 22,
        textAlignVertical: 'center',
    },
    detailsContainer: {
        marginBottom: 20,
    },
});

export default AddProgress;
