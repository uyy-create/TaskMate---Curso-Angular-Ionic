import { Injectable } from "@angular/core";
import { Task } from "../models/task.model";

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [];
  private nextId = 1;
  private STORAGE_KEY = 'taskmate_tasks';

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    localStorage.setItem('taskmate_nextId', String(this.nextId));
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const savedId = localStorage.getItem('taskmate_nextId');
    if (saved) {
      this.tasks = JSON.parse(saved).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)  // ← Importante: convertir string a Date
      }));
    }
    if (savedId) this.nextId = parseInt(savedId);
  }

  addTask(data: Omit<Task, 'id' | 'createdAt'>): Task {
    const task: Task = { ...data, id: this.nextId++, createdAt: new Date() };
    this.tasks.push(task);
    this.saveToStorage();  // ← Guardar después de cada cambio
    return task;
  }

  toggleComplete(id: number): void {
    const task = this.tasks.find(t => t.id === id);
    if (task) { task.completed = !task.completed; this.saveToStorage(); }
  }

  deleteTask(id: number): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveToStorage();
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: number): Task | undefined {
    return this.tasks.find(t => t.id === id);
  }

  getStats(): { total: number; completed: number; pending: number } {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }
}
