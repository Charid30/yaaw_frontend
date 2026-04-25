// src/app/dashboard/employees/employee.model.ts
export interface Employee {
  id:         string;
  nom:        string;
  prenom:     string;
  telephone:  string;
  role:       'CAISSIER';
  is_active:  boolean;
  shop_id:    string;
  last_login: string | null;
  created_at: string;
}

export interface EmployeeFormData {
  nom:       string;
  prenom:    string;
  telephone: string;
  password:  string;
}
