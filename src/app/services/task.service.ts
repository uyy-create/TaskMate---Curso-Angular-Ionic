import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Task } from '../models/task.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private api = inject(ApiService);

  private cache: Task[] = [];

  loadTasks(): Observable<Task[]> {
    return this.api.getTasks().pipe(
      tap((tasks) => (this.cache = tasks))
    );
  }

  getTaskById(id: number): Observable<Task> {
    return this.api.getTask(id);
  }

  addTask(data: Omit<Task, 'id' | 'createdAt'>): Observable<Task> {
    return this.api.createTask(data).pipe(
      tap((task) => this.cache.unshift(task))
    );
  }

  toggleComplete(task: Task): Observable<Task> {
    return this.api
      .updateTask(task.id, { completed: !task.completed })
      .pipe(
        tap((updated) => {
          const idx = this.cache.findIndex((t) => t.id === updated.id);
          if (idx >= 0) this.cache[idx] = updated;
        })
      );
  }

  updateTask(id: number, changes: Partial<Task>): Observable<Task> {
    return this.api.updateTask(id, changes).pipe(
      tap((updated) => {
        const idx = this.cache.findIndex((t) => t.id === updated.id);
        if (idx >= 0) this.cache[idx] = updated;
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.api.deleteTask(id).pipe(
      tap(() => {
        this.cache = this.cache.filter((t) => t.id !== id);
      }),
      map(() => void 0)
    );
  }

  getCachedTasks(): Task[] {
    return this.cache;
  }

  getStats(): { total: number; completed: number; pending: number } {
    const total = this.cache.length;
    const completed = this.cache.filter((t) => t.completed).length;
    return { total, completed, pending: total - completed };
  }
}
