import React, { Component } from 'react';
import { StyleSheet, ToastAndroid, Platform } from 'react-native';
import {
  ViroARScene,
  ViroQuad,
  ViroSphere,
  ViroMaterials,
  ViroNode,
  ViroText,
  ViroTrackingStateConstants,
  Viro3DObject,
  ViroAmbientLight,
  ViroAnimations,
} from '@viro-community/react-viro';
import Geolocation from '@react-native-community/geolocation';
import { requestMultiple, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
const Toast = (message: any) => {
  ToastAndroid.showWithGravityAndOffset(message, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
};
const MAPS_API_KEY = 'AIzaSyCB2qjHgUAhxuzXygjEGeQBiBDpaQcmNfw';
const PlacesAPIURL = (lat: any, lng: any) =>
  `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50&key=${MAPS_API_KEY}`;
export default class ARScene extends React.Component<any, any> {
  listener: any;
  constructor(props: any) {
    super(props);

    // Set initial state here
    this.state = {
      cameraReady: false,
      locationReady: false,
      location: undefined,
      nearbyPlaces: [],
      tracking: false,
      compassHeading: 0,
      text: 'Initializing AR...',
    };

    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
    this.listener = undefined;
  }
  componentDidMount() {
    requestMultiple([PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]).then(
      (statuses) => {
        console.log('Camera', statuses[PERMISSIONS.ANDROID.CAMERA]);
        console.log('Location', statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]);
        this.setState({
          locationReady: statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED,
          cameraReady: statuses[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED,
        });
      }
    );
  }
  placeArObjects = () => {
    return (
      <ViroText
        text={this.state.text}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={styles.helloWorldTextStyle}
      />
    );
  };
  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized}>
        {this.state.locationReady && this.state.cameraReady && this.placeArObjects()}
      </ViroARScene>
    );
  }

  _onInitialized(state: any, reason: any) {
    this.setState(
      {
        tracking:
          state == ViroTrackingStateConstants.TRACKING_NORMAL ||
          state == ViroTrackingStateConstants.TRACKING_LIMITED,
      },
      () => {
        if (this.state.tracking) {
          Toast('All set');
          this.setState({ text: 'Hello world' });
        } else {
        }
      }
    );
  }
}

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

module.exports = ARScene;
