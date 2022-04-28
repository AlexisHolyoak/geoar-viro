import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  ViroARScene,
  ViroText,
  ViroTrackingStateConstants,
  ViroARSceneNavigator,
  ViroBox,
  ViroMaterials,
  ViroAnimations,
} from '@viro-community/react-viro';

const InitialScene = () => {
  ViroMaterials.createMaterials({
    wood: {
      diffuseTexture: require('./assets/woodtexture.jpeg'),
    },
  });
  ViroAnimations.registerAnimations({
    rotate: {
      duration: 2500,
      properties: {
        rotateY: '+=90',
      },
    },
  });
  return (
    <ViroARScene>
      <ViroBox
        height={2}
        length={2}
        width={2}
        position={[0, -1, -1]}
        scale={[0.2, 0.2, 0.2]}
        materials={['wood']}
        animation={{ name: 'rotate', loop: true, run: true }}
      />
    </ViroARScene>
  );
};

export default () => {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{
        scene: InitialScene,
      }}
      style={{ flex: 1 }}
    />
  );
};

var styles = StyleSheet.create({});
