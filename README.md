# H1 Delivery Tracking System
## H2 User Stories
## The Delivery Tracking System provides simple and effective communication capabilities for a Delivery Service that provides Pickup and Delivery services for a group of Vendors who:
1. Fulfill Orders from their customers that require delivery to a third party.
2. Want the ability to have automated tracking and notification of the Orders as they are picked up by the Delivery service, sorted and delivered to their destinations.
3. Want the ability to notify, or have their customers notified or able to view the delivery progress.
## The Delivery Tracking System provides the Delivery Service with an easy to use interface to match Drivers with Orders, and in a future iteration, provide optimal delivery routing by leveraging Open Street Maps and computing routes based on the number of Drivers and the shortest time between delivery addresses.

## The Delivery Tracking Server provides an API that serves data requests from the front end Users, who have the role of Vendor, Depot or Driver. 
1. Users
  * Can have role of Depot, Vendor or Driver
  * Once logged in, Users are redirected to their role-based dashboard that shows a filtered list of current orders. 

2. Orders
  * Store Order, Pickup and Delivery status
  * Specify 
    ** Pickup location
    ** Pickup time slot (am/pm) 
    ** Delivery destination
  * Provide Delivery Instructions
  * Provide Vendor order #
  * Specify order size in standardized vehicle storage units

3. Vendors 
  * Vendors create Orders with initial status "pending"
  * The Vendor Dashboard shows all orders entered by the Vendor in date order.
  * Order is added to Pickups queue with 'pending' status.
  * Order is added to Deliveries queue with 'pending' status.
  * Can CRUD Orders
  * Can Cancel Deliveries

4. Depot 
  * Depot assigns a Driver to each Order for Pickup
    ** Order status changes to "scheduled for pickup". 
    ** Order is added to Driver's pickup queue
    ** Notifications are sent to the Vendor

  * Depot receives physical orders and performs Arrival Scan
    ** Arrival Scan is performed 
    ** Order status is updated to "at depot"
    ** Notifications are sent to the Vendor
  * Depot sorts Orders by delivery Zone  
  * Depot assigns a Driver to each Order for Delivery
    ** Order status changes to "dispatched for delivery". 
    ** Order is added to Driver's delivery queue
    ** Notifications are sent to the Vendor
  * Can CRUD Drivers 
  * Can assign a Driver to a Pickup
  * Can assign a Driver to a Delivery
  * Can edit Driver's queue

5. Driver 
  * The Pickup Driver picks up queued Orders from the Vendor
    ** Order status changes to "Picked up". 
    ** Pickup status changes to "completed". 
  * The Pickup Driver drops Orders at the Depot.
    ** Order status changes to "arrived at depot". 
    ** Pickup status changes to "completed". 

  * The Pickup Driver picks up queued Orders from the Vendor and drops them at the Destination.

  * The Delivery Driver picks up queued Orders from the Depot and drops them at the Destination.

  * The Driver dashboard shows Orders in the Pickup queues and the Delivery Queues that have been assigned to the Driver by the Depot.

  * Changing the Order status to "arrived at Depot" causes the Order  to be removed from the Pickup queue and added to the Delivery queue. The Order is updated with it's Delivery id.
