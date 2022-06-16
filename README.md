### **Initial steps.**


* go to root path and run in terminal

` yarn Install`


### **Steps to replicate working debug apk.**


* run in terminal 

`npm run android`


> you will see 4 pineapples being displayed in front of you. it uses geolocation to determinate where you are and then places the pineapples.


### **Steps to replicate issue in release.**


* delete the apk generated in the phone or emulator.

* run in terminal: 

`npx react-native run-android --variant=release`

> when you test the application you will see that instead of 4 pineapples it just shows 4


