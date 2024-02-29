import Uppy from '@uppy/core';
import FileInput from '@uppy/file-input';
import { ChangeEvent } from 'react';

class FileUploader {
  private uppy = new Uppy({
    restrictions: {
      allowedFileTypes: ['.png'],
      maxFileSize: 3 * 1000 * 1000,
    },
  });

  constructor() {
    this.uppy.use(FileInput, {
      locale: { strings: { chooseFiles: 'Choose files' } },
    });
  }

  public addPicture(event: ChangeEvent) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target?.files ?? []);

    files.forEach((file) => {
      try {
        this.uppy.addFile({
          source: 'file input',
          name: file?.name,
          type: file?.type,
          data: file,
        });
      } catch (error) {
        console.log(error);
      }
    });
  }

  public getPictureBase64Data() {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      console.log(this.uppy.getFiles());
      reader.readAsDataURL(this.uppy.getFiles()[0].data);

      reader.onloadend = () => {
        if (reader.result !== null && typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read base64 data.'));
        }
      };
    });
  }

  public deleteFiles() {
    this.uppy.cancelAll();
  }
}

export default FileUploader;
