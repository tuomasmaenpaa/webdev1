/**
 * TODO: 8.4 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */

 var form = document.getElementById('register-form');
 form.addEventListener("submit", async function(event){
     event.preventDefault();
     var user = {name: document.getElementById('name').value,
                 email: document.getElementById('email').value,
                 password: document.getElementById('password').value
     }
     var password = document.getElementById('password').value;
     var passwordConfirmation = document.getElementById('passwordConfirmation').value;
     if (password !== passwordConfirmation){
         createNotification(
             "Password and password confirmation do not match",
             "notifications-container",
             false);
     }
     else {
         var res = await postOrPutJSON("/api/register", "POST", user);
         
         if (!res.hasOwnProperty('error')){
             createNotification(
                 "Registeration succesful",
                 "notifications-container",
                 true);
             form.reset();
         }
         else {
             createNotification(
                 res['error'],
                 "notifications-container",
                 false);
         }
     }
     return false;
 
 });
 