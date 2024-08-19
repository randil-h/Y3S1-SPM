import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import TabBar from "../components/navbar/TabBar";

const _layout = () => {
    return (
        <Tabs
            tabBar={props=> <TabBar {...props} />}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="teacher"
                options={{
                    title: "Teacher",
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="quiz"
                options={{
                    title: "Quiz",
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="gesture"
                options={{
                    title: "Gesture",
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: "Progress",
                    headerShown: false
                }}
            />
        </Tabs>
    )
}

export default _layout
