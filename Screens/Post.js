import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as ImagePicker from 'expo-image-picker';

const Post = () => {
    const navigation = useNavigation();
    const [img, setImg] = useState(null);
    const [you, setYou] = useState(true);
    const [anonymous, setAnonymous] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "New Post",
            headerTitleStyle: {
                color: "white",
                fontSize: 20,
                fontWeight: "bold"
            },
            headerLeft: () => (
                <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => navigation.goBack()}>
                    <Entypo name="cross" size={30} color="white" />
                </TouchableOpacity>
            ),
            headerStyle: {
                backgroundColor: "rgba(40,40,40,0.98)",
            },
        })
    }, [navigation]);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work.');
                }
            }
        })();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.6,
        });

        if (!result.canceled) {
            setImg(result.assets[0].uri);
        }
    };

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, backgroundColor: "rgba(29,20,21,1)", paddingVertical: 15, paddingHorizontal: 15, gap: 20 }}
        >
            <View style={{ height: hp("7%"), width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ height: "80%", borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 20, justifyContent: "center", alignItems: "center", paddingHorizontal: 15 }}>
                    <Text style={{ color: "rgba(241,195,224,1)", fontSize: 18, fontWeight: "400" }}>{you ? "Raza" : "Anonymous"}</Text>
                </View>
                <View style={{ flexDirection: "row", flex: 1, height: "100%", justifyContent: "flex-end", alignItems: "center", gap: 15 }}>
                    <TouchableOpacity onPress={() => { setYou(true); setAnonymous(false); }} style={{ height: 55, width: 55, justifyContent: "center", alignItems: "center", borderRadius: 100, borderWidth: you ? 2 : 0, borderColor: "rgba(241,195,214,1)", padding: 3, overflow: "hidden" }}>
                        <Image source={require('../assets/favicon.png')} style={{ height: "85%", width: "85%", resizeMode: "cover" }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setYou(false); setAnonymous(true); }} style={{ height: 55, width: 55, justifyContent: "center", alignItems: "center", borderRadius: 100, borderWidth: anonymous ? 2 : 0, borderColor: "rgba(241,195,214,1)", padding: 3, overflow: "hidden" }}>
                        <Image source={require('../assets/anonymous.jpg')} style={{ height: "85%", width: "85%", resizeMode: "cover", borderRadius: 100 }} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Title Input */}
            <View style={{ width: "100%", alignSelf: "center", marginTop: 20 }}>
                <Text style={{ color: 'white', fontSize: 21, fontWeight: "600" }}>Title</Text>
                <TextInput
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        padding: 15,
                        color: 'white',
                        fontSize: 18,
                        marginTop: 10
                    }}
                    placeholder="Enter title..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={title}
                    onChangeText={setTitle}
                />
            </View>

            {/* Description Textarea */}
            <View style={{ width: "100%", alignSelf: "center", marginTop: 20 }}>
                <Text style={{ color: 'white', fontSize: 21, fontWeight: "600" }}>Description</Text>
                <TextInput
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        padding: 15,
                        color: 'white',
                        fontSize: 18,
                        marginTop: 10,
                        height: 150,  // Adjust height as needed
                        textAlignVertical: 'top'  // Ensure text starts from top
                    }}
                    multiline
                    numberOfLines={4}  // Adjust as needed
                    placeholder="Enter description..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={description}
                    onChangeText={setDescription}
                />
            </View>

            {/* Add Image Button */}
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", alignSelf: "center", marginTop: 20 }} onPress={pickImage}>
                <Text style={{ color: "white", fontSize: 18, fontWeight: "600", marginRight: 10 }}>Add an Image</Text>
                <MaterialIcons name="insert-photo" size={hp("5%")} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>

            {/* Display Selected Image */}
            {img && (
                <Image source={{ uri: img }} style={{ height: 150, width: "85%", alignSelf: "center", resizeMode: "cover", marginTop: 20 }} />
            )}
        </ScrollView>
    );
};

export default Post;
