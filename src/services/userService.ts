// src/services/userService.ts
import { apiRequest } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

// ── Élèves ────────────────────────────────────────────────────────────────────

export interface StudentResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  registrationNumber: string;
  birthDate: string;
  gender: string;
  className: string;
  parentName: string;
  isActive: boolean;
}

export interface StudentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  registrationNumber: string;
  birthDate?: string;
  gender?: string;
  classId?: string;
  parentId?: string;
}

// ── Enseignants ───────────────────────────────────────────────────────────────

export interface TeacherResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  employeeNumber: string;
  specialty: string;
  hireDate: string;
  isActive: boolean;
}

export interface TeacherRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeNumber: string;
  specialty?: string;
  hireDate?: string;
}

// ── Parents ───────────────────────────────────────────────────────────────────
// Backend : UserRequest / UserResponse avec roleName = "PARENT"

export interface ParentResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleName: string;
  isActive: boolean;
}

export interface ParentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleName: 'PARENT';
}

// ── Employés ──────────────────────────────────────────────────────────────────
// Backend : UserRequest / UserResponse — roleName choisi par l'admin

export interface EmployeeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleName: string;
  isActive: boolean;
}

export interface EmployeeRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleName: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const userService = {

  // ── Élèves ──────────────────────────────────────────────────────────────────

  getAllStudents: (token: string, params?: { classId?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.classId) qs.set('classId', params.classId);
    if (params?.search)  qs.set('search',  params.search);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<StudentResponse[]>(`/users/students${query}`, { token });
  },

  getStudentById: (token: string, id: string) =>
    apiRequest<StudentResponse>(`/users/students/${id}`, { token }),

  createStudent: (token: string, payload: StudentRequest) =>
    apiRequest<StudentResponse>('/users/students', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }),

  updateStudent: (token: string, id: string, payload: StudentRequest) =>
    apiRequest<StudentResponse>(`/users/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      token,
    }),

  deleteStudent: (token: string, id: string) =>
    apiRequest<void>(`/users/students/${id}`, { method: 'DELETE', token }),

  // ── Enseignants ─────────────────────────────────────────────────────────────

  getAllTeachers: (token: string, search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest<TeacherResponse[]>(`/users/teachers${query}`, { token });
  },

  getTeacherById: (token: string, id: string) =>
    apiRequest<TeacherResponse>(`/users/teachers/${id}`, { token }),

  createTeacher: (token: string, payload: TeacherRequest) =>
    apiRequest<TeacherResponse>('/users/teachers', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }),

  updateTeacher: (token: string, id: string, payload: TeacherRequest) =>
    apiRequest<TeacherResponse>(`/users/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      token,
    }),

  deleteTeacher: (token: string, id: string) =>
    apiRequest<void>(`/users/teachers/${id}`, { method: 'DELETE', token }),

  // ── Parents ─────────────────────────────────────────────────────────────────

  getAllParents: (token: string) =>
    apiRequest<ParentResponse[]>('/users', { token }).then(users =>
      users.filter(u => u.roleName === 'PARENT')
    ),

  createParent: (token: string, payload: ParentRequest) =>
    apiRequest<ParentResponse>('/users/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...payload, roleName: 'PARENT' }),
      token,
    }),

  updateParent: (token: string, id: string, payload: ParentRequest) =>
    apiRequest<ParentResponse>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...payload, roleName: 'PARENT' }),
      token,
    }),

  deleteParent: (token: string, id: string) =>
    apiRequest<void>(`/users/${id}`, { method: 'DELETE', token }),

  // ── Employés ────────────────────────────────────────────────────────────────

  getAllEmployees: (token: string) =>
    apiRequest<EmployeeResponse[]>('/users', { token }).then(users =>
      users.filter(u => !['PARENT', 'STUDENT'].includes(u.roleName))
    ),

  createEmployee: (token: string, payload: EmployeeRequest) =>
    apiRequest<EmployeeResponse>('/users/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }),

  updateEmployee: (token: string, id: string, payload: EmployeeRequest) =>
    apiRequest<EmployeeResponse>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      token,
    }),

  deleteEmployee: (token: string, id: string) =>
    apiRequest<void>(`/users/${id}`, { method: 'DELETE', token }),
};
