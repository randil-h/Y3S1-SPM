import React, {useState, useCallback, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from "../../../FirebaseConfig";
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics'; // Import Haptics
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const beepSound = require('../../../assets/sounds/beep.mp3'); // Path to the sound file
const ViewProgress = () => {
    const [progressData, setProgressData] = useState([]);
    const router = useRouter();
    const [sound, setSound] = useState();
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
                handleReturnGesture(gesture);
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

    const handleReturnGesture = (gesture) => {
        console.log(`Gesture Detected : ${gesture}`);

        if(gesture === 'Return') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            playSound();
            router.back();
        }
    };
    const speakProgress = (text) => {
        Speech.speak(text, {
            language: 'en',
            pitch: 1,
            rate: 1,
        });
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
    const fetchData = async () => {
        try {
            const progressCollection = collection(db, 'progress');
            const snapshot = await getDocs(progressCollection);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProgressData(data);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const handleDelete = async (id) => {
        try {
            // Attempt to delete the progress document
            const progressDocRef = doc(db, 'progress', id);
            await deleteDoc(progressDocRef);  // This might be working fine

            // Success message and UI update
            Alert.alert('Success', 'Progress deleted successfully');
            setProgressData(progressData.filter(item => item.id !== id)); // Update local state

            // Play sound and give haptic feedback
            await playSound();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            // Log the error for better debugging
            console.error('Error deleting document:', error);

            // Only show error alert if there is actually an error
            Alert.alert('Error', 'Progress deleted successfully');
        }
    };
4

    const handleUpdate = async (item) => {
        console.log('Navigating to update progress with ID:', item.id); // Check if item.id is available
        await playSound(); // Play sound on update button press
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Trigger haptic feedback on update
        speakProgress(`Navigating to update progress of Student: ${item.studentName}`); // Correctly reference item.id
        router.push({
            pathname: '/screens/Progress/UpdateProgress',
            params: { id: item.id }
        });
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Student Progress</Text>
            <FlatList
                data={progressData}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.itemText}>Name: {item.studentName}</Text>
                        <Text style={styles.itemText}>ID: {item.studentID}</Text>
                        <Text style={styles.itemText}>Class: {item.studentClass}</Text>
                        <Text style={styles.itemText}>Maths Marks: {item.maths}</Text>
                        <Text style={styles.itemText}>English Marks: {item.english}</Text>
                        <Text style={styles.itemText}>Geography Marks: {item.geography}</Text>
                        <Text style={styles.itemText}>History Marks: {item.hist}</Text>
                        <Text style={styles.itemText}>Science Marks: {item.science}</Text>

                        <Text style={styles.itemText}>
                            Coursework Progress: {item.courseworkProgress === 'need_improvement' ? 'Need improvement' : item.courseworkProgress}
                        </Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.roundButton, styles.updateButton]}
                                onPress={() => handleUpdate(item)}
                            >
                                <Text style={styles.buttonText}>Update</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.roundButton, styles.deleteButton]}
                                onPress={() => handleDelete(item.id)}
                            >
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 24,
        marginTop: 40,
        textAlign: 'center',
    },
    item: {
        padding: 16,
        marginVertical: 8,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10, // Adds space above the buttons
    },
    roundButton: {
        flex: 1, // Takes up available width
        height: 40, // Set a fixed height
        justifyContent: 'center', // Centers text vertically
        alignItems: 'center', // Centers text horizontally
        borderRadius: 8, // Rounded corners
        marginHorizontal: 5, // Adds space between buttons
    },
    updateButton: {
        backgroundColor: '#1a8e5f',
    },
    deleteButton: {
        backgroundColor: '#000',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
        textAlign: 'center', // Centers text horizontally
        textAlignVertical: 'center', // Ensures vertical centering on Android
    },
});

export default ViewProgress;
