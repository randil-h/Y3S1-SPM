
import React from 'react'
import {Stack, Tabs} from 'expo-router'

const _layout = () => {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="screens/teacher/assessment/AddQuiz" options={{ headerShown: false, title: 'Add Quiz'}}/>
            <Stack.Screen name="screens/teacher/coursework/AddCourse" options={{ headerShown: false, title: 'Add  Course'}}/>
            <Stack.Screen name="screens/Progress/AddProgress" options={{ headerShown: false, title: 'Add Progress' }} />
            <Stack.Screen name="screens/Progress/ViewProgress" options={{ headerShown: false, title: 'View Progress' }} />
            <Stack.Screen name="screens/Progress/ProgressSummary" options={{ headerShown: false, title: 'Progress Summary' }} />
        </Stack>
    )
}

export default _layout
