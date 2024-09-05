import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AddCourse = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Add Course</Text>
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

export default AddCourse;
