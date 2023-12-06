/*import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}*/

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  registrationForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.registrationForm = this.fb.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  navigateToLogin(){
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.registrationForm.valid) {
      const formData = this.registrationForm.value;

      // Make HTTP POST request to your Node.js server
      this.http.post('http://localhost:8080/api/user', formData)
        .subscribe(response => {
          console.log('Registration successful', response);
          // You can handle success, navigate to another page, etc.
        }, error => {
          console.error('Registration failed', error);
          // Handle the error, show a message to the user, etc.
        });
    }
  }
}