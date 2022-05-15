import React, { useState, useEffect } from 'react';
import { StyleSheet, ToastAndroid, Platform, DeviceEventEmitter } from 'react-native';
import {
  ViroARScene,
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

export default function ARScene(props) {
  console.log(props.arSceneNavigator.viroAppProps.globalState);
  const [tracking, setTracking] = useState<boolean>(false);
  const [locationReady, setLocationReady] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [location, setLocation] = useState<any>(null);
  const [initLocation, setInitLocation] = useState<any>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [pointClicked, setPointClicked] = useState<string>('');
  const [listener, setListener] = useState<any>();
  ViroMaterials.createMaterials({
    skull: {
      diffuseTexture: require('../assets/skull/Skull.jpg'),
    },
  });
  //todo: use the altitude to place at right height.
  //check if the location is ready, camera is ready, and then begin a location watch
  useEffect(() => {
    if (locationReady && cameraReady) {
      setListener(
        Geolocation.watchPosition(
          (position) => {
            setLocation(position.coords);
            if(!location){
              setInitLocation(position.coords);
            }
            console.log(position.coords);
          },
          (error) => {
            // Error
          },
          {
            enableHighAccuracy: true,
            distanceFilter: 10,
          }
        )
      );
    }
    //return function to stop the watch
    return () => {
      Geolocation.clearWatch(listener);
    };
  }, [cameraReady, locationReady]);

  useEffect(() => {
    requestMultiple([PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]).then(
      (statuses) => {
        console.log('Camera', statuses[PERMISSIONS.ANDROID.CAMERA]);
        console.log('Location', statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]);
        setLocationReady(statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED);
        setCameraReady(statuses[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED);
      }
    );
  }, []);

  function onInitialized(state: any, reason: any) {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setTracking(true);
      console.log('Tracking is Ready.');
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      // Handle loss of tracking
    }
  }

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

  const transformGpsToAR = (lat: any, lng: any) => {
    const isAndroid = Platform.OS === 'android';
    const latObj = lat;
    const longObj = lng;
    const latMobile = location.latitude;
    const longMobile = location.longitude;

    const deviceObjPoint = latLongToMerc(latObj, longObj);
    const mobilePoint = latLongToMerc(latMobile, longMobile);
    const objDeltaY = deviceObjPoint.y - mobilePoint.y;
    const objDeltaX = deviceObjPoint.x - mobilePoint.x;

    if (isAndroid) {
      let degree = compassHeading;
      let angleRadian = (degree * Math.PI) / 180;
      let newObjX = objDeltaX * Math.cos(angleRadian) - objDeltaY * Math.sin(angleRadian);
      let newObjY = objDeltaX * Math.sin(angleRadian) + objDeltaY * Math.cos(angleRadian);
      return { x: newObjX, z: -newObjY };
    }

    return { x: objDeltaX, z: -objDeltaY };
  };
  const latLongToMerc = (latDeg: any, longDeg: any) => {
    // From: https://gist.github.com/scaraveos/5409402
    const longRad = (longDeg / 180.0) * Math.PI;
    const latRad = (latDeg / 180.0) * Math.PI;
    const smA = 6378137.0;
    const xmeters = smA * longRad;
    const ymeters = smA * Math.log((Math.sin(latRad) + 1) / Math.cos(latRad));
    return { x: xmeters, y: ymeters };
  };
  const placeArObjects = () => {
    //locationReady is already a prerequisite to run this function
    if (!initLocation) {
      throw 'location is not ready';
    }
    const points = [
      { lat: initLocation.latitude + 0.00001, lng: initLocation.longitude, id: '1', title: 'point 1' },
      { lat: initLocation.latitude, lng: initLocation.longitude + 0.00001, id: '2', title: 'point 2' },
    ];
    const ARTags = points.map((item: any) => {
      const coords = transformGpsToAR(item.lat, item.lng);
      let scale = Math.abs(Math.round(coords.z / 15));
      scale = scale >= 0.2 ? scale : 0.2;
      const distance = distanceBetweenPoints(location, {
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
          transformBehaviors={["billboard"]}
        >
          <ViroFlexView style={{ alignItems: 'center', justifyContent: 'center' }}>
            <ViroAmbientLight color="#ffffff" />
            <ViroText
              text={item.title}
              style={styles.helloWorldTextStyle}
              width={10}
              height={10}
              onClick={() => props.arSceneNavigator.viroAppProps.setGlobalState(item.id)}
            />
          </ViroFlexView>
        </ViroNode>
      );
    });
    return ARTags;
  };

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      {locationReady && cameraReady &&  initLocation && placeArObjects()}
    </ViroARScene>
  );
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
