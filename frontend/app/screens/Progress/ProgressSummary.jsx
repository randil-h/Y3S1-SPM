// ProgressSummary.js
import React, {useState, useCallback, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../../FirebaseConfig";
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics'; // Import Haptics
import { Audio } from 'expo-av';

const beepSound = require('../../../assets/sounds/soft_beep.mp3'); // Path to the sound file

// Load sound effect


const ProgressSummary = () => {
    const [progressData, setProgressData] = useState([]);
    const [topPerformers, setTopPerformers] = useState([]);
    const [studentsNeedingImprovement, setStudentsNeedingImprovement] = useState([]);
    const [averageScores, setAverageScores] = useState({});
    const router = useRouter();
    const [sound, setSound] = useState();

    // Define the subjects array
    const subjects = ['maths', 'english', 'geography', 'hist', 'science'];

    // Helper function to get proper subject display names
    const getSubjectDisplayName = (key) => {
        const subjectNames = {
            maths: "Maths",
            english: "English",
            geography: "Geography",
            hist: "History",
            science: "Science",
        };
        return subjectNames[key] || key;
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
    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);
    // Fetch data from Firestore
    const fetchData = async () => {
        try {
            const progressCollection = collection(db, 'progress');
            const snapshot = await getDocs(progressCollection);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProgressData(data);
            processData(data);
        } catch (error) {
            console.error('Error fetching data: ', error);
            Alert.alert('Error', 'Failed to fetch progress data.');
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    // Process data to find top performers, students needing improvement, and average scores
    const processData = (data) => {
        if (data.length === 0) {
            setTopPerformers([]);
            setStudentsNeedingImprovement([]);
            setAverageScores({});
            return;
        }

        // Calculate total scores for each student
        const studentsWithTotal = data.map(student => {
            const total =
                parseFloat(student.maths) +
                parseFloat(student.english) +
                parseFloat(student.geography) +
                parseFloat(student.hist) +
                parseFloat(student.science);
            return { ...student, total };
        });

        // Sort students by total score in descending order
        const sortedByTotal = [...studentsWithTotal].sort((a, b) => b.total - a.total);

        // Top 5 performers
        const top5 = sortedByTotal.slice(0, 5);
        setTopPerformers(top5);

        // Students needing improvement (e.g., total score below a threshold, say 60% of max)
        const maxTotal = sortedByTotal[0].total;
        const threshold = maxTotal * 0.6; // 60% of the highest total
        const needingImprovement = sortedByTotal.filter(student => student.total < threshold);
        setStudentsNeedingImprovement(needingImprovement);

        // Calculate average scores per subject
        const totals = subjects.reduce((acc, subject) => {
            acc[subject] = data.reduce((sum, student) => sum + parseFloat(student[subject] || 0), 0);
            return acc;
        }, {});

        const averages = {};
        subjects.forEach(subject => {
            averages[subject] = data.length > 0 ? (totals[subject] / data.length).toFixed(2) : '0.00';
        });
        setAverageScores(averages);
    };
    // Handle button press with sound and haptic feedback
    const handleViewProgress = async () => {
        await playSound();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/screens/Progress/ViewProgress');
    };
    return (
        <ScrollView style={styles.container} accessible={true}>
            <Text style={styles.title} accessible={true}>
                Progress Summary
            </Text>

            {/* Overall Statistics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle} accessible={true}>
                    Overall Average Scores
                </Text>
                {Object.keys(averageScores).length > 0 ? (
                    <View accessible={true}>
                        {Object.entries(averageScores).map(([subject, avg]) => (
                            <Text key={subject} style={styles.statText}>
                                {getSubjectDisplayName(subject)}: {avg}
                            </Text>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.noDataText}>No data available.</Text>
                )}
            </View>

            {/* Top Performers */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle} accessible={true}>
                    Top Performers
                </Text>
                {topPerformers.length > 0 ? (
                    <FlatList
                        data={topPerformers}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => (
                            <View style={styles.listItem}>
                                <Text style={styles.listText}>
                                    {index + 1}. {item.studentName} (ID: {item.studentID}) - Total: {item.total}
                                </Text>
                                {subjects.map(subject => (
                                    <Text key={subject} style={styles.listText}>
                                        {getSubjectDisplayName(subject)} Marks: {item[subject]}
                                    </Text>
                                ))}
                            </View>
                        )}
                        accessible={true}
                        accessibilityLabel="List of top performing students"
                    />
                ) : (
                    <Text style={styles.noDataText}>No top performers available.</Text>
                )}
            </View>

            {/* Students Needing Improvement */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle} accessible={true}>
                    Students Needing Improvement
                </Text>
                {studentsNeedingImprovement.length > 0 ? (
                    <FlatList
                        data={studentsNeedingImprovement}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => (
                            <View style={styles.listItem}>
                                <Text style={styles.listText}>
                                    {index + 1}. {item.studentName} (ID: {item.studentID}) - Total: {item.total}
                                </Text>
                                {subjects.map(subject => (
                                    <Text key={subject} style={styles.listText}>
                                        {getSubjectDisplayName(subject)} Marks: {item[subject]}
                                    </Text>
                                ))}
                            </View>
                        )}
                        accessible={true}
                        accessibilityLabel="List of students needing improvement"
                    />
                ) : (
                    <Text style={styles.noDataText}>All students are performing well.</Text>
                )}
            </View>

            {/* Navigation Button */}
            <TouchableOpacity
                style={styles.button}
                onPress={handleViewProgress}
                accessibilityLabel="View Detailed Progress"
                accessibilityHint="Navigates to the page where you can view detailed student progress"
                accessibilityRole="button"
            >
                <Text style={styles.buttonText}>View Detailed Progress</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// Helper function to capitalize subject names (optional, already handled by getSubjectDisplayName)
const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f2f2f2',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
        paddingTop: 30,
    },
    section: {
        marginBottom: 30,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    statText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    listItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    listText: {
        fontSize: 16,
        color: '#555',
    },
    noDataText: {
        fontSize: 16,
        color: '#999',
        fontStyle: 'italic',
    },
    button: {
        backgroundColor: '#80AF81',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ProgressSummary;
