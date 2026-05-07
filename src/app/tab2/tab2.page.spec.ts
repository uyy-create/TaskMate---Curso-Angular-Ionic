import { Component } from '@angular/core';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { AddTaskModalComponent } from '../components/add-task-modal/add-task-modal.component';

@Component({ selector: 'app-tab2', templateUrl: 'tab2.page.html' })
export class Tab2Page {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedFilter = 'all';

  constructor(private taskService: TaskService, private router: Router) {}

  ionViewWillEnter() {
    this.tasks = this.taskService.getTasks();
    this.applyFilter();
  }

  filterTasks(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.filteredTasks = this.tasks.filter(t => t.title.toLowerCase().includes(query));
  }

  applyFilter() {
    if (this.selectedFilter === 'pending') this.filteredTasks = this.tasks.filter(t => !t.completed);
    else if (this.selectedFilter === 'done') this.filteredTasks = this.tasks.filter(t => t.completed);
    else this.filteredTasks = [...this.tasks];
  }

  onToggle(task: Task) { this.taskService.toggleComplete(task.id); }

  goToDetail(id: number) { this.router.navigate(['/task-detail', id]); }

  async openAddModal() {
    const modal = await this.modalCtrl.create({ component: AddTaskModalComponent });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.taskService.addTask({ ...data, completed: false });
      this.tasks = this.taskService.getTasks();
      this.applyFilter();
      // Mostrar Toast de confirmación
      const toast = await this.toastCtrl.create({
        message: '✅ Tarea creada correctamente',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    }
  }
}