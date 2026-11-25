
import {
  Component, Output, EventEmitter,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-profile-picture-uploader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './profile-picture-uploader.component.html',
  styleUrls: ['./profile-picture-uploader.component.scss'],
})
export class ProfilePictureUploaderComponent {

  @Output() fileSelected = new EventEmitter<File>();

  readonly previewUrl = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly isDragging = signal(false);

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  clearImage(): void {
    this.previewUrl.set(null);
    this.error.set(null);
  }

  private processFile(file: File): void {
    this.error.set(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.error.set('Please upload a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      this.error.set(`Image must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);

    this.fileSelected.emit(file);
  }
}