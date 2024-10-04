import React, {useState, useCallback, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from "../../../FirebaseConfig";
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics'; // Import Haptics
import { Audio } from 'expo-av';
import UseWebSocket from "../../../components/gesture/UseWebSocket";

const beepSound = require('../../../assets/sounds/beep.mp3'); // Path to the sound file
const ViewProgress = () => {
    const [progressData, setProgressData] = useState([]);
    const router = useRouter();
    const [sound, setSound] = useState();

    const handleReturnGesture = async (gesture) => {
        console.log(`Gesture Detected : ${gesture}`);

        if(gesture === 'Return') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            playSound();
            router.back();
        }
    };

    UseWebSocket(handleReturnGesture);

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
        } catch (error) {
            Alert.alert('Error', 'Failed to delete progress');
            console.error('Error deleting document: ', error);
        }
    };

    const handleUpdate = async (item) => {
        console.log('Navigating to update progress with ID:', item.id);
        await playSound(); // Play sound on update button press
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Trigger haptic feedback on update
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
                        <Text>Name: {item.studentName}</Text>
                        <Text>ID: {item.studentID}</Text>
                        <Text>Class: {item.studentClass}</Text>
                        <Text>Maths Marks: {item.maths}</Text>
                        <Text>English Marks: {item.english}</Text>
                        <Text>Geography Marks: {item.geography}</Text>
                        <Text>History Marks: {item.hist}</Text>
                        <Text>Science Marks: {item.science}</Text>

                        <Text>
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
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop:20,
    },
    item: {
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
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
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateButton: {
        backgroundColor: '#80AF81',
    },
    closeButton: {
        backgroundColor: '#F44336',
    },
    deleteButton: {
        backgroundColor: '#FF5722',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ViewProgress;
