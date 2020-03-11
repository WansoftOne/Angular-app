import { Component } from '@angular/core';
import { AuthService } from '../usuarios/auth.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {
 title: string = 'App Angular'

 constructor(private authService:AuthService , private router:Router){}

 logout():void{
   this.authService.logout();
   let name = this.authService.usuario.username;
   swal('Logout', `Te esperamos pronto de vuelta ${name}`, 'info');
   this.router.navigate(['/login']);
 }
}
