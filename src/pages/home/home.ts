import { Component, ViewChild  } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  LatLng,
  Circle,
  ILatLng
} from '@ionic-native/google-maps';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	
  @ViewChild('map') element;
  map: GoogleMap;
  coords: any;
  is_Location: any = true;

  	public config: BackgroundGeolocationConfig = {
            desiredAccuracy: 10,
            stationaryRadius: 20,
            distanceFilter: 30,
            debug: false,
            interval:20000,  
            stopOnTerminate: true, 
    };

  constructor(public navCtrl: NavController,
  			  private geolocation: Geolocation,
  			  private diagnostic: Diagnostic,
  			  public platform: Platform,
  			  public googleMaps: GoogleMaps,
  			  private backgroundGeolocation: BackgroundGeolocation) {

  	platform.ready().then(() => {
       this.checkLocation();
    });

  }

  	/*
  	- Watch location change and update map
  	*/
  	watchLocationChange(){
  		this.backgroundGeolocation.configure(this.config)
		  .subscribe((location: BackgroundGeolocationResponse) => {
		    console.log('Location Change', location);
		    this.coords = location;
		    this.map.clear();
		    this.addMarker();
    		this.addCircle();
		  });
		this.backgroundGeolocation.start();
  	};

  	/*
  	- Get user Current location
  	*/
  	getCrrentLocation(){
      this.geolocation.getCurrentPosition().then((position) => {
	    this.coords = position.coords;
	    console.log('Location', this.coords);
	    this.loadMap();
      }, (err) => {
        if(err.code == 1 && err.message == "Illegal Access"){
          console.log('Please turn on location to continue.');  
        }else{
          console.log('Something went wrong, please try again.');
        }
      });
  	};
  

  	/*
  	-Check location is on or off
  	*/
  	checkLocation(){
  		let self = this;
	  	let successCallback = (isAvailable) => {
	  		console.log('Is available? ' + isAvailable);
	  		if(isAvailable){
	  		  self.getCrrentLocation();
	  		}else{
	  		  self.is_Location = false;
	  		} 
	  	};
		let errorCallback = (e) => console.error('Error', e);

		this.diagnostic.isLocationAvailable().then(successCallback).catch(errorCallback);


		this.diagnostic.registerLocationStateChangeHandler(function(state){
			console.log('state', state);
	        if(state == "high_accuracy"){
	          self.is_Location = true;
	          self.getCrrentLocation();
	        }
	        if(state == "location_off"){
	          self.is_Location = false;
	        }
	    });

	};

	/*
	  -Initialize map
	*/
	loadMap() {

    let mapOptions: GoogleMapOptions = {
      camera: {
         target: {
           lat:  this.coords.latitude,
           lng:  this.coords.longitude
         },
         zoom: 12,
         tilt: 30
       }
    };

    this.map = GoogleMaps.create(this.element.nativeElement, mapOptions);

    this.addMarker();
    this.addCircle();
    setTimeout(() => {
   		this.watchLocationChange();
	}, 10000);
  }

  /*
  	-Add marker on map
  */
  addMarker() {
    let marker: Marker = this.map.addMarkerSync({
      title: 'Location',
      icon: 'red',
      animation: 'DROP',
      position: {
           lat:  this.coords.latitude,
           lng:  this.coords.longitude
      }
    });

    marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {  
    });
  };

  /*
  	-Add circle on map
  */
  addCircle(){
  	let GOOGLE: ILatLng = {"lat" : this.coords.latitude, "lng" : this.coords.longitude};
	let circle: Circle = this.map.addCircleSync({
	    'center': GOOGLE,
	    'radius': 200,
	    'strokeColor' : '#4972b0',
	    'strokeWidth': 1,
	    'fillOpacity': '0.5',
	    'fillColor' : '#aec4ea'
	});

    this.map.moveCamera({
	    target: circle.getBounds()
	});
  };

}
