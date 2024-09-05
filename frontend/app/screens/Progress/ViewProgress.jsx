import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from "../../../FirebaseConfig";
import { useRouter } from 'expo-router'; // Use router to navigate to update screen

const ViewProgress = () => {
    const [progressData, setProgressData] = useState([]);
    const router = useRouter();

    useEffect(() => {
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

        fetchData();
    }, []);

    // Function to delete a document
    const handleDelete = async (id) => {
        try {
            const progressDocRef = doc(db, 'progress', id);
            await deleteDoc(progressDocRef);
            Alert.alert('Success', 'Progress deleted successfully');
            // Refresh the list after deletion
            setProgressData(progressData.filter(item => item.id !== id));
        } catch (error) {
            Alert.alert('Error', 'Failed to delete progress');
            console.error('Error deleting document: ', error);
        }
    };

    // Function to navigate to the update screen with the selected progress data
    const handleUpdate = (item) => {
        router.push({
            pathname: '/updateProgress',
            params: { item }, // Pass the selected progress item
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
                        <Text>Maths: {item.maths}</Text>
                        <Text>English: {item.english}</Text>
                        <Text>Geography: {item.geography}</Text>
                        <Text>History: {item.hist}</Text>
                        <Text>Science: {item.science}</Text>
                        <Text>Coursework Progress: {item.courseworkProgress}</Text>

                        {/* Update and Delete buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={() => handleUpdate(item)}
                            >
                                <Text style={styles.buttonText}>Update</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteButton}
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
        marginTop: 10,
    },
    updateButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#F44336',
        padding: 10,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ViewProgress;
