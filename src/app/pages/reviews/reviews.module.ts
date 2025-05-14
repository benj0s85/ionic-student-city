import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ReviewsComponent } from './reviews.component';

@NgModule({
  declarations: [ReviewsComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: ReviewsComponent
      }
    ])
  ]
})
export class ReviewsModule { } 