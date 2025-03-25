import FontAwesome from '@expo/vector-icons/FontAwesome';
import {Tabs, useRouter} from 'expo-router';
import {FontAwesome5, MaterialIcons} from "@expo/vector-icons";
import React, {useEffect, useState} from "react";

export default function TabLayout() {
    const [currentTab, setCurrentTab] = useState(0); // Track current tab
    const router = useRouter();

    // Define the available tab routes
    const tabRoutes = ['index', 'teacher', 'quiz', 'gesture', 'progress'];

    // Function to handle WebSocket-based gesture detection
    useEffect(() => {
        const ws = new WebSocket('ws://192.168.1.6:8765'); // Replace with your WebSocket address

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
            const { gesture } = JSON.parse(event.data);
            handleGesture(gesture); // Handle the received gesture
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            ws.close();
        };
    }, [currentTab]); // Include `currentTab` as a dependency to keep it updated

    // Function to handle gestures and navigate between tabs
    const handleGesture = (gesture) => {
        if (gesture === 'Next Tab') {
            navigateToNextTab(); // Navigate forward
        } else if (gesture === 'Previous Tab') {
            navigateToPreviousTab(); // Navigate backward
        }
    };

    // Navigate to the next tab
    const navigateToNextTab = () => {
        if (currentTab < tabRoutes.length - 1) {
            const nextTab = currentTab + 1;
            setCurrentTab(nextTab);
            router.push(`/${tabRoutes[nextTab]}`); // Navigate to the next tab
        }
    };

    // Navigate to the previous tab
    const navigateToPreviousTab = () => {
        if (currentTab > 0) {
            const previousTab = currentTab - 1;
            setCurrentTab(previousTab);
            router.push(`/${tabRoutes[previousTab]}`); // Navigate to the previous tab
        }
    };

    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome size={24} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="teacher"
                options={{
                    title: 'Teacher',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome5 name="chalkboard-teacher" size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="quiz"
                options={{
                    title: 'Quiz',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <MaterialIcons name="quiz" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="gesture"
                options={{
                    title: 'Gesture',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <MaterialIcons name="gesture" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Progress',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome name="line-chart" size={22} color={color} />,
                }}
            />
        </Tabs>
    );
}
