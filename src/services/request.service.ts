import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(
    private http: HttpClient,
  ) { }

  getLatLonGoogle(address, country): Observable<any> {
    return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?address=${address},${country}&key=${environment.keyGoogle}`).pipe(map(res => res));
  }

  getInfoUser(lat,lon): Observable<any> {
    return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${environment.keyGoogle}`).pipe(map(res => res));
  }

  getDataService(coordinates): Observable<any> {
    return this.http.get<any>(`https://api.mapbox.com/directions/v5/mapbox/cycling/${coordinates}?geometries=geojson&access_token=${environment.KeyMapboxService}`).pipe(map(res => res));
  }

}
