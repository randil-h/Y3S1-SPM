// ProgressSummary.js
import React, {useState, useCallback, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../../FirebaseConfig";
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics'; // Import Haptics
import { Audio } from 'expo-av';
import * as Print from 'expo-print'; // Import Print for PDF generation
import * as Sharing from 'expo-sharing'; // Import Sharing for sharing the PDF

const beepSound = require('../../../assets/sounds/soft_beep.mp3'); // Path to the sound file


// Load sound effect
const ProgressSummary = () => {
    const [progressData, setProgressData] = useState([]);
    const [topPerformers, setTopPerformers] = useState([]);
    const [studentsNeedingImprovement, setStudentsNeedingImprovement] = useState([]);
    const [averageScores, setAverageScores] = useState({});
    const router = useRouter();
    const [sound, setSound] = useState();
    let ws;

    // Define the subjects array
    const subjects = ['maths', 'english', 'geography', 'hist', 'science'];

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
        // Students needing improvement (sorted from lowest to highest score)
        const needingImprovement = sortedByTotal
            .filter(student => student.total < threshold)
            .sort((a, b) => a.total - b.total);  // Sort ascending for improvement list
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
    const generatePdf = async () => {
        const html = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        padding: 0;
                        background-color: #f9f9f9;
                    }
                    h1 {
                        font-size: 45px;
                        color: #333;
                        text-align: center;
                    }
                    h2 {
                        font-size: 40px;
                        color: #555;
                        margin-top: 20px;
                    }
                    ul {
                        list-style-type: none;
                        padding: 0;
                    }
                    li {
                        font-size: 35px;
                        color: #444;
                        margin-bottom: 10px;
                    }
                </style>
            </head>
            <body>
                <h1>Progress Summary</h1>
                <h2>Overall Average Scores</h2>
                <ul>
                    ${Object.entries(averageScores).map(([subject, avg]) => (
            `<li>${getSubjectDisplayName(subject)}: ${avg}</li>`
        )).join('')}
                </ul>
                <h2>Top Performers</h2>
                <ul>
                    ${topPerformers.map((student, index) => (
            `<li>${index + 1}. ${student.studentName} (ID: ${student.studentID}) - Total: ${student.total}</li>`
        )).join('')}
                </ul>
                <h2>Students Needing Improvement</h2>
                <ul>
                    ${studentsNeedingImprovement.map((student, index) => (
            `<li>${index + 1}. ${student.studentName} (ID: ${student.studentID}) - Total: ${student.total}</li>`
        )).join('')}
                </ul>
            </body>
        </html>
    `;

        try {
            const { uri } = await Print.printToFileAsync({ html, fileName: 'Progress Summary' }); // Set the file name
            await Sharing.shareAsync(uri);
        } catch (error) {
            console.error("Error generating or sharing PDF: ", error);
        }
    };

    return (
        <ScrollView style={styles.container} accessible={true}>
            <Text style={styles.title} accessible={true}>
                Progress Summary
            </Text>
            {/* Button for PDF generation */}
            <TouchableOpacity
                style={styles.pdfButton}
                onPress={generatePdf}
                accessibilityLabel="Generate PDF"
                accessibilityHint="Generates a PDF version of the progress summary"
                accessibilityRole="button"
            >
                <Text style={styles.buttonText}>Generate PDF</Text>
            </TouchableOpacity>
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
    },pdfButton: {
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
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
}});

export default ProgressSummary;
