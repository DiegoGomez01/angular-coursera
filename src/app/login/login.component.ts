import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessagesService],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  regex = new RegExp('^(([^<>()\\[\\]\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]' +
  '{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$');

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private messagesService: MessagesService,
    private router: Router,
  ) { 
    if (this.loginService.currentUserValue) {
      this.router.navigate(['/request']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(this.regex)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.loginService.login(this.f.email.value, this.f.password.value).subscribe(user => {
      if (user) {
        localStorage.setItem('userLogged', this.f.email.value);
        this.router.navigate(['/request']);
      } else {
        this.messagesService.showErrorNotification('Credenciales inválidas');
        this.loading = false;
      }
    });
  }

}
