import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-add-task-modal',
  templateUrl: './add-task-modal.component.html',
  styleUrls: ['./add-task-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonNote,
  ],
})
export class AddTaskModalComponent implements OnInit {
  taskForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {
    addIcons({ close });
  }

  ngOnInit() {
    this.taskForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: ['', Validators.maxLength(500)],
      priority: ['media', Validators.required],
      category: ['personal'],
    });
  }

  get titleError(): string {
    const ctrl = this.taskForm.get('title');
    if (!ctrl || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'El título es obligatorio';
    if (ctrl.hasError('minlength')) return 'Mínimo 3 caracteres';
    if (ctrl.hasError('maxlength')) return 'Máximo 100 caracteres';
    return '';
  }

  get descriptionError(): string {
    const ctrl = this.taskForm.get('description');
    if (!ctrl || !ctrl.touched) return '';
    if (ctrl.hasError('maxlength')) return 'Máximo 500 caracteres';
    return '';
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.modalCtrl.dismiss(this.taskForm.value);
  }
}
