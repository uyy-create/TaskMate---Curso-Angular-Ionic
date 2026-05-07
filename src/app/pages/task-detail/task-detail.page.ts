import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonBadge,
  IonNote,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, checkmark, refresh, cloudOfflineOutline } from 'ionicons/icons';

import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonBadge,
    IonNote,
    IonSpinner,
  ],
})
export class TaskDetailPage implements OnInit {
  task: Task | undefined;
  loading = false;
  error: string | null = null;
  taskId = 0;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ trash, checkmark, refresh, cloudOfflineOutline });
  }

  ngOnInit() {
    this.taskId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.loadTask();
  }

  loadTask() {
    this.loading = true;
    this.error = null;
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        if (err?.status === 404) {
          this.error = 'La tarea no existe.';
        } else {
          this.error =
            'No se pudo conectar con la API. Comprueba que el servidor esté en marcha.';
        }
        this.loading = false;
      },
    });
  }

  toggleComplete() {
    if (!this.task) return;
    this.taskService.toggleComplete(this.task).subscribe({
      next: (updated) => (this.task = updated),
      error: async (err) => {
        console.error(err);
        const toast = await this.toastCtrl.create({
          message: 'No se pudo actualizar la tarea',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  async deleteTask() {
    if (!this.task) return;
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tarea',
      message: '¿Estás seguro? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (!this.task) return;
            this.taskService.deleteTask(this.task.id).subscribe({
              next: () => this.router.navigate(['/tabs/tab2']),
              error: async (err) => {
                console.error(err);
                const toast = await this.toastCtrl.create({
                  message: 'No se pudo eliminar la tarea',
                  duration: 2000,
                  color: 'danger',
                });
                await toast.present();
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
