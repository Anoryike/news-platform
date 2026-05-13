import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ email: string; password: string }>(),
    'Login Success': props<{ token: string; user: { id: number; email: string } }>(),
    'Login Failure': props<{ error: string }>(),
    Register: props<{ email: string; password: string }>(),
    'Register Success': props<{ token: string; user: { id: number; email: string } }>(),
    'Register Failure': props<{ error: string }>(),
    Logout: emptyProps(),
  },
});
