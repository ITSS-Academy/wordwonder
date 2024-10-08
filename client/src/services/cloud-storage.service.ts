import { Injectable } from '@angular/core';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CloudStorageService {
  constructor(private storage: Storage) {}

  uploadFile(
    file: File,
    path: string,
    isPdf: boolean,
  ): Observable<number | string> {
    return new Observable((observer) => {
      const metadata: any = {
        contentType: isPdf ? 'application/pdf' : 'image/jpeg',
      };
      const storageRef = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next(progress);
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          observer.error(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            observer.next(downloadURL);
            observer.complete();
          });
        },
      );
    });
  }
}
