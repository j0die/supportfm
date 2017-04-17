# Installation and Setup

To run this package, run first

```
$ npm install
```

then

```
$ node server.js
```

# Usage

Send an XMLHttpRequest To the location of your server with `/charge`

## Example in Angular

```
angular.module('starter.services', [])

.factory('StripeCharge', function($q, $http, StripeCheckout) {
  var self = this;

  /**
   * Connects with the backend to charge the customer
   * Checks first if the account has been connected (Stripe Connect)
   *
   */
  self.chargeUser = function(stripeToken, ProductMeta) {
    var qCharge = $q.defer();

    var curlData = {
      stripeCurrency:         "usd",
      stripeAmount:           Math.floor(ProductMeta.priceUSD*100),  // charge handles transactions in cents
      stripeSource:           stripeToken,
      stripeDescription:      "Your custom description here"
    };
    $http.post(STRIPE_URL_CHARGE, curlData)
    .success(
      function(StripeInvoiceData){
        qCharge.resolve(StripeInvoiceData);
        // you can store the StripeInvoiceData for your own administration
      }
    )
    .error(
      function(error){
        console.log(error)
        qCharge.reject(error);
      }
    );
    return qCharge.promise;
  };


  /**
   * Get a stripe token through the checkout handler
   */
  self.getStripeToken = function(ProductMeta) {
    var qToken = $q.defer();

    var handlerOptions = {
        name: ProductMeta.title,
        description: ProductMeta.description,
        amount: Math.floor(ProductMeta.priceUSD*100)
    };

    var handler = StripeCheckout.configure({
        name: ProductMeta.title,
        token: function(token, args) {
          //console.log(token.id)
        }
    })

    handler.open(handlerOptions).then(
      function(result) {
        var stripeToken = result[0].id;
        if(stripeToken != undefined && stripeToken != null && stripeToken != "") {
            //console.log("handler success - defined")
            qToken.resolve(stripeToken);
        } else {
            //console.log("handler success - undefined")
            qToken.reject("ERROR_STRIPETOKEN_UNDEFINED");
        }
      }, function(error) {
        if(error == undefined) {
            qToken.reject("ERROR_CANCEL");
        } else {
            qToken.reject(error);
        }
      } // ./ error
    ); // ./ handler
    return qToken.promise;
  };


  return self;
})
```
