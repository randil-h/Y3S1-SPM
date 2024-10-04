import { View, Text, StatusBar, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import React, { useState } from 'react';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <View style={{ flex: 1 }}>
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

            <ScrollView contentContainerStyle={{ paddingTop: StatusBar.currentHeight || 50, marginTop: 16 }}>
                <View style={{ position: 'relative' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 8 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 24 }}>Home</Text>
                        <View style={{ backgroundColor: '#003ca5', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, color: '#fff' }}>BG</Text>
                        </View>
                    </View>

                    {/* Search Bar with Icon */}
                    <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e0e0', padding: 12, borderRadius: 25 }}>
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search..."
                                placeholderTextColor="#75808c"
                                style={{ flex: 1, fontSize: 16, textAlignVertical: 'center' }}
                            />
                            <TouchableOpacity>
                                <FontAwesome name="search" size={18} color="#75808c" style={{ marginLeft: 10 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Card-like boxes */}
                <View style={{ paddingHorizontal: 24 }}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>User Guide</Text>
                        <Text style={styles.cardText}>Guidelines for using this app</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Accessibility</Text>
                        <Text style={styles.cardText}>User accessibility features</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Settings</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = {
    card: {
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 70,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3, // For Android shadow
        alignItems: 'center', // Horizontally center the text
        justifyContent: 'center', // Vertically center the text
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center', // Ensure the text is centered
    },
    cardText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center', // Ensure the text is centered
    },
};

export default Home;

