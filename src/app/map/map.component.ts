import { Component, OnInit, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import polyline from '@mapbox/polyline';
import * as mapboxgl from 'mapbox-gl';
import _ from 'lodash';
import {environment} from '../../environments/environment';

declare const mapboxgl: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map;
  marker;
  markerUser;
  drivers = {};
  @Input() heigth;
  @Input() adjustLat = 0;
  @Input() adjustLon = 0;
  @Input() dataPolyline;
  @Input() dataPrintUser;
  @Input() dataPrintDriver;
  @Input() reConfig;
  @Input() zoom = 14;
  @Input() removeDriver;
  @Input() removeRouteMap;
  @Output() mapOutput = new EventEmitter<any>();

  @Output() getMarkerPositionOutput = new EventEmitter<any>();

  constructor() {
    this.getMarkerPosition = this.getMarkerPosition.bind(this);
  }

  async ngOnInit() {
    await this.createMap();
    if(this.dataPolyline) {
      this.onStyleLoad();
      if(this.dataPolyline.longitude) {
        this.dataMarkerUser(this.dataPolyline.longitude, this.dataPolyline.latitude);
      }
    }
    this.map.on('load', () => {
      this.redimension();
    });
    this.removeMarkerDriver = this.removeMarkerDriver.bind(this);
    this.animateMarker = this.animateMarker.bind(this);
    this.removeRouteFromMap = this.removeRouteFromMap.bind(this);
  }

  redimension(){
    this.map.resize();
    this.reCenter();
  }

  reCenter() {
    if(this.marker) {
      var lngLat = this.marker.getLngLat();
      this.map.flyTo({ center: [lngLat.lng + parseFloat(this.adjustLon + ''), lngLat.lat + parseFloat(this.adjustLat + '')], zoom: this.zoom });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if(!this.map) {
      this.createMap();
    }
    if(changes.dataPrintUser) {
      const dataPrint = changes.dataPrintUser.currentValue;
      if(dataPrint) {
        this.dataMarkerUser(dataPrint.longitude, dataPrint.latitude, dataPrint.draggable);
      }
    }
    if(changes.dataPrintDriver) {
      const dataPrint = changes.dataPrintDriver.currentValue;
      if(dataPrint) {
        this.dataMarkerDriver(dataPrint);
      }
    }
    if(changes.reConfig){
      this.redimension();
    }
    if(changes.dataPolyline) {
      if(changes.dataPolyline.currentValue && changes.dataPolyline.currentValue.route){
        this.map.addLayer(this.addRoute(changes.dataPolyline.currentValue.route, '#3C2982', 'service'));
      }
    }
    if(changes.removeDriver) {
      this.removeMarkerDriver(changes.removeDriver.currentValue);
    }
    if(changes.removeRouteMap) {
      if(changes.removeRouteMap.currentValue) {
        this.removeRouteFromMap();
      }
    }
  }

  removeRouteFromMap() {
    this.map.removeLayer('service').removeSource('service');
  }

  onStyleLoad() {
    if (this.dataPolyline && this.dataPolyline.route && !this.dataPolyline.routeserviceRoute) {
      this.map.on('load', () => {
        this.map.addLayer(this.addRoute(this.dataPolyline.route, '#3C2982', 'service'));
      });
    } else {
      this.map.on('load', () => {
        this.dataMarkerUser(this.dataPolyline.longitude,this.dataPolyline.latitude);
        if(this.dataPolyline.serviceRoute) {
          this.map.addLayer(this.addRoute(this.dataPolyline.serviceRoute.service_route, '#3C2982', 'service'));
          this.map.addLayer(this.addRoute(this.dataPolyline.serviceRoute.accepted_route, '#888', 'accepted'));
        }
      });
    }
  }

  addRoute(data, color, id) {
    const decoded = polyline.decode(data);
    const coordinates = _.map(decoded, element => [element[1], element[0]]);
    return this.mapLayer(coordinates, color, id);
  }

  mapLayer(coordinates, color, id) {
    if(typeof this.map.getLayer(id) !== 'undefined') {
      this.map.removeLayer(id).removeSource(id);
    }
    return {
      id,
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': color,
        'line-width': 8,
      },
    };
  }

  createMap(lat = 5.0000, lng = -74.0000) {
    const options = {
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 4,
      center: [ lng, lat ],
      disableDefaultUI: true,
      navigationControl: false,
      mapTypeControl: false
    };
    mapboxgl.accessToken = `${environment.KeyMapboxComponent}`;
    if(!this.map) {
      this.map = new mapboxgl.Map(options);
      document.getElementById('map').style.height = this.heigth;
      this.emitMap();
    }
  }

  emitMap(){
    this.mapOutput.emit(this.map);
  }

  getMarkerPosition() {
    var lngLat = this.marker.getLngLat();
    const data = {
      longitude: parseFloat(lngLat.lng).toFixed(6), 
      latitude: parseFloat(lngLat.lat).toFixed(6)
    };
    this.getMarkerPositionOutput.emit(data);
  }

  dataMarkerUser(lng, lat, draggable=false) {

    var el = document.createElement('div');
    el.className = 'marker img-marker-user';

    this.marker = new mapboxgl.Marker({
      element: el, 
      draggable: draggable
      }).setLngLat([lng, lat])
      .addTo(this.map);

    this.marker.on('dragend', this.getMarkerPosition);
    this.map.flyTo({ center: [lng, lat], zoom: this.zoom });
  }

  dataMarkerDriver(data) {
    var el = document.createElement('div');
    el.className = 'marker img-marker-driver';

    const newMarkerDriver = new mapboxgl.Marker({
      element: el
      }).setLngLat([data.longitude, data.latitude])
      .setPopup(new mapboxgl.Popup({ offset: 25 })
      .setHTML(data.html))
      .addTo(this.map);
    
      this.drivers[data.id] = {
        marker: newMarkerDriver,
        device_id: data.device_id
      }
  }

  removeMarkerDriver(driver_id) {
    if(driver_id) {
      console.log(this.drivers)
      this.drivers[driver_id].marker.remove();
      delete this.drivers[driver_id];
    }
  }

  animateMarker(marker, newCoordinates) {
    marker.setLngLat(newCoordinates);
    marker.addTo(this.map);
  }
}

