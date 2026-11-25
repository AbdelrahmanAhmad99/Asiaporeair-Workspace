// ============================================================================
// profile-avatar-uploader.component.ts
// Asiaporeair | Dumb Component — Avatar Uploader
// ============================================================================

import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-avatar-uploader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './profile-avatar-uploader.component.html',
  styleUrls: ['./profile-avatar-uploader.component.scss']
})
export class ProfileAvatarUploaderComponent {

  @Input() avatarUrl: string | null = null;
  @Input() displayName: string = 'Traveler';
  @Input() loyaltyTier: string = 'Silver';
  @Input() isLoading: boolean = false;

  @Output() avatarSelected = new EventEmitter<File>();

  readonly isDragOver = signal(false);
  readonly previewUrl = signal<string | null>(null);

  get initials(): string {
    return this.displayName
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  get resolvedAvatar(): string | null {
    return this.previewUrl() ?? this.avatarUrl;
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    this.avatarSelected.emit(file);
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
}

