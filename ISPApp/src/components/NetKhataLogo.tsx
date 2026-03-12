import React from 'react';
import { Image, View, ViewStyle, ImageStyle } from 'react-native';

interface NetKhataLogoProps {
    variant?: 'horizontal' | 'stacked' | 'icon';
    style?: ViewStyle;
    imageStyle?: ImageStyle;
    width?: number | string;
    height?: number | string;
}

export const NetKhataLogo: React.FC<NetKhataLogoProps> = ({
    variant = 'horizontal',
    style,
    imageStyle,
    width,
    height
}) => {
    let logoSrc;

    // Using require for React Native assets
    switch (variant) {
        case 'icon':
            logoSrc = require('../../assets/favicon.png');
            break;
        case 'stacked':
            logoSrc = require('../../assets/net_khata_stacked.png');
            break;
        case 'horizontal':
        default:
            logoSrc = require('../../assets/net_khata_horizontal.png');
            break;
    }

    // Default dimensions if not provided
    const defaultWidth = width || (variant === 'icon' ? 40 : variant === 'stacked' ? 200 : 180);
    const defaultHeight = height || (variant === 'icon' ? 40 : variant === 'stacked' ? 150 : 50);

    return (
        <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
            <Image
                source={logoSrc}
                style={[
                    {
                        width: defaultWidth,
                        height: defaultHeight,
                        resizeMode: 'contain',
                    },
                    imageStyle,
                ]}
            />
        </View>
    );
};
