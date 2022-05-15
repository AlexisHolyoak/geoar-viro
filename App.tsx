import React, { Component, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  ViroARScene,
  ViroText,
  ViroTrackingStateConstants,
  ViroARSceneNavigator,
} from '@viro-community/react-viro';
import ARScene from './js/ArSceneFunction';
import { NativeBaseProvider, Box, Text } from "native-base";

export default () => {
  const [globalState, setGlobalState] = useState<string>("Hello World!");
  return (
    <NativeBaseProvider>
      <Box position="absolute" top="2%" left="10%" width="80%" height="10%" bg="white" zIndex={2} padding="1%" rounded="lg"><Text zIndex={3}>{globalState}</Text></Box>
    <ViroARSceneNavigator
    viroAppProps={ { globalState, setGlobalState } }
      autofocus={true}
      initialScene={{
        scene: ARScene,
      }}
    />
    </NativeBaseProvider>
  );
};