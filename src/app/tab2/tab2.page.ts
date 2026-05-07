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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, clipboardOutline } from 'ionicons/icons';

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
  ],
})
export class Tab2Page {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedFilter: 'all' | 'pending' | 'done' = 'all';

  constructor(
    private taskService: TaskService,
    private router: Router,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({ add, clipboardOutline });
  }

  ionViewWillEnter() {
    this.tasks = this.taskService.getTasks();
    this.applyFilter();
  }

  filterTasks(event: any) {
    const query = (event.target.value || '').toLowerCase();
    this.filteredTasks = this.tasks.filter((t) =>
      t.title.toLowerCase().includes(query)
    );
  }

  applyFilter() {
    if (this.selectedFilter === 'pending') {
      this.filteredTasks = this.tasks.filter((t) => !t.completed);
    } else if (this.selectedFilter === 'done') {
      this.filteredTasks = this.tasks.filter((t) => t.completed);
    } else {
      this.filteredTasks = [...this.tasks];
    }
  }

  onToggle(task: Task) {
    this.taskService.toggleComplete(task.id);
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
      this.taskService.addTask({ ...data, completed: false });
      this.tasks = this.taskService.getTasks();
      this.applyFilter();

      const toast = await this.toastCtrl.create({
        message: 'Tarea creada correctamente',
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
      await toast.present();
    }
  }
}
