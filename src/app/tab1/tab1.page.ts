import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonButton,
  IonIcon,
  IonSpinner,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, refresh } from 'ionicons/icons';
import { TaskService } from '../services/task.service';
import { AddTaskModalComponent } from '../components/add-task-modal/add-task-modal.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonProgressBar,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
})
export class Tab1Page {
  stats = { total: 0, completed: 0, pending: 0 };
  loading = false;
  error: string | null = null;

  constructor(
    private taskService: TaskService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({ add, refresh });
  }

  ionViewWillEnter() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.error = null;
    this.taskService.loadTasks().subscribe({
      next: () => {
        this.stats = this.taskService.getStats();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error =
          'No se pudo conectar con la API. Comprueba que el servidor esté en marcha.';
        this.loading = false;
      },
    });
  }

  async openAddTaskModal() {
    const modal = await this.modalCtrl.create({
      component: AddTaskModalComponent,
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.taskService
        .addTask({
          title: data.title,
          description: data.description,
          priority: data.priority,
          category: data.category,
          completed: false,
        })
        .subscribe({
          next: async () => {
            this.stats = this.taskService.getStats();
            const toast = await this.toastCtrl.create({
              message: 'Tarea creada correctamente',
              duration: 2000,
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
