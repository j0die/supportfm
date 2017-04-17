//'use strict';

/**
 * 
 * To deploy to heroku, run:
 * $ git init
 * $ git add -A
 * $ git commit -m "update"
 * $ git push origin master
 * $ git push heroku master
 * 
 */


/**
 * Stripe keys [STEP4]
 */
var CLIENT_ID               = 'ca_<YOUR-CLIENT-ID>';           
var STRIPE_API_SECRET_KEY   = '<STRIPE_API_SECRET_KEY>';               

var TOKEN_URI               = 'https://connect.stripe.com/oauth/token';
var AUTHORIZE_URI           = 'https://connect.stripe.com/oauth/authorize';

var qs         = require('querystring');
var request    = require('request');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var stripe     = require("stripe")(STRIPE_API_SECRET_KEY);

var app         = express();
var router      = express.Router();              // get an instance of the express Router
var port        = process.env.PORT || 9311;

/**
 * Optional: if you are using Firebase
 * See: https://www.firebase.com/docs/rest/guide/user-auth.html
 * 
 * If you wish to use this, extend your package.json with the following dependencies:
    
    "firebase": "~2.3.1",
    "firebase-token-generator": "2.0.0"
    
  var FIREBASE_SECRET_KEY     = '<FIREBASE_SECRET_KEY>'        
  var FBURL                   = '<FIREBASE_URL>';
  var Firebase                = require('firebase');
  var FBREF                   = new Firebase(FBURL);
 */

/** 
 * =============================================================================
 * Cross Domain Settings
 * =============================================================================
 */
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});



/** 
 * =============================================================================
 * Stripe Charge
 * =============================================================================
 */
 
// regular charging, no destination account, amount will be transferred to the client (i.e. your platform)
router.post('/charge/nodestination', function(req, res) {
    
    console.log("--------- charge/nodestination")
    console.log("charge/nodestination: amount:", req.body.stripeAmount)
    console.log("charge/nodestination: currency:", req.body.stripeCurrency)
    console.log("charge/nodestination: source:", req.body.stripeSource)
    console.log("charge/nodestination: description", req.body.stripeDescription)

    var charge = stripe.charges.create({
        amount:           req.body.stripeAmount,                // amount in cents, again
        currency:         req.body.stripeCurrency,
        source:           req.body.stripeSource,
        description:      req.body.stripeDescription,
    }, function(err, charge) {
        // callback
        if(err) {
          console.log("charge callback: error:", err)
          res.json(err);
        } else {
          // <--
          console.log("charge callback: charge:", charge)
          res.json(charge);   
        }
      }
    ) // ./ charge
});

// charging on behalf of client (stripeDestinationAccountId), charging an application fee
router.post('/charge', function(req, res) {

    console.log("--------- charge")

    console.log("charge: amount:", req.body.stripeAmount)
    console.log("charge: currency:", req.body.stripeCurrency)
    console.log("charge: source:", req.body.stripeSource)
    console.log("charge: description", req.body.stripeDescription)
    console.log("charge: destination", req.body.stripeDestinationAccountId)
    console.log("charge: noodlio fee", req.body.noodlioApplicationFee)
    
    var charge = stripe.charges.create(
      {
        amount:           req.body.stripeAmount,                // amount in cents, again
        currency:         req.body.stripeCurrency,
        source:           req.body.stripeSource,
        description:      req.body.stripeDescription,
        application_fee:  req.body.noodlioApplicationFee
      },
      {stripe_account: req.body.stripeDestinationAccountId},
      function(err, charge) {
        // callback
        if(err) {
          console.log("charge callback: error:", err)
          res.json(err);
        } else {
          // <--
          console.log("charge callback: charge:", charge)
          res.json(charge);   
        }
      }
    ) // ./ charge
});


/** 
 * =============================================================================
 * Stripe connect
 * =============================================================================
 */

// For security reasons, you might want to store the Authorized Credentials (AU) in a
// a database on the server-side. This is because you don't want these credentials
// to be passed on the client-side, making it fraud sensitive. 
// To retrieve the AU, we will need to go through several routes, and thus to 
// transfer some data (such as the Firebase token and userId), we need to make use
// of sessions.
// 
var session = require('express-session')
app.use(session({
  genid: function(req) {
    return genuuid();
  },
  resave: false,
  saveUninitialized: false,
  secret: 'semin de pemin'
}))
function genuuid() {
  return Math.floor(Math.random()*100000000);
};

router.get('/authorize', function(req, res) {
  
  /**
   * Optional, if you are using Firebase to store the data
  console.log("--------- authorize")
  console.log("authorize: firebase userId or custom field: ", req.query.userId)
  console.log("authorize: firebase auth token: ", req.query.token)
  
  session["cookie"] = {
    userId: req.query.userId,
    fbAuthToken: req.query.token
  };
  */
  
  res.redirect(AUTHORIZE_URI + '?' + qs.stringify({
    response_type: 'code',
    scope: 'read_write',
    client_id: CLIENT_ID
  }));
  
  
})

// REDIRECT_URI: callback after authentication
// Here you will make the request to retrieve the Authorization Credentials
router.get('/oauth/callback', function(req, res) {

  console.log("--------- oauth/callback")
  console.log("get auth code: ", req.query.code)
  var AUTHORIZATION_CODE        = req.query.code; 
  
  /**
   * Optional, if you are using Firebase to store the data
  console.log("get userId: ", session["cookie"].userId)

  var userId      = session["cookie"].userId;
  var fbAuthToken = session["cookie"].fbAuthToken;
  */

  // Make /oauth/token endpoint POST request
  request.post({
    url: TOKEN_URI,
    form: {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code: AUTHORIZATION_CODE,
      client_secret: STRIPE_API_SECRET_KEY
    }
  }, function(err, r, body) {
    
    var SCData = JSON.parse(body);
    
    if(err) {
      res.send("Oops something went wrong");
    } else {
      // <--
      res.send("Success! Your account is now setup to use Stripe Connect. You may close this window.");
    };
    
    
    /**
     * Securily Save in Firebase
     
    // Authenticate on the server using the auth token
    var ref = new Firebase(FBURL);
    ref.authWithCustomToken(fbAuthToken, 
      function(error, authData) {
        if (error) {
          console.log("fb sync: auth: error:", error);
        } else {
          //
          // -->
          console.log("fb sync: auth: success:", authData);
          syncFBData();
        }
      }, {
      remember: "sessionOnly"
    });
    
    // Sync data to your firebase server
    function syncFBData() {
      var onComplete = function(error) {
      if (error) {
          console.log("fb sync: error: " + error)
          res.send("Something went wrong... Try again on Noodl.io: " + error);
        } else {
          console.log("fb sync: success: ")
          res.send("Success! Your account is now setup to use Stripe Connect. You may close this window. <br><br> You can now refresh your settings in your Noodl.io account");
        }
      };
      
      ref.child("child_where_you_save_stripe_connect_credentials").child(userId).set(SCData, onComplete);
    };
    */
    
    
  });
})


/** 
 * =============================================================================
 * Firebase Authentication (Generate Token)
 * You retrieve the token by sending a HTTP request from the client side
 * =============================================================================
 */
 
 /**
var FirebaseTokenGenerator  = require("firebase-token-generator");
var tokenGenerator          = new FirebaseTokenGenerator(FIREBASE_SECRET_KEY);
router.post('/firebase/generatetoken', function(req, res) {
    console.log("--------- firebase/generatetoken")
    console.log("fb auth: userId:", req.body.userId)
    var token                   = tokenGenerator.createToken({uid: req.body.userId});
    res.json(token);   
});
*/



/** 
 * =============================================================================
 * Wrapping up
 * =============================================================================
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', router); // register our route
app.listen(port);
console.log('Magic happens on port ' + port);

