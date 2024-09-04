import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { useRouter } from 'expo-router';

const Teacher = () => {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Teacher</Text>
            <TouchableOpacity onPress={() => router.push('screens/AddQuiz')}>
                <Text style={{fontWeight: 'bold',color: '#2475ff', padding: 4, borderRadius: 5}}>Add Quiz</Text>
            </TouchableOpacity>
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
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default Teacher;
