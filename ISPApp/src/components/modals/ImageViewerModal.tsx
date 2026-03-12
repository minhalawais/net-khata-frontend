import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, textStyles } from '../../theme';

interface ImageViewerModalProps {
    visible: boolean;
    images: { url: string; title?: string }[];
    initialIndex?: number;
    onClose: () => void;
    title?: string;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
    visible,
    images,
    initialIndex = 0,
    onClose,
    title = "Image Viewer",
}) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Image Viewer */}
                <ImageViewer
                    imageUrls={images}
                    index={initialIndex}
                    enableSwipeDown={true}
                    onSwipeDown={onClose}
                    loadingRender={() => <ActivityIndicator size="large" color={colors.primary[500]} />}
                    renderIndicator={(currentIndex, allSize) => (
                        allSize > 1 ? (
                            <View style={styles.indicatorContainer}>
                                <Text style={styles.indicatorText}>{currentIndex} / {allSize}</Text>
                            </View>
                        ) : <View />
                    )}
                    style={styles.viewer}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Solid black for image viewing
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: spacing.sm,
        paddingHorizontal: spacing.lg,
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    headerTitle: {
        color: colors.white,
        ...textStyles.body,
        fontWeight: '600',
        flex: 1,
        marginRight: spacing.md,
    },
    closeButton: {
        padding: spacing.xs,
    },
    indicatorContainer: {
        position: 'absolute',
        top: 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: 12,
    },
    indicatorText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    viewer: {
        flex: 1,
    },
});
