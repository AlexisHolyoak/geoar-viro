import React, { Component } from 'react';
import { StyleSheet, ToastAndroid, Platform, DeviceEventEmitter } from 'react-native';
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
import Geolocation from 'react-native-geolocation-service';
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
        this.setState(
          {
            locationReady: statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED,
            cameraReady: statuses[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED,
          },
          this.getCurrentLocation
        );
      }
    );
  }
  componentWillUnmount() {
    if (this.listener) {
      console.log('Listener on unmount: ' + this.listener);
      Geolocation.clearWatch(this.listener);
    }
  }
  getCurrentLocation = () => {
    console.log('Calling getCurrentLocation');
    if (this.state.cameraReady && this.state.locationReady) {
      const geoSuccess = (result: any) => {
        this.setState(
          {
            location: result.coords,
          },
          this.getNearbyPlaces
        );
      };
      console.log('Calling getCurrentLocation: Geolocation.watchPosition');

      this.listener = Geolocation.watchPosition(geoSuccess, (error) => {}, { distanceFilter: 10 });
      console.log('ERROR line 77');
    }
  };
  getNearbyPlaces = async () => {
    console.log('Calling getNearbyPlaces');
    const URL = PlacesAPIURL(this.state.location.latitude, this.state.location.longitude);
    console.log('Calling getNearbyPlaces: URL -> ' + URL);
    fetch(URL)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.status === 'OK') {
          console.log('Calling getNearbyPlaces: OK response -> ' + responseJson);
          const places = responseJson.results.map((rawPlace: any) => {
            console.log('Calling getNearbyPlaces: rawPlace - > ' + rawPlace);
            return {
              id: rawPlace.place_id,
              title: rawPlace.name,
              lat: rawPlace.geometry.location.lat,
              lng: rawPlace.geometry.location.lng,
              icon: rawPlace.icon,
            };
          });
          console.log('Calling getNearbyPlaces: places -> ' + places);
          this.setState({ nearbyPlaces: places });
        } else {
          console.warn(responseJson.status);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  placeArObjects = () => {
    if (this.state.nearbyPlaces.length == 0) {
      return undefined;
    }
    const ARTags = this.state.nearbyPlaces.map((item: any) => {
      console.log(item);
    });
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
