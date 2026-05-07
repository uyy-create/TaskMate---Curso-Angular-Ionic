import { ModalController } from '@ionic/angular';

export class AddTaskModalComponent {
  title = '';
  description = '';
  priority = 'media';

  constructor(private modalCtrl: ModalController) {}

  dismiss() { this.modalCtrl.dismiss(); }

  save() {
    if (!this.title.trim()) return;
    this.modalCtrl.dismiss({ title: this.title, description: this.description, priority: this.priority });
  }
}