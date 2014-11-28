 exports.create = function(opt) {
     return new Push(opt);
 };

 var Cloud = require('ti.cloud');
 var deviceToken = null;
 var isLogin = false;

function alert(txt) {
    var dialog = Ti.UI.createAlertDialog({
        message : txt, ok : 'Okay', title : 'Livesenf'
    }).show();
}

 function Push(opt) {

     this.subscribeChannel=function(opt) {

         if (Ti.App.Properties.hasProperty("devicetoken")) {

             Cloud.PushNotifications.subscribe({
                 channel: opt.channel,
                 device_token: Ti.App.Properties.getString("devicetoken"),
                 type: Ti.Platform.name == 'android' ? 'gcm' : 'ios'
             }, function(e) {
                 if (e.success) {
                     console.log('Success');
                 } else {
                     console.log('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                 }
             });
         }
     };

     this.registerUser = function(opt) {
         Cloud.Users.create({
             username: opt.username,
             password: opt.password,
             password_confirmation: opt.password
         }, function(e) {
             if (e.success) {
                 var user = e.users[0];
                 if (opt.success) {
                     opt.success();
                 }
                 isLogin = true;
             } else {
                 Cloud.Users.login({
                     login: opt.username,
                     password: opt.password
                 }, function(e) {
                     if (e.success) {
                         if (opt.success) {
                             opt.success();
                         }
                         isLogin = true;
                     }
                 });
             }
         });
     };

     this.registerPush = function(opt) {

         if (OS_ANDROID) {
             // Require the module
             var CloudPush = require('ti.cloudpush');

             CloudPush.debug = false;
             CloudPush.showTrayNotificationsWhenFocused = false;

             // Initialize the module
             CloudPush.retrieveDeviceToken({
                 success: deviceTokenSuccess,
                 error: deviceTokenError
             });

             // Process incoming push notifications
             CloudPush.addEventListener('callback', function(evt) {
                 receivePush(evt.payload);
             });

         } else {
             // IOS
             if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
                 function registerForPush() {
                     Ti.Network.registerForPushNotifications({
                         success: deviceTokenSuccess,
                         error: deviceTokenError,
                         callback: receivePush
                     });
                     // Remove event listener once registered for push notifications
                     Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush);
                 }

                 // Wait for user settings to be registered before registering for push notifications
                 Ti.App.iOS.addEventListener('usernotificationsettings', registerForPush);

                 // Register notification types to use
                 Ti.App.iOS.registerUserNotificationSettings({
                     types: [
                         Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
                         Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
                         Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
                     ]
                 });

             } else {
                 // For iOS 7 and earlier
                 Ti.Network.registerForPushNotifications({
                     // Specifies which notifications to receive
                     types: [
                         Ti.Network.NOTIFICATION_TYPE_BADGE,
                         Ti.Network.NOTIFICATION_TYPE_ALERT,
                         Ti.Network.NOTIFICATION_TYPE_SOUND
                     ],
                     success: deviceTokenSuccess,
                     error: deviceTokenError,
                     callback: receivePush
                 });
             }
         }

         // Enable push notifications for this device
         // Save the device token for subsequent API calls
         function deviceTokenSuccess(e) {
             deviceToken = e.deviceToken;
             Ti.App.Properties.setString("devicetoken", deviceToken);
             if (opt.success){
                 opt.success({token:deviceToken});
             }
         }

         function deviceTokenError(e) {
             alert('Failed to register for push notifications! ' + e.error);
         }

         // Process incoming push notifications
         function receivePush(e) {
             var obj = JSON.parse(e);
             console.log(obj);
             console.log(obj.message);
             if (obj.message){
                 alert(obj.message);
             }

         }

     };

 }
