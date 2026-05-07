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
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
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
  ],
})
export class Tab1Page {
  stats = { total: 0, completed: 0, pending: 0 };

  constructor(
    private taskService: TaskService,
    private modalCtrl: ModalController
  ) {
    addIcons({ add });
  }

  ionViewWillEnter() {
    this.stats = this.taskService.getStats();
  }

  async openAddTaskModal() {
    const modal = await this.modalCtrl.create({
      component: AddTaskModalComponent,
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.taskService.addTask({
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        completed: false,
      });
      this.stats = this.taskService.getStats();
    }
  }
}
