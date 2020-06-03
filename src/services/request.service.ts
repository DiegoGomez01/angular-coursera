import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(
    private http: HttpClient,
  ) { }

  getLatLonGoogle(address, country): Observable<any> {
    return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?address=${address},${country}&key=AIzaSyCxbj2nM1XFoxLSp6lIEMkI6CUG7ifddjg`).pipe(map(res => res));
  }

  getInfoUser(lat,lon): Observable<any> {
    return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=AIzaSyCxbj2nM1XFoxLSp6lIEMkI6CUG7ifddjg`).pipe(map(res => res));
  }

  getDataService(coordinates): Observable<any> {
    return this.http.get<any>('https://api.mapbox.com/directions/v5/mapbox/cycling/' + coordinates + '?geometries=geojson&access_token=pk.eyJ1IjoianVhbm1vbnRlcyIsImEiOiJjajAycnNsMjcwN3J5MnBxcWZ0YXQ1MHczIn0.Nt6C9JdeIv44PUSAkuPiGg').pipe(map(res => res));
  }

}
