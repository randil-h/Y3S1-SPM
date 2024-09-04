import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform} from 'react-native';
import { useRouter } from 'expo-router';
import {BlurView} from "expo-blur";

const Teacher = () => {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* BlurView for StatusBar */}
            {Platform.OS === 'ios' && (
                <BlurView
                    intensity={80}
                    tint="extraLight"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: StatusBar.currentHeight || 50,
                        zIndex: 1,
                    }}
                />
            )}

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.circleButton}
                    onPress={() => router.push('screens/teacher/assessment/AddQuiz')}
                >
                    <Text style={styles.buttonText}>Add Quiz</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.circleButton}
                    onPress={() => router.push('screens/teacher/coursework/AddCourse')}
                >
                    <Text style={styles.buttonText}>Add Course</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    circleButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#2475ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    buttonText: {
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
});

export default Teacher;
