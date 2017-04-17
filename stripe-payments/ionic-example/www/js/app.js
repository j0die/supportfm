// Stripe Charge example
// Please make sure that you have setup your Secret Key, the Server-Side (Node package) and your Publishable Key

var SERVER_SIDE_URL             = "<SERVER_SIDE_URL>";
var STRIPE_API_PUBLISHABLE_KEY  = "<STRIPE_API_PUBLISHABLE_KEY>";

angular.module('starter', ['ionic', 'stripe.checkout', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, StripeCheckoutProvider) {

  // Define your STRIPE_API_PUBLISHABLE_KEY
  StripeCheckoutProvider.defaults({key: STRIPE_API_PUBLISHABLE_KEY});

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


  // Each tab has its own nav history stack:
  .state('dash', {
    url: '/dash',
    templateUrl: 'templates/example.html',
    controller: 'DashCtrl',
    resolve: {
      // checkout.js isn't fetched until this is resolved.
      stripe: StripeCheckoutProvider.load
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/dash');

});
