import { Uppy } from '@uppy/core';
import FileInput from '@uppy/file-input';
import { ChangeEvent } from 'react';

class FileUploader {
  private readonly uppy = new Uppy({
    restrictions: {
      allowedFileTypes: ['.png'],
      // this equals ~2MB
      maxFileSize: 2.1 * 1000 * 1000,
    },
  });

  constructor() {
    this.uppy.use(FileInput, {
      locale: { strings: { chooseFiles: 'Choose files' }, pluralize: () => 1 },
    });
  }

  public addPicture(event: ChangeEvent): string[] {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target?.files ?? []);
    //if multiple files support is wanted in future
    const fileErrors: string[] = [];
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
        fileErrors.push(error as string);
      }
    });
    return fileErrors;
  }

  public getPictureBase64Data() {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const files = this.uppy.getFiles();
      // only one picture added at the time since file is deleted afterwards
      if (files.length > 0) {
        reader.readAsDataURL(files[0].data);

        reader.onloadend = () => {
          if (reader.result !== null && typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read base64 data.'));
          }
        };
      } else {
        resolve(null);
      }
    });
  }

  public deleteFiles() {
    this.uppy.cancelAll();
  }
}

export default FileUploader;
