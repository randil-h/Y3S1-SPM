import {
    FontAwesome,
    FontAwesome5,
    FontAwesome6,
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons
} from "@expo/vector-icons";
import React from "react";

export const icons = {
    index: (props)=> <FontAwesome name="home" size={24} {...props} />,
    teacher: (props)=> <FontAwesome5 name="chalkboard-teacher" size={24} {...props} />,
    quiz: (props)=> <MaterialIcons name="quiz" size={24} {...props} />,
    gesture: (props)=> <MaterialIcons name="gesture" size={24} {...props} />,
    progress: (props)=> <FontAwesome name="line-chart" size={24} {...props} />,
}
