import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonCheckbox,
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, clipboardOutline, refresh, cloudOfflineOutline } from 'ionicons/icons';

import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { AddTaskModalComponent } from '../components/add-task-modal/add-task-modal.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonCheckbox,
    IonBadge,
    IonIcon,
    IonFab,
    IonFabButton,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonButton,
  ],
})
export class Tab2Page {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedFilter: 'all' | 'pending' | 'done' = 'all';
  searchQuery = '';

  loading = false;
  error: string | null = null;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({ add, clipboardOutline, refresh, cloudOfflineOutline });
  }

  ionViewWillEnter() {
    this.loadTasks();
  }

  loadTasks(refresherEvent?: any) {
    this.loading = !refresherEvent;
    this.error = null;

    this.taskService.loadTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilter();
        this.loading = false;
        refresherEvent?.target.complete();
      },
      error: (err) => {
        console.error(err);
        this.error =
          'No se pudo conectar con la API. Comprueba que el servidor esté en marcha.';
        this.loading = false;
        refresherEvent?.target.complete();
      },
    });
  }

  filterTasks(event: any) {
    this.searchQuery = (event.target.value || '').toLowerCase();
    this.applyFilter();
  }

  applyFilter() {
    let result = this.tasks;
    if (this.selectedFilter === 'pending') {
      result = result.filter((t) => !t.completed);
    } else if (this.selectedFilter === 'done') {
      result = result.filter((t) => t.completed);
    }
    if (this.searchQuery) {
      result = result.filter((t) =>
        t.title.toLowerCase().includes(this.searchQuery)
      );
    }
    this.filteredTasks = result;
  }

  onToggle(task: Task) {
    this.taskService.toggleComplete(task).subscribe({
      next: (updated) => {
        const idx = this.tasks.findIndex((t) => t.id === updated.id);
        if (idx >= 0) this.tasks[idx] = updated;
        this.applyFilter();
      },
      error: async (err) => {
        console.error(err);
        task.completed = !task.completed;
        const toast = await this.toastCtrl.create({
          message: 'No se pudo actualizar la tarea',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  doRefresh(event: any) {
    this.loadTasks(event);
  }

  goToDetail(id: number) {
    this.router.navigate(['/task-detail', id]);
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddTaskModalComponent,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.taskService.addTask({ ...data, completed: false }).subscribe({
        next: async (created) => {
          this.tasks = [created, ...this.tasks];
          this.applyFilter();

          const toast = await this.toastCtrl.create({
            message: 'Tarea creada correctamente',
            duration: 2000,
            position: 'bottom',
            color: 'success',
          });
          await toast.present();
        },
        error: async (err) => {
          console.error(err);
          const toast = await this.toastCtrl.create({
            message: 'Error al crear la tarea',
            duration: 2000,
            color: 'danger',
          });
          await toast.present();
        },
      });
    }
  }
}
