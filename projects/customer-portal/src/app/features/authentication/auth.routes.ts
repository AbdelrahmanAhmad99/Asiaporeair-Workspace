
import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login/login.component').then(m => m.LoginComponent),
        title: 'Access Your Suite | Asiaporeair',
    },
    {
        path: 'signup',
        loadComponent: () =>
            import('./pages/signup/signup.component').then(m => m.SignupComponent),
        title: 'Join Asiaporeair | Begin Your Journey',
    }
    ,
    {
        path: 'forgot-password',
        loadComponent: () =>
            import('./pages/forgot-password/forgot-password.component').then(
                m => m.ForgotPasswordComponent
            ),
        title: 'Reset Password | Asiaporeair',
    },
    {
        path: 'reset-password',
        loadComponent: () =>
            import('./pages/reset-password/reset-password.component').then(
                m => m.ResetPasswordComponent
            ),
        title: 'Set New Password | Asiaporeair',
    }
];