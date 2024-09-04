import {Stack} from "expo-router";
import React from "react";

export default function ScreenLayout() {
    return (
        <Stack>
            <Stack.Screen name="AddQuiz" options={{ headerShown: false, title: 'Add Quiz'}}/>
            <Stack.Screen name="AddCourse" options={{ headerShown: false, title: 'Add  Course'}}/>
        </Stack>
    )
} ;
