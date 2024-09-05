import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter

// Example function to handle button presses
const handleButtonPress = (action) => {
    console.log(`${action} button pressed`);
    // Implement navigation or other actions based on the button pressed
};

const Progress = () => {
    const router = useRouter(); // Initialize router

    return (
        <View style={styles.container}>
            <Text style={styles.title} accessibilityRole="header">
                Student Progress
            </Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/screens/Progress/ViewProgress')}
                accessibilityLabel="View Student Progress"
                accessibilityHint="Navigates to the page where you can view detailed student progress"
                accessibilityRole="button"
            >
                <Text style={styles.buttonText}>View Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/screens/Progress/AddProgress')} // Use router to navigate
                accessibilityLabel="Add Student"
                accessibilityHint="Navigates to the page where you can add new student information"
                accessibilityRole="button"
            >
                <Text style={styles.buttonText}>Add Student Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => handleButtonPress('Progress Summary')}
                accessibilityLabel="Display Progress Summary"
                accessibilityHint="Navigates to the page where you can view a summary of student progress"
                accessibilityRole="button"
            >
                <Text style={styles.buttonText}>Progress Summary</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // High contrast background color
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000', // High contrast text color
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#007BFF', // High contrast button color
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginVertical: 10,
        width: '80%', // Make buttons wider
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        color: '#FFFFFF', // High contrast text color
    },
});

export default Progress;
