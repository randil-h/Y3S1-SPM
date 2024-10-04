import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from "expo-blur";
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const beepSound = require('../../assets/sounds/beep.mp3'); // Ensure this path is correct

const Teacher = () => {
    const router = useRouter();
    const [hapticInterval, setHapticInterval] = useState(null);
    const [sound, setSound] = useState(null);
    const [buttonLayouts, setButtonLayouts] = useState({});
    const [fingerPosition, setFingerPosition] = useState({ x: 0, y: 0 });
    const [isFeedbackActive, setIsFeedbackActive] = useState(false);

    const loadSound = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(beepSound);
            setSound(sound);
        } catch (error) {
            console.error('Error loading sound:', error);
        }
    };

    const playSound = async () => {
        try {
            if (sound) {
                await sound.playAsync(); // Play the sound
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    const startFeedback = async () => {
        if (!isFeedbackActive) {
            setIsFeedbackActive(true);
            await loadSound(); // Ensure the sound is loaded before starting feedback
            const intervalId = setInterval(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
                playSound();
            }, 300); // Adjust the interval to match the haptic feedback
            setHapticInterval(intervalId);
        }
    };

    const stopFeedback = () => {
        if (hapticInterval) {
            clearInterval(hapticInterval);
            setHapticInterval(null);
        }
        if (sound) {
            sound.stopAsync(); // Stop the sound
        }
        setIsFeedbackActive(false);
    };

    const handleGestureEvent = (event) => {
        const { absoluteX, absoluteY } = event.nativeEvent;
        setFingerPosition({ x: absoluteX, y: absoluteY });

        // Check if the touch is within any button bounds
        let isInsideButton = false;
        Object.keys(buttonLayouts).forEach((key) => {
            const { x, y, width, height } = buttonLayouts[key];
            if (
                absoluteX >= x &&
                absoluteX <= x + width &&
                absoluteY >= y &&
                absoluteY <= y + height
            ) {
                isInsideButton = true;
            }
        });

        if (isInsideButton) {
            startFeedback();
        } else {
            stopFeedback();
        }
    };

    const handleButtonLayout = (key) => (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setButtonLayouts((prevLayouts) => ({
            ...prevLayouts,
            [key]: { x, y, width, height }
        }));
    };

    const handleGestureEnd = () => {
        stopFeedback();
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PanGestureHandler
                onGestureEvent={handleGestureEvent}
                onHandlerStateChange={(event) => {
                    if (event.nativeEvent.state === 5) { // GestureHandlerState.END
                        handleGestureEnd();
                    }
                }}
            >
                <View style={styles.container}>
                    <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

                    {/* Fixed top view with Home and BG */}
                    <View style={styles.topView}>
                        {Platform.OS === 'ios' && (
                            <BlurView
                                intensity={80}
                                tint="extraLight"
                                style={styles.blurView}
                            />
                        )}
                    </View>

                    {/* Centered buttons */}
                    <View style={styles.buttonColumn}>
                        <TouchableOpacity
                            style={styles.circleButton}
                            onLayout={handleButtonLayout('addQuiz')}
                            onPress={() => router.push('screens/teacher/assessment/Quizzes')}
                        >
                            <Text style={styles.buttonText}>Quizzes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.circleButton}
                            onLayout={handleButtonLayout('addCourse')}
                            onPress={() => router.push('screens/teacher/coursework/AddCourse')}
                        >
                            <Text style={styles.buttonText}>Add Course</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </PanGestureHandler>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topView: {
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        paddingVertical: 12,
    },
    blurView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: StatusBar.currentHeight || 50,
        zIndex: 1,
    },
    buttonColumn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 36,
        marginTop: StatusBar.currentHeight || 50 + 16,
    },
    circleButton: {
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: '#7aa631',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontSize: 26,
        textAlign: 'center',
    },
});

export default Teacher;
