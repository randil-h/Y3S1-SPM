import React, { useEffect, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

const UseWebSocket = (onMessage, onOpenMessage = 'WebSocket Connection established', onCloseMessage = 'WebSocket connection closed') => {
    const ws = useRef(null);
    const url = 'ws://192.168.1.6:8765';

    useFocusEffect(
        React.useCallback(() => {
            // Open WebSocket connection when the screen is in focus
            ws.current = new WebSocket(url);

            ws.current.onopen = () => {
                console.log(onOpenMessage);
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                onMessage(data.gesture);
            };

            ws.current.onclose = () => {
                console.log(onCloseMessage);
            };

            // Cleanup WebSocket when the screen is unfocused
            return () => {
                if (ws.current) {
                    ws.current.close();
                    ws.current = null; // Clear the reference
                    console.log(onCloseMessage);
                }
            };
        }, [onMessage, onOpenMessage, onCloseMessage])
    );

    // Extra cleanup if the component is unmounted unexpectedly
    useEffect(() => {
        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null; // Clear the reference
                console.log(onCloseMessage);
            }
        };
    }, [onCloseMessage]);

    return ws.current;
};

export default UseWebSocket;
