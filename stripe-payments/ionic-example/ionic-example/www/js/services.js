angular.module('starter.services', [])

.factory('StripeCharge', function($q, $http, StripeCheckout) {
  var self = this;

  /**
   * Connects with the backend (server-side) to charge the customer
   *
   * # Note on the determination of the price
   * In this example we base the $stripeAmount on the object ProductMeta which has been
   * retrieved on the client-side. For safety reasons however, it is recommended to
   * retrieve the price from the back-end (thus the server-side). In this way the client
   * cannot write his own application and choose a price that he/she prefers
   */
  self.chargeUser = function(stripeToken, ProductMeta) {
    var qCharge = $q.defer();

    var chargeUrl = SERVER_SIDE_URL + "/charge";
    var curlData = {
      stripeCurrency:         "usd",
      stripeAmount:           Math.floor(ProductMeta.priceUSD*100),  // charge handles transactions in cents
      stripeSource:           stripeToken,
      stripeDescription:      "Your custom description here"
    };
    $http.post(chargeUrl, curlData)
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
        amount: Math.floor(ProductMeta.priceUSD*100),
        image: "img/perry.png",
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
