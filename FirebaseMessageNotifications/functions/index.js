

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.database.ref('/notifications/messages/{user_id}/{notification_id}').onWrite((change, context) => {

  

   const user_id = context.params.user_id;
   const notification_id = context.params.notification_id;

  
   if(!change.after.exists()){
     return console.log('A Notification has been deleted from the database: ',notification_id);
    }


	
	const fromUser = admin.database().ref(`/notifications/messages/${user_id}/${notification_id}`).once('value');
	
	
	 return fromUser.then(fromUserResult => {

    const from_user_id = fromUserResult.val().from;
	const messageToSend = fromUserResult.val().message;


    const userQuery = admin.database().ref(`Users/${from_user_id}/name`).once('value');
    const deviceToken = admin.database().ref(`Token/${user_id}/token`).once('value');
	const userImage = admin.database().ref(`Users/${from_user_id}/image`).once('value');

    return Promise.all([userQuery, deviceToken, userImage]).then(result => {

      	const userName = result[0].val();
      	const token_id = result[1].val();
		const imageUser = result[2].val();
		

      /*
       * We are creating a 'payload' to create a notification to be sent.
       */

  const payload = {
	  
	
        data : {
			title : `${userName}`,
          	body: `${messageToSend}`,
          	icon: `${imageUser}`,
         	click_action : ".ChatActivity",
          	from_user_id : from_user_id
        }

	  

      };
		const options = {
  priority: 'high',
  timeToLive: 0
};

     

      return admin.messaging().sendToDevice(token_id, payload, options).then(response => {

      return console.log('This was the notification Feature');

      });

    });

  });
	
	

}); 


