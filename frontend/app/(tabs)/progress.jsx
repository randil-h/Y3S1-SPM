import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter


const handleButtonPress = (action) => {
    console.log(`${action} button pressed`);

};

const Progress = () => {
    const router = useRouter(); // Initialize router

    return (
        <View style={styles.container}>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/screens/Progress/ViewProgress')}
                accessibilityLabel="View Progress"
                accessibilityHint="Navigates to the page where you can view detailed student progress"
                accessibilityRole="button"
            >
                <Text style={styles.buttonText}>View Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/screens/Progress/AddProgress')}
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
        color: '#000000',
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#80AF81',
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
    },
});

export default Progress;
