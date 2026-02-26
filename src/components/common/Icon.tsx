import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface IconProps {
    name: 'menu' | 'back' | 'search' | 'cart' | 'package' | 'bell' | 'user' | 'close';
    size?: number;
    color?: string;
    strokeWidth?: number;
}

export const Icon = ({ name, size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => {
    switch (name) {
        case 'menu':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M3 12h18M3 6h18M3 18h18" />
                </Svg>
            );
        case 'back':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M19 12H5M12 19l-7-7 7-7" />
                </Svg>
            );
        case 'search':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx="11" cy="11" r="8" />
                    <Path d="m21 21-4.3-4.3" />
                </Svg>
            );
        case 'cart':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx="8" cy="21" r="1" />
                    <Circle cx="19" cy="21" r="1" />
                    <Path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.56-7.43a1 1 0 0 0-1-1.2h-13.8" />
                </Svg>
            );
        case 'package':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="m7.5 4.27 9 5.15" />
                    <Path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <Path d="m3.3 7 8.7 5 8.7-5" />
                    <Path d="M12 22V12" />
                </Svg>
            );
        case 'bell':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </Svg>
            );
        case 'user':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <Circle cx="12" cy="7" r="4" />
                </Svg>
            );
        case 'close':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M18 6 6 18M6 6l12 12" />
                </Svg>
            );
        default:
            return null;
    }
};
