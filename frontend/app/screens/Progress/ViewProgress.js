import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const ViewProgress = () => {
    const [progressData, setProgressData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data from Firestore
                const snapshot = await firestore().collection('spm').get();
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProgressData(data);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchData();
    }, []);

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
});

export default ViewProgress;
