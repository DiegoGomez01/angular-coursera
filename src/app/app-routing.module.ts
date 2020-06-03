import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RequestComponent } from './request/request.component'


const routes: Routes = [
  {path: 'login', component: LoginComponent },
  {path: 'request', component: RequestComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
