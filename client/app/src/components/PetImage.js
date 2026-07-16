import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, ActivityIndicator } from 'react-native';

export default function PetImage({ src, imageSettings, type = 'card', style = {} }) {
  const [orientation, setOrientation] = useState('landscape'); // 'landscape' | 'portrait' | 'square'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Image.getSize(src, (width, height) => {
      const ratio = width / height;
      if (ratio > 1.1) {
        setOrientation('landscape');
      } else if (ratio < 0.9) {
        setOrientation('portrait');
      } else {
        setOrientation('square');
      }
      setLoading(false);
    }, (err) => {
      console.log('Error reading image size:', err);
      setLoading(false);
    });
  }, [src]);

  const targetHeight = type === 'hero' ? 240 : 180;

  if (!src) {
    return (
      <View style={[styles.fallbackContainer, { height: targetHeight }, style]}>
        <Text style={styles.fallbackText}>No Companion Photo</Text>
      </View>
    );
  }

  const isPortrait = orientation === 'portrait';
  
  const posX = imageSettings?.positionX ?? 50;
  const posY = imageSettings?.positionY ?? 50;

  return (
    <View style={[styles.container, { height: targetHeight, backgroundColor: '#F3F4F6' }, style]}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#9CA3AF" />
        </View>
      )}
      
      {isPortrait ? (
        <Image 
          source={{ uri: src }} 
          style={{ width: '100%', height: '100%' }} 
          resizeMode="contain" 
        />
      ) : (
        <View style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
          <Image 
            source={{ uri: src }} 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: [
                { scale: 1.3 },
                { translateX: (posX - 50) * -0.9 },
                { translateY: (posY - 50) * -0.9 }
              ]
            }} 
            resizeMode="cover" 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  loader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    zIndex: 1,
  },
  fallbackContainer: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
