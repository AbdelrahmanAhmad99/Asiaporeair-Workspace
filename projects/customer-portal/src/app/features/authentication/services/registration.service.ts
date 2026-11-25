
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { UserDto } from '../models/auth.model';

@Injectable({
    providedIn: 'root',
})
export class RegistrationService {

    constructor(private readonly authService: AuthService) { }


    registerPassenger(dto: UserDto): Observable<string> {
        return this.authService.registerUser(dto);
    }
}