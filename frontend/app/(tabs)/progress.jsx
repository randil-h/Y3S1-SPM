import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter
import * as Haptics from 'expo-haptics'; // Import Haptics
import { Audio } from 'expo-av';
import {useFocusEffect} from "@react-navigation/native";
import * as Speech from 'expo-speech'; // Import expo-speech

const beepSound = require('../../assets/sounds/soft_beep.mp3'); // Path to the sound file

const Progress = () => {
    const router = useRouter(); // Initialize router
    const [sound, setSound] = useState();
    const [navigating, setNavigating] = useState(false);
    let ws;

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
// Function to handle speech
    const speakProgress = (text) => {
        Speech.speak(text, {
            language: 'en',
            pitch: 1,
            rate: 1,
        });
    };
    const handleGesture = (gesture) => {
        if (navigating) return;
        console.log(`Gesture detected: ${gesture}`);

        switch (gesture) {
            case 'Selected answer: One':
                setNavigating(true);

                router.push('/screens/Progress/ViewProgress');
                break;
            case 'Selected answer: Two':
                setNavigating(true);

                router.push('/screens/Progress/AddProgress');
                break;
            case 'Selected answer: Three':
                setNavigating(true);

                router.push('/screens/Progress/ProgressSummary');
                break;
            default:
                speak("Unknown action");
                break;
        }
    };

    // Load sound effect
    async function playSound() {
        try {
            const { sound } = await Audio.Sound.createAsync(beepSound); // Use the required sound file
            setSound(sound);
            await sound.playAsync(); // Play the sound
        } catch (error) {
            console.error("Error loading or playing sound: ", error);
        }
    }

    // Cleanup the sound effect
    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const handleButtonPress = async (action) => {
        console.log(`${action} button pressed`);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Trigger haptic feedback
        await playSound(); // Play the sound
    };

    return (
        <View style={styles.container}>
            <Text style={styles.topic}>Student Progress</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    handleButtonPress('View Progress');
                    router.push('/screens/Progress/ViewProgress');
                    speakProgress("Navigating to view student progress");
                }}
                accessibilityLabel="View Progress"
                accessibilityHint="Navigates to the page where you can view detailed student progress"
                accessibilityRole="button"
            >
                <Text style={styles.buttonText}>View Progress</Text>
                <Text style={styles.buttonSubText}>Check the progress of students over time</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    handleButtonPress('Add Progress');
                    router.push('/screens/Progress/AddProgress');
                    speakProgress("Navigating to add student progress");
                }}
                accessibilityLabel="Add Student"
                accessibilityHint="Navigates to the page where you can add new student information"
                accessibilityRole="button"
            >
                <Text style={styles.buttonText}>Add Student Progress</Text>
                <Text style={styles.buttonSubText}>Enter new progress details for students</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    handleButtonPress('Progress Summary');
                    router.push('/screens/Progress/ProgressSummary');
                    speakProgress("Navigating to student progress summary");
                }}
                accessibilityLabel="Display Progress Summary"
                accessibilityHint="Navigates to the page where you can view a summary of student progress"
                accessibilityRole="button"
            >
                <Text style={styles.buttonText}>Progress Summary</Text>
                <Text style={styles.buttonSubText}>View a summary of all students' progress</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-around', // Space between buttons
        alignItems: 'center',
        marginTop: 20,
        padding: 20,
        backgroundColor: '#f2f5f8', // Light background color
    },
    button: {
        backgroundColor: '#fff', // Card-like white background
        width: 300,
        height: 180,
        borderRadius: 25, // Card-like rounded corners
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', // Shadow for depth
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6, // Android shadow
        paddingHorizontal: 20, // Padding similar to card style
        paddingVertical: 20,
        marginVertical: 10, // Adds spacing between buttons
    },
    buttonText: {
        fontSize: 20, // Consistent font size
        fontWeight: 'bold', // Similar to card title
        color: '#333', // Darker text for better contrast
        textAlign: 'center', // Centered text
    },
    buttonSubText: {
        fontSize: 14, // Smaller than the main button text
        color: 'grey', // Grey color for additional text
        marginTop: 8, // Some space between main text and subtext
        textAlign: 'center', // Center the subtext
    },
    topic: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000', // Blue color for the title
        marginBottom: 20,
        marginTop: 20, // Spacing below the topic text
    },
});


export default Progress;
