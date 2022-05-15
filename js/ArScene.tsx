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
  ViroFlexView,
  ViroImage,
} from '@viro-community/react-viro';
import Geolocation from 'react-native-geolocation-service';
import { requestMultiple, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
const Toast = (message: any) => {
  ToastAndroid.showWithGravityAndOffset(message, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
};
const MAPS_API_KEY = 'AIzaSyCB2qjHgUAhxuzXygjEGeQBiBDpaQcmNfw';
const PlacesAPIURL = (lat: any, lng: any) =>
  `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50&key=${MAPS_API_KEY}`;
const distanceBetweenPoints = (p1: any, p2: any) => {
  if (!p1 || !p2) {
    return 0;
  }

  var R = 6371; // Radius of the Earth in km
  var dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  var dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.latitude * Math.PI) / 180) *
      Math.cos((p2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

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
        console.log(result.coords)
        this.setState(
          {
            location: result.coords,
          },
          this.getNearbyPlaces
        );
      };
      console.log('Calling getCurrentLocation: Geolocation.watchPosition');

      this.listener = Geolocation.watchPosition(geoSuccess, (error) => {}, { distanceFilter: 10 });
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
  transformGpsToAR = (lat: any, lng: any) => {
    const isAndroid = Platform.OS === 'android';
    const latObj = lat;
    const longObj = lng;
    const latMobile = this.state.location.latitude;
    const longMobile = this.state.location.longitude;

    const deviceObjPoint = this.latLongToMerc(latObj, longObj);
    const mobilePoint = this.latLongToMerc(latMobile, longMobile);
    const objDeltaY = deviceObjPoint.y - mobilePoint.y;
    const objDeltaX = deviceObjPoint.x - mobilePoint.x;

    if (isAndroid) {
      let degree = this.state.compassHeading;
      let angleRadian = (degree * Math.PI) / 180;
      let newObjX = objDeltaX * Math.cos(angleRadian) - objDeltaY * Math.sin(angleRadian);
      let newObjY = objDeltaX * Math.sin(angleRadian) + objDeltaY * Math.cos(angleRadian);
      return { x: newObjX, z: -newObjY };
    }

    return { x: objDeltaX, z: -objDeltaY };
  };
  latLongToMerc = (latDeg: any, longDeg: any) => {
    // From: https://gist.github.com/scaraveos/5409402
    const longRad = (longDeg / 180.0) * Math.PI;
    const latRad = (latDeg / 180.0) * Math.PI;
    const smA = 6378137.0;
    const xmeters = smA * longRad;
    const ymeters = smA * Math.log((Math.sin(latRad) + 1) / Math.cos(latRad));
    return { x: xmeters, y: ymeters };
  };
  placeArObjects = () => {
    if (this.state.nearbyPlaces.length == 0) {
      return undefined;
    }
    const points = [{lat: this.state.location.latitude, lng:this.state.location.longitude, id:"1", title:"custom point"}];
    const ARTags = points.map((item: any) => {
      const coords = this.transformGpsToAR(item.lat, item.lng);
      let scale = Math.abs(Math.round(coords.z / 15));
      scale = scale >= 1 ? scale : 1;
      const distance = distanceBetweenPoints(this.state.location, {
        latitude: item.lat,
        longitude: item.lng,
      });
      console.log('Calling placeArObjects: distance -> ' + distance);
      console.log('Calling placeArObjects: scale -> ' + scale);

      return (
        <ViroNode
          key={item.id}
          scale={[scale, scale, scale]}
          rotation={[0, 0, 0]}
          position={[coords.x, 0, coords.z]}
        >
          <ViroFlexView style={{ alignItems: 'center', justifyContent: 'center' }}>
            <ViroText width={4} height={0.5} text={item.title} style={styles.helloWorldTextStyle} />
            <ViroText
              width={4}
              height={0.5}
              text={`${Number(distance).toFixed(2)} km`}
              style={styles.helloWorldTextStyle}
              position={[0, -0.75, 0]}
            />
          </ViroFlexView>
        </ViroNode>
      );
    });
    return ARTags;
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