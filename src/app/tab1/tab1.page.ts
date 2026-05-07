import { Component } from '@angular/core';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonRow, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, ExploreContainerComponent],
})
export class Tab1Page {
  constructor() {}
}
