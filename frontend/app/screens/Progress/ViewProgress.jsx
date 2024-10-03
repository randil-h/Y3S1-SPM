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
            const progressDocRef = doc(db, 'progress', id);
            await deleteDoc(progressDocRef);
            Alert.alert('Success', 'Progress deleted successfully');
            setProgressData(progressData.filter(item => item.id !== id));
            await playSound(); // Play sound on successful deletion
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            speakProgress(`Navigating to update progress for student ID: ${item.id}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to delete progress');
            console.error('Error deleting document: ', error);
        }
    };

    const handleUpdate = async (item) => {
        console.log('Navigating to update progress with ID:', item.id); // Check if item.id is available
        await playSound(); // Play sound on update button press
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Trigger haptic feedback on update
        speakProgress(`Navigating to update progress for student ID: ${item.id}`); // Correctly reference item.id
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
        padding: 20,
        backgroundColor: '#F0F4F8', // Light blue-gray background
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#2C3E50',
        marginBottom: 24,
        marginTop: 40,
        textAlign: 'center',
        letterSpacing: 1,
    },
    item: {
        padding: 20,
        marginVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    itemText: {
        fontSize: 16,
        color: '#34495E',
        marginBottom: 8,
        fontWeight: '500',
    },
    courseworkText: {
        fontSize: 18,
        color: '#E74C3C',
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    roundButton: {
        width: 130,
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
    deleteButton: {
        backgroundColor: '#E74C3C',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 1,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    studentName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C3E50',
    },
    studentID: {
        fontSize: 14,
        color: '#7F8C8D',
        fontWeight: '500',
    },
    marksContainer: {
        backgroundColor: '#ECF0F1',
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    marksTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 8,
    },
    markItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    markLabel: {
        fontSize: 14,
        color: '#34495E',
    },
    markValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2980B9',
    },
});

export default ViewProgress;
