import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from '../../services/database';
import { AuthService } from 'src/services/auth.service';
import { AlertController, ModalController } from '@ionic/angular';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  subscriptions: any[] = [];
  user: any;
  selectedSubscription: any ={};

  constructor(private subscriptionService: SubscriptionService, private authService: AuthService, private alertController: AlertController, private modalController: ModalController) {}

  ngOnInit() {
    console.log('Before Sequelize Query');
    this.subscriptionService.getAllSubscriptionsWithPayments().subscribe((data) => {
      console.log('Subscription with payments:', data);
      this.subscriptions = data;

      this.subscriptions = data.sort((a, b) => new Date(b.startdate).getTime() - new Date(a.startdate).getTime()).slice(0, 3);

    });

    this.authService.getUserData().subscribe((user) => {
      this.user = user;
    });
  }

  updateSubscriptionDetails(): void {
    // Assuming you have a selectedSubscription object with the updated data
    const payment = {
      nextpayment: this.selectedSubscription.nextpayment,
      cycle: this.selectedSubscription.cycle,
      price: this.selectedSubscription.payment.price
    }

    const updatedData = {
      category: this.selectedSubscription.category,
      title: this.selectedSubscription.title,
      subscriptionplan: this.selectedSubscription.subscriptionplan,
      startdate: this.selectedSubscription.startdate,
      payment_id: this.selectedSubscription.payment_id,
      payment: payment
    };

    console.log('Updated data', updatedData)
    // Assuming you have the subscription ID
    const subscriptionId = this.selectedSubscription.subscription_id;
  
    // Call the service method to update the subscription
    this.subscriptionService.updateSubscription(subscriptionId, updatedData)
    .subscribe(
      (response) => {
        // Handle success, e.g., show a success message
        console.log('Subscription updated successfully', response);

        // Optionally, update the local subscription object
        const updatedSubscriptionIndex = this.subscriptions.findIndex(sub => sub.subscription_id === subscriptionId);
        if (updatedSubscriptionIndex !== -1) {
          this.subscriptions[updatedSubscriptionIndex] = { ...this.subscriptions[updatedSubscriptionIndex], ...updatedData };
        }
        this.closeModals();
      },
      (error) => {
        // Handle error, e.g., show an error message
        console.error('Error updating subscription', error);
      }
    );
      
  }

  onDeleteButtonClick(subscriptionId: number): void {
    this.subscriptionService.deleteSubscription(subscriptionId).subscribe(
      response => {
        console.log(response.message);
  
        this.subscriptions = this.subscriptions.filter(sub => sub.subscription_id !== subscriptionId);
      },
      error => {
        console.error('Error deleting subscription:', error);
      }
    );
  }

  async AlertsetOpen(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Bekræft opsigelse',
      message: 'Du er ved at opsige dit abonnement.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Opsigelse annulleret');
          }
        },
        {
          text: 'Bekræft',
          handler: () => {
            this.onOpsigButtonClick();
          }
        }
      ]
    });

    await alert.present();
  }
  
  isModalOpen = false;


  setOpen(isOpen: boolean, subscription?: any): void {
    this.isModalOpen = isOpen;
    if (subscription) {
      console.log("virker ikke", subscription)
      this.selectedSubscription = subscription;
    }
  }

  onOpsigButtonClick(): void {
    const subscriptionToDelete = this.subscriptions.find(sub => sub.subscription_id === this.selectedSubscription.subscription_id);
  
    if (!subscriptionToDelete) {
      console.error('Subscription not found for deletion:', this.selectedSubscription.subscription_id);
      
      this.isModalOpen = false;
      
      return;
    }
  
    this.subscriptionService.deleteSubscription(subscriptionToDelete.subscription_id).subscribe(
      response => {
        console.log(response.message);
  
        this.subscriptions = this.subscriptions.filter(sub => sub.subscription_id !== subscriptionToDelete.subscription_id);
      },
      error => {
        console.error('Error deleting subscription:', error);
  
        console.log('Error response:', error);
      }
    );
    this.isModalOpen = false;
    console.log('Modal closed successfully');
  }
  isModalTwoOpen = false;

  setTwoOpen(isOpen: boolean) {
    this.isModalTwoOpen = isOpen;
  }

  closeModals(): void {
    this.isModalOpen = false;
    this.isModalTwoOpen = false;
  }

}

