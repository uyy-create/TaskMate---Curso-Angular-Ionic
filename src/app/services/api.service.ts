import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Task } from '../models/task.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface ApiTask {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'alta' | 'media' | 'baja';
  created_at: string;
}

interface ApiTaskInput {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: 'alta' | 'media' | 'baja';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  getTasks(): Observable<Task[]> {
    return this.http
      .get<ApiResponse<ApiTask[]>>(`${this.apiUrl}/tasks`)
      .pipe(map((res) => res.data.map((t) => this.fromApi(t))));
  }

  getTask(id: number): Observable<Task> {
    return this.http
      .get<ApiResponse<ApiTask>>(`${this.apiUrl}/tasks/${id}`)
      .pipe(map((res) => this.fromApi(res.data)));
  }

  createTask(task: Omit<Task, 'id' | 'createdAt'>): Observable<Task> {
    return this.http
      .post<ApiResponse<ApiTask>>(`${this.apiUrl}/tasks`, this.toApi(task))
      .pipe(map((res) => this.fromApi(res.data)));
  }

  updateTask(id: number, changes: Partial<Task>): Observable<Task> {
    return this.http
      .put<ApiResponse<ApiTask>>(`${this.apiUrl}/tasks/${id}`, this.toApi(changes))
      .pipe(map((res) => this.fromApi(res.data)));
  }

  deleteTask(id: number): Observable<{ id: number; deleted: boolean }> {
    return this.http
      .delete<ApiResponse<{ id: number; deleted: boolean }>>(
        `${this.apiUrl}/tasks/${id}`
      )
      .pipe(map((res) => res.data));
  }

  private fromApi(api: ApiTask): Task {
    return {
      id: api.id,
      title: api.title,
      description: api.description ?? undefined,
      completed: api.completed,
      priority: api.priority,
      createdAt: new Date(api.created_at),
    };
  }

  private toApi(task: Partial<Task>): ApiTaskInput {
    const body: ApiTaskInput = {};
    if (task.title !== undefined) body.title = task.title;
    if (task.description !== undefined) body.description = task.description ?? null;
    if (task.completed !== undefined) body.completed = task.completed;
    if (task.priority !== undefined) body.priority = task.priority;
    return body;
  }
}
