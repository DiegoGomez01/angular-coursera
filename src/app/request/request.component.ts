import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessagesService } from '../../services/messages.service';
import { RequestService } from '../../services/request.service';
import { Router } from '@angular/router';
declare const alertify: any;
declare const google: any;
declare const mapboxgl: any;

@Component({
  selector: 'app-request-taxi',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
  providers: [RequestService, MessagesService]
})
export class RequestComponent implements OnInit {

  requestForm: FormGroup;
  ListRequest = [];
  ListAssigned = [];
  removeRouteMap = false;
  dataPolyline;
  dataPrintUser;
  dataPrintDriver;
  user;
  removeDriverMap;
  map;
  @ViewChild('addresstext', { static: false }) addresstext: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private requestService: RequestService,
    private messagesService: MessagesService,
    private router: Router,
  ) { }

  get f() { return this.requestForm.controls; }

  ngOnInit() {
    // this.user = this.loginService.currentUserValue;
    this.requestForm = this.formBuilder.group({
      destination: ['', [Validators.required]],
      quantity: ['1'],
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.dataPrintUser = {
          latitude: parseFloat(position.coords.latitude + ''),
          longitude: parseFloat(position.coords.longitude + ''),
          draggable: true
        }
        this.requestService.getInfoUser(position.coords.latitude, position.coords.longitude).subscribe(res => {
          if (res.status === 'OK') {
            this.user = {
              country: res.results[0].address_components[res.results[0].address_components.length - 2].short_name,
              address: res.results[0].formatted_address
            };
            setTimeout(() => {
              this.getPlaceAutocomplete();
            }, 1000);
          } else {
            alert('No se puede obtener la información del usuario')
          }
        });
      });
    } else {
      this.dataPrintUser = {
        latitude: parseFloat('4.570868'),
        longitude: parseFloat('-74.2973328'),
        draggable: false
      }
      this.messagesService.showWarnNotification('Geolocation is not supported by this browser.');
    }
  }

  getMap(map) {
    this.map = map;
  }

  searchTaxiAssignedByLateral(lateral) {
    for (let i = 0; i < this.ListAssigned.length; i++) {
      if (this.ListAssigned[i].taxi.lateral === parseInt(lateral)) {
        return true;
      }
    }
    return false;
  }

  calcApproximateValue() {
    let address = this.requestForm.value.destination
    if (address !== '') {
      this.callGoogleApi(this.clearDirections(address));
    } else {
      this.messagesService.showErrorNotification('Por favor, ingrese un destino');
    }
  }

  callGoogleApi(address) {
    this.requestService.getLatLonGoogle(this.clearDirections(address), this.user.country).subscribe(res => {
      if (res.results) {
        const lngOrigin = this.dataPrintUser.longitude;
        const latOrigin = this.dataPrintUser.latitude;
        const lngDestination = res.results[0].geometry.location.lng;
        const latDestination = res.results[0].geometry.location.lat;
        const coordinates = lngOrigin + ',' + latOrigin + ';' + lngDestination + ',' + latDestination;
        this.getDataServiceDestination(coordinates);
      }
    });
  }

  removeRoute() {
    this.dataPolyline = null;
    this.removeRouteMap = true;
  }

  getDataServiceDestination(coordinates) {
    this.requestService.getDataService(coordinates).subscribe(res => {
      if (res.routes) {
        this.printPolyline(res.routes[0].geometry.coordinates)
      }
    });
  }

  printPolyline(coordinates) {
    this.map.addSource('route', {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': coordinates
        }
      }
    });
    this.map.addLayer({
      'id': 'route',
      'type': 'line',
      'source': 'route',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#2E3190',
        'line-width': 5
      }
    });
  }

  formatCurrency(number) {
    var formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(number);
    return formatted;
  }

  clearDirections(address) {
    const chars = ['#', '-'];
    chars.forEach(char => {
      address = address.replace(' ' + char + ' ', '+');
      address = address.replace(char + ' ', '+');
      address = address.replace(' ' + char, '+');
    });
    return address.replace(/\s/g, '+');
  }

  htmlInfoTaxi(taxi) {
    return `
      <p style="color: black; font-weight: bold;margin-bottom:0">Placa</p>
      <p style="color: grey;margin:0">${taxi.placa}</p>
    `;
  }

  requestServiceFront() {
    if(this.requestForm.invalid) {
      return;
    }
    const res = parseInt(this.requestForm.value.quantity)
    for (let i = 1; i <= res; i++) {
      this.ListRequest.push({
        id: i,
        name: 'Service ' + i,
      });
    }

    setTimeout(() => {
      this.assignedDrivers();
    }, 5000);
  }

  assignedDrivers(){
    const res = parseInt(this.requestForm.value.quantity)
    for (let i = 1; i <= res; i++) {
      const dataDriver = {
        id: i,
        driver_name: `Name`,
        driver_last_name: `LastName Driver ${i}`,
        driver_phone: `+573${Math.floor(Math.random() * 999999999 + 100000000)}`,
        qualification: Math.floor(Math.random() * 5 + 1) ,
        driver_id: i,
        lateral: `${i}`,
        placa: `${i}`,
        device_id: i,
        latitude: this.dataPrintUser.latitude + (Math.random() * (0.005 - 0.0001) + 0.0001) ,
        longitude: this.dataPrintUser.longitude + (Math.random() * (0.005 - 0.0001) + 0.0001) ,
      }
      console.log(Math.random() * (0.005 - 0.0001) + 0.0001);
      this.serviceAssigned(dataDriver);
    }
    
  }

  cancelService(request_id, id, array, id_driver = null) {
    alertify.confirm(`Do you want cancel the request?`,
      () => {
        this.removeServiceFront(id, array, id_driver);
      }, undefined)
      .setHeader('Cancel Service')
      .set('labels', { ok: 'Yes', cancel: 'No' });
  }

  removeServiceFront(id, array, id_driver) {
    switch (array) {
      case 'assigned':
        this.searchServiceAssigned(id, id_driver);
        break;
      case 'request':
        this.searchServiceRequest(id);
        break;
    }
    this.messagesService.showSuccessNotification('Canceled service!');
  }

  searchServiceRequest(id) {
    for (let i = 0; i < this.ListRequest.length; i++) {
      if (parseInt(this.ListRequest[i].id) === parseInt(id)) {
        this.ListRequest.splice(i, 1);
      }
    }
  }

  searchServiceAssigned(id, id_driver) {
    for (let i = 0; i < this.ListAssigned.length; i++) {
      if (parseInt(this.ListAssigned[i].id) === parseInt(id)) {
        this.ListAssigned.splice(i, 1);
      }
    }
    this.removeDriverMap = id_driver;
  }

  async serviceAssigned(dataAssigned) {
    this.searchServiceRequest(dataAssigned.id);
    const data = {
      id: dataAssigned.id,
      driver: {
        name: `${dataAssigned.driver_name} ${dataAssigned.driver_last_name}`,
        phone: dataAssigned.driver_phone,
        photo: 'assets/images/user-default.png',
        rating: parseFloat(dataAssigned.qualification),
        id: dataAssigned.driver_id,
      },
      taxi: {
        lateral: dataAssigned.lateral,
        placa: dataAssigned.placa,
      }
    }
    this.ListAssigned.push(data);

    this.dataPrintDriver = {
      id: dataAssigned.driver_id,
      device_id: dataAssigned.device_id,
      latitude: dataAssigned.latitude,
      longitude: dataAssigned.longitude,
      html: this.htmlInfoTaxi(data.taxi),
    }

    // setTimeout(() => {
    //   const res = parseInt(this.requestForm.value.quantity);
    //   for (let i = 1; i <= res; i++) {
    //     this.searchServiceAssigned(i, i);
    //   }
    // }, 10000);
  }

  arriveTaxi(id, placa, lateral, id_driver) {
    alertify.confirm(`Your car arrived?`,
      () => {
        this.searchServiceAssigned(id, id_driver);
      }, undefined)
      .setHeader('Driver arrived')
      .set('labels', { ok: 'Yes', cancel: 'No' });
  }

  getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement, {
      componentRestrictions: { country: this.user.country },
      types: ['address']
    });
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this.requestForm.patchValue({
        destination: place.name
      });
    });
  }

  exit() {
    localStorage.removeItem('userLogged');
    this.router.navigate(['/']);
  }

}
