import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/modules/shared.module';
import { MaterialModule } from '../shared/modules/material.module';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { AuthState } from '../ngrxs/auth/auth.state';
import * as AuthActions from '../ngrxs/auth/auth.actions';
import * as UserActions from '../ngrxs/user/user.actions';
import { UserState } from '../ngrxs/user/user.state';
import { SessionStorageService } from '../services/session-storage.service';
import { JWTTokenService } from '../services/jwttoken.service';
import * as CategoryActions from '../ngrxs/category/category.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedModule, MaterialModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'wordWonder';

  constructor(
    private auth: Auth,
    private store: Store<{ auth: AuthState; user: UserState }>,
    private sessionStorageService: SessionStorageService,
    private jwtTokenService: JWTTokenService,
  ) {
    this.store.dispatch(CategoryActions.listCategory());
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        this.store.dispatch(AuthActions.storeIdToken({ idToken: token.token }));
      }
    });
    // console.log(this.get('idToken'));
    if (this.sessionStorageService.getValueFromSession('idToken') != '') {
      this.jwtTokenService.setToken(
        this.sessionStorageService.getValueFromSession('idToken'),
      );
      if (this.jwtTokenService.isTokenExpired()) {
        this.sessionStorageService.removeTokenInSession();
        return;
      }
      this.store.dispatch(
        AuthActions.toggleStaticUserMode({ isStaticUser: true }),
      );
      this.store.dispatch(
        AuthActions.storeIdToken({
          idToken: this.sessionStorageService.getValueFromSession('idToken'),
        }),
      );
    }
  }

  ngOnInit(): void {
    this.store.select('auth', 'idToken').subscribe((val) => {
      if (val != '') {
        this.jwtTokenService.setToken(val);
        this.store.dispatch(UserActions.getById());
      }
    });
    this.store.select('user', 'loadingError').subscribe((val) => {
      if (val == 'User not found') {
        this.store.dispatch(UserActions.create());
      }
    });
    this.store.select('user', 'isCreatedSuccess').subscribe((val) => {
      if (val) {
        this.store.dispatch(UserActions.getById());
      }
    });
  }
}
