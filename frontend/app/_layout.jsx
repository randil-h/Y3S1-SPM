
import React from 'react'
import {Stack, Tabs} from 'expo-router'

const _layout = () => {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="screens/teacher/assessment/AddQuiz" options={{ headerShown: true, title: 'Add Quiz'}}/>
            <Stack.Screen name="screens/teacher/coursework/AddCourse" options={{ headerShown: true, title: 'Add  Course'}}/>
            <Stack.Screen name="teacher/coursework/CourseManagement" options={{ headerShown: true, title: 'Manage  Course'}}/>
        </Stack>
    )
}

export default _layout
