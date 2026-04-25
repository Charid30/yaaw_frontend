// src/app/dashboard/employees/employee.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, EmployeeFormData } from './employee.model';

interface ListRes   { success: boolean; data: { employees: Employee[] } }
interface SingleRes { success: boolean; message: string; data: { employee: Employee } }
interface OkRes     { success: boolean; message: string }

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly API = `${environment.apiUrl}/employees`;
  constructor(private http: HttpClient) {}

  getAll():                                             Observable<ListRes>   { return this.http.get<ListRes>(this.API); }
  create(data: EmployeeFormData):                       Observable<SingleRes> { return this.http.post<SingleRes>(this.API, data); }
  update(id: string, data: Partial<EmployeeFormData>):  Observable<SingleRes> { return this.http.patch<SingleRes>(`${this.API}/${id}`, data); }
  toggle(id: string):                                   Observable<SingleRes> { return this.http.patch<SingleRes>(`${this.API}/${id}/toggle`, {}); }
  resetPassword(id: string, pwd: string):               Observable<OkRes>     { return this.http.patch<OkRes>(`${this.API}/${id}/password`, { nouveau_mot_de_passe: pwd }); }
  delete(id: string):                                   Observable<OkRes>     { return this.http.delete<OkRes>(`${this.API}/${id}`); }
}
