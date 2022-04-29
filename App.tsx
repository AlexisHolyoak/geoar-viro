import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  ViroARScene,
  ViroText,
  ViroTrackingStateConstants,
  ViroARSceneNavigator,
  ViroBox,
  ViroMaterials,
  ViroAnimations,
  Viro3DObject,
  ViroAmbientLight,
  ViroARTrackingTargets,
  ViroARImageMarker,
} from '@viro-community/react-viro';

const InitialScene = () => {
  ViroARTrackingTargets.createTargets({
    skullImage: {
      source: require('./assets/skull/Skull.jpg'),
      orientation: 'Up',
      physicalWidth: 0.165,
    },
  });
  const anchorFound = () => {
    console.log('Anchor/Image detected');
  };
  return (
    <ViroARScene>
      <ViroARImageMarker target="skullImage" onAnchorFound={anchorFound}>
        <ViroAmbientLight color="#ffffff" />
        <Viro3DObject
          source={require('./assets/skull/12140_Skull_v3_L2.obj')}
          scale={[0.008, 0.008, 0.008]}
          rotation={[-170, 0, 0]}
          type="OBJ"
        />
      </ViroARImageMarker>
    </ViroARScene>
  );
};

export default () => {
  return (
    <View style={styles.mainView}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: InitialScene,
        }}
        style={{ flex: 1 }}
      />
    </View>
  );
};

var styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  text: {
    margin: 20,
    backgroundColor: '#9d9d9d',
    padding: 10,
    fontWeight: 'bold',
  },
  controlsView: {
    width: '100%',
    height: 100,
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
