import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { AboutComponent } from './about/about.component';
import { HospitalLoginComponent } from './hospital-login/hospital-login.component';
import { SignupComponent } from './signup/signup.component';
import { HosprecComponent } from './hosprec/hosprec.component';
const routes: Routes = [
  { path: '', component: HomepageComponent},
  { path: 'about', component: AboutComponent},
  { path: 'login', component: HospitalLoginComponent},
  { path: 'sign', component: SignupComponent},
  { path: 'hosp', component: HosprecComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
