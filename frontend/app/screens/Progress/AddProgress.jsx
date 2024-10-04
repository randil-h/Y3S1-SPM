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
        backgroundColor: '#F0F4F8',
    },
    formContainer: {
        flex: 1,
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        margin: 16,
        marginTop: 30,
    },
    formTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2C3E50',
        marginBottom: 24,
        textAlign: 'center',
        letterSpacing: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#34495E',
        marginTop: 24,
        marginBottom: 16,
    },
    input: {
        width: '100%',
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#BDC3C7',
        borderRadius: 8,
        backgroundColor: '#ECF0F1',
        fontSize: 16,
        color: '#2C3E50',
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    inputGroupLeft: {
        width: '48%',
    },
    inputGroupRight: {
        width: '48%',
    },
    inputLarge: {
        width: '100%',
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#BDC3C7',
        borderRadius: 8,
        backgroundColor: '#ECF0F1',
        fontSize: 16,
        color: '#2C3E50',
    },
    inputSmall: {
        width: '100%',
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#BDC3C7',
        borderRadius: 8,
        backgroundColor: '#ECF0F1',
        fontSize: 16,
        color: '#2C3E50',
    },
    pickerContainer: {
        marginBottom: 16,
    },
    pickerLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495E',
        marginBottom: 8,
    },
    picker: {
        height: 50,
        borderWidth: 1,
        borderColor: '#BDC3C7',
        borderRadius: 8,
        backgroundColor: '#ECF0F1',
        color: '#2C3E50',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
        paddingHorizontal: 16,
    },
    button: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButton: {
        backgroundColor: '#2980B9',
        marginRight: 8,
    },
    closeButton: {
        backgroundColor: '#F44336',
        marginLeft: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    detailsContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 16,
    },
});

export default AddProgress;
