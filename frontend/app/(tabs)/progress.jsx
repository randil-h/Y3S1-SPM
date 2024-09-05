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
        flexDirection: 'column',
        justifyContent: 'space-around', // Space between buttons
        alignItems: 'center',
        marginTop: 20,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000', // High contrast text color
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#007BFF', // Default color, will be overridden by specific button styles
        width: 180, // Set width and height to make the button round
        height: 180,
        borderRadius: 90, // Half of width/height to make it round
        justifyContent: 'center', // Center the text vertically
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        color: '#FFFFFF', // High contrast text color
    },
});

export default Progress;
