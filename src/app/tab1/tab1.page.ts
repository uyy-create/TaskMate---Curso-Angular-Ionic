import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonProgressBar,
  IonRow,
} from '@ionic/angular/standalone';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonProgressBar,
  ],
})
export class Tab1Page {
  stats = { total: 0, completed: 0, pending: 0 };

  constructor(private taskService: TaskService) {}

  ionViewWillEnter() {
    this.stats = this.taskService.getStats();
  }
}
