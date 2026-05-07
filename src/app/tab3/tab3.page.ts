import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonAvatar,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonList,
  IonItem,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { school, calendar } from 'ionicons/icons';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonAvatar,
    IonBadge,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonChip,
    IonLabel,
    IonList,
    IonItem,
    IonIcon,
    ExploreContainerComponent,
  ],
})
export class Tab3Page {
  constructor() {
    addIcons({ school, calendar });
  }
}
