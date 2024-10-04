import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import {FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import React from "react";

export default function TabLayout() {

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



