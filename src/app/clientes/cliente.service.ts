import { Injectable } from '@angular/core';
//import { DatePipe, formatDate } from '@angular/common';
import { Cliente } from './cliente';
import { Region } from './region';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import swal from 'sweetalert2';
import { AuthService } from '../usuarios/auth.service';

import { Router } from '@angular/router';

@Injectable()
export class ClienteService {
  private urlEndPoint: string = 'http://localhost:8080/api/clients';

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient, private router: Router, private autService:AuthService) { }

  private agregarAuthorizationHeader(){
    let token = this.autService.token;
    if(token != null){
      return this.httpHeaders.append('Authorization','Bearer '+ token);
    }
    return this.httpHeaders;
  }

  private isNoAutorizado(e):boolean{
    if(e.status == 401 || e.status == 403){
      this.router.navigate(['/login']);
      return true;
    }
    return false;
  }

  getRegiones():Observable<Region[]>{
    return this.http.get<Region[]>(`${this.urlEndPoint}/regiones`, {headers:this.agregarAuthorizationHeader()}).pipe(
      catchError( e => {
          this.isNoAutorizado(e);
          return throwError(e);
      })
    );
  }

  getClientes(page: number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      tap((response: any) => {
        console.log('ClienteService: tap 1');
        (response.content as Cliente[]).forEach(cliente => console.log(cliente.nombre));
      }),
      map((response: any) => {
        (response.content as Cliente[]).map(cliente => {
          cliente.nombre = cliente.nombre.toUpperCase();
          //let datePipe = new DatePipe('es');
          //cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
          //cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy', 'es');
          return cliente;
        });
        return response;
      }),
      tap(response => {
        console.log('ClienteService: tap 2');
        (response.content as Cliente[]).forEach(cliente => console.log(cliente.nombre));
      })
    );
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post(this.urlEndPoint, cliente, { headers: this.agregarAuthorizationHeader() })
      .pipe(
        map((response: any) => response.cliente as Cliente),
        catchError(e => {
          if(this.isNoAutorizado(e)){
            return throwError(e);
          }
          if (e.status == 400) {
            return throwError(e);
          }

          console.error(e.error.mensaje);
          swal(e.error.mensaje, e.error.error, 'error');
          return throwError(e);
        })
      );
  }

  getCliente(id): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`, {headers:this.agregarAuthorizationHeader()}).pipe(
      catchError(e => {
        if(this.isNoAutorizado(e)){
          return throwError(e);
        }
        this.router.navigate(['/clientes']);
        console.error(e.error.mensaje);
        swal('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  update(cliente: Cliente): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente, { headers: this.agregarAuthorizationHeader() }).pipe(
      catchError(e => {
        if(this.isNoAutorizado(e)){
          return throwError(e);
        }
        if (e.status == 400) {
          return throwError(e);
        }

        console.error(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`, { headers: this.agregarAuthorizationHeader() }).pipe(
      catchError(e => {
        if(this.isNoAutorizado(e)){
          return throwError(e);
        }

        console.error(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  subirFoto(archivo: File, id): Observable<HttpEvent<{}>> {

    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

    let httpHeaders = new HttpHeaders()
    let token = this.autService.token;
    if(token != null){
      httpHeaders = httpHeaders.append('Authorization','Bearer '+ token);
    }
    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true,
      headers : httpHeaders
    });

    return this.http.request(req).pipe(
      catchError( e => {
          this.isNoAutorizado(e);
          return throwError(e);
      })
    );;

  }

}
