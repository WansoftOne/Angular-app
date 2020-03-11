import { Component, OnInit } from '@angular/core';
import { Usuario } from './usuario';
import swal from 'sweetalert2';
import {AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  titulo:string = "Iniciar Sesion";
  usuario:Usuario;

  constructor(private authService:AuthService, private router:Router) {
    this.usuario = new Usuario();
  }

  ngOnInit() {
    if(this.authService.isAuthenticated()){
      swal('Login', `Hola de nuevo ${this.authService.usuario.username}`,'info');
      this.router.navigate(['/clientes']);
    }
  }

  login():void{
    console.log(this.usuario);
    if(this.usuario.username == null  || this.usuario.password == null){
      swal('Error Login', 'Username o password vacio', 'error');
      return;
    }
    this.authService.login(this.usuario).subscribe(response => {
        this.authService.guardarToken(response.access_token);
        this.authService.guardarUsuario(response.access_token);
        let usuario = this.authService.usuario; // los getters se manejan como una propiedad
        this.router.navigate(['/clientes']);
        swal('Login', `Hola ${usuario.username}, has iniciado sesion con exito`, 'success');
      }
    );
  }
}
