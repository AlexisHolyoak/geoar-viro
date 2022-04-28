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
} from '@viro-community/react-viro';

const InitialScene = (props) => {
  let data = props.sceneNavigator.viroAppProps;
  ViroMaterials.createMaterials({
    tv: {
      diffuseTexture: require('./assets/tv/Old_Tv/TV_Body_material_Base_Color.png'),
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
      <ViroAmbientLight color="#ffffff" />
      {data.object === 'skull' ? (
        <Viro3DObject
          source={require('./assets/skull/12140_Skull_v3_L2.obj')}
          position={[0, 0, -5]}
          scale={[0.05, 0.05, 0.05]}
          rotation={[-45, 50, 40]}
          type="OBJ"
        />
      ) : (
        <Viro3DObject
          source={require('./assets/tv/Old_Tv/Old_Tv.obj')}
          position={[0, 0, -5]}
          scale={[0.005, 0.005, 0.005]}
          materials={['tv']}
          rotation={[-45, 50, 40]}
          type="OBJ"
        />
      )}
    </ViroARScene>
  );
};

export default () => {
  const [object, setObject] = useState('tv');
  return (
    <View style={styles.mainView}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: InitialScene,
        }}
        viroAppProps={{ object: object }}
        style={{ flex: 1 }}
      />
      <View style={styles.controlsView}>
        <TouchableOpacity onPress={() => setObject('skull')}>
          <Text style={styles.text}>Display Skull</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setObject('tv')}>
          <Text style={styles.text}>Display TV</Text>
        </TouchableOpacity>
      </View>
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
