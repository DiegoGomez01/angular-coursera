import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

declare const alertify: any;

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private router: Router) { }

  showSuccessAlert(message, icon, endpoint) {
    let callback;
    if (endpoint) {
      callback = () => {
        this.router.navigate([endpoint]);
      };
    }
    alertify.alert(
      '<div class="justify-content-center"><i class="material-icons" style="font-size: 50px;color: green;">' + icon + '</i></div><br>' +
      '<center><p>' + message + '</p></center>', callback).set({
      label: 'Ok',
      'closable': false
    }).setHeader('¡Éxito!');
  }

  showErrorAlert(message) {
    alertify.alert('<div class="justify-content-center"><h1>Oops...</h1></div>' +
      '<center><p>' + message + '</p></center>',
      () => {}).set({
      label: 'Ok',
      'closable': false
    }).setHeader('¡Error!');
  }

  showErrorNotification(message) {
    alertify.error(message);
  }

  showWarnNotification(message) {
    alertify.warning(message);
  }

  showSuccessNotification(message) {
    alertify.success(message);
  }

}