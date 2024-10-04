import React, {useState} from 'react';
import {View, Text, StyleSheet, StatusBar, Platform, ScrollView, Image} from 'react-native';
import {BlurView} from "expo-blur";
import {FontAwesome} from "@expo/vector-icons";
import one from "../../assets/images//new/oneg.png";
import two from "../../assets/images//new/twog.png";
import three from "../../assets/images//new/threeg.png";
import four from "../../assets/images//new/fourg.png";
import return1 from "../../assets/images//new/return(1)g.png";
import submit from "../../assets/images//new/submit.jpg";
import tab from "../../assets/images//new/tabg.png";

const Gesture = () => {

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
                        <Text style={{ fontWeight: 'bold', fontSize: 24 }}>Gesture</Text>
                    </View>
                </View>
                <View style={styles.card}>
                    <Text style={{fontWeight: 'bold', fontSize: 18, marginHorizontal: 10}}>Answer Selection</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',paddingVertical: 10}}>
                        <View style={styles.imageContainer}>
                            <Image source={one} style={styles.image}></Image>
                            <Text style={styles.imageDesc}>Selected</Text>
                            <Text style={styles.imageDesc}>Answer : One</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            <Image source={two} style={styles.image}></Image>
                            <Text style={styles.imageDesc}>Selected</Text>
                            <Text style={styles.imageDesc}>Answer : Two</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            <Image source={three} style={styles.image}></Image>
                            <Text style={styles.imageDesc}>Selected</Text>
                            <Text style={styles.imageDesc}>Answer : Three</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            <Image source={four} style={styles.image}></Image>
                            <Text style={styles.imageDesc}>Selected</Text>
                            <Text style={styles.imageDesc}>Answer : Four</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.card}>
                    <Text style={{fontWeight: 'bold', fontSize: 18, marginHorizontal: 10}}>Confirmation Selection</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly',paddingVertical: 10}}>
                        <View style={styles.imageContainer}>
                            <Image source={submit} style={styles.image}></Image>
                            <Text style={styles.imageDesc}>Submit /Yes</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            <Image source={return1} style={styles.image}></Image>
                            <Text style={styles.imageDesc}>Cancel/Return</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.card}>
                    <Text style={{fontWeight: 'bold', fontSize: 18, marginHorizontal: 10}}>Quiz Selection</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',paddingVertical: 10}}>
                        <View style={styles.imageContainer}>
                            <Image source={one} style={styles.image}></Image>
                            <Text style={styles.imageDesc}>Selected Quiz</Text>
                            <Text style={styles.imageDesc}>: One</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            <Image source={two} style={styles.image}></Image>
                            <Text style={styles.imageDesc}>Selected Quiz</Text>
                            <Text style={styles.imageDesc}>: Two</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            <Image source={three} style={styles.image}></Image>
                            <Text style={styles.imageDesc}>Selected Quiz</Text>
                            <Text style={styles.imageDesc}>: Three</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            <Image source={four} style={styles.image}></Image>
                            <Text style={styles.imageDesc}>Selected Quiz</Text>
                            <Text style={styles.imageDesc}>: Four</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.card}>
                    <Text style={{fontWeight: 'bold', fontSize: 18, marginHorizontal: 10}}>Tab Navigation</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',paddingVertical: 10}}>
                        <View style={styles.imageContainer}>
                            <Image source={tab} style={styles.image}></Image>
                            <Text></Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = {
    card: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        marginHorizontal: 22,
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: 15
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
    imageContainer: {
        height: 210,
        width: 100,
        marginHorizontal: 5,
        marginVertical: 5,
        alignItems: 'center'

    },
    imageDesc: {
        fontWeight: 'bold',
        color: '#666'
    },
    image: {
        width: '100%',
        height: '80%'
    },
};

export default Gesture;
