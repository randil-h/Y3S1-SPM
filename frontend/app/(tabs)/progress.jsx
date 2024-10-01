import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter
import * as Haptics from 'expo-haptics'; // Import Haptics

const handleButtonPress = (action) => {
    console.log(`${action} button pressed`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Trigger haptic feedback

};

const Progress = () => {
    const router = useRouter(); // Initialize router

    return (
        <View style={styles.container}>

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    handleButtonPress('View Progress');
                    router.push('/screens/Progress/ViewProgress');
                }}
                accessibilityLabel="View Progress"
                accessibilityHint="Navigates to the page where you can view detailed student progress"
                accessibilityRole="button"
            >
                <Text style={styles.buttonText}>View Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    handleButtonPress('Add Progress');
                    router.push('/screens/Progress/AddProgress');
                }}
                accessibilityLabel="Add Student"
                accessibilityHint="Navigates to the page where you can add new student information"
                accessibilityRole="button"
            >
                <Text style={styles.buttonText}>Add Student Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    handleButtonPress('Progress Summary');
                    router.push('/screens/Progress/ProgressSummary');
                }}
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
        color: '#000000',
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#fff', // Card-like white background
        width: 280,
        height: 180,
        borderRadius: 25, // Card-like rounded corners
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', // Shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3, // Android shadow
        paddingHorizontal: 20, // Padding similar to card style
        paddingVertical: 20,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold', // Similar to card title
        color: '#666', // Gray text like card
        textAlign: 'center', // Centered text
    },
});

export default Progress;
