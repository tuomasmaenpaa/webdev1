/**
 * List all users (use <template id="user-template"> in users.html)
 *       - Each user should be put inside a clone of the template fragment
 *       - Each individual user HTML should look like this
 *         (notice the id attributes and values, replace "{userId}" with the actual user id)
 *
 *         <div class="item-row" id="user-{userId}">
 *           <h3 class="user-name" id="name-{userId}">Admin</h3>
 *           <p class="user-email" id="email-{userId}">admin@email.com</p>
 *           <p class="user-role" id="role-{userId}">admin</p>
 *           <button class="modify-button" id="modify-{userId}">Modify</button>
 *           <button class="delete-button" id="delete-{userId}">Delete</button>
 *         </div>
 *
 *       - Each cloned template fragment should be appended to <div id="users-container">
 *       - Use getJSON() function from utils.js to fetch user data from server
 */
 list_users = async () =>{
  var template = document.getElementById("user-template");
  var users = await getJSON('/api/users');

  users.forEach((user) =>{
      var cclone = template.cloneNode(true);
      var user_data = user

      cclone.content.querySelector(".item-row").id = "user-" + user_data['_id'];
      cclone.content.querySelector(".user-name").id = "name-" + user_data['_id'];
      cclone.content.querySelector(".user-email").id = "email-" + user_data['_id'];
      cclone.content.querySelector(".user-role").id = "role-" + user_data['_id'];
      cclone.content.querySelector(".modify-button").id = "modify-" + user_data['_id'];
      cclone.content.querySelector(".delete-button").id = "delete-" + user_data['_id'];

      cclone.content.querySelector(".user-name").innerText = user_data['name'];
      cclone.content.querySelector(".user-email").innerText = user_data['email'];
      cclone.content.querySelector(".user-role").innerText = user_data['role'];

      document.getElementById("users-container").appendChild(cclone.content);
  });
};
list_users();

/*
 * Updating/modifying and deleting existing users
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 *       - Use deleteResource() function from utils.js to delete users from server
 *       - Clicking "Delete" button of a user will delete the user and update the listing accordingly
 *       - Clicking "Modify" button of a user will use <template id="form-template"> to
 *         show an editing form populated with the values of the selected user
 *       - The edit form should appear inside <div id="modify-user">
 *       - Afted successful edit of user the form should be removed and the listing updated accordingly
 *       - You can use removeElement() from utils.js to remove the form.
 *       - Remove edit form from the DOM after successful edit or replace it with a new form when another
 *         user's "Modify" button is clicked. There should never be more than one form visible at any time.
 *         (Notice that the edit form has an id "edit-user-form" which should be unique in the DOM at all times.)
 *       - Also remove the edit form when a user is deleted regardless of which user is deleted.
 *       - Modifying a user successfully should show a notification message "Updated user {User Name}"
 *       - Deleting a user successfully should show a notification message "Deleted user {User Name}"
 *       - Use createNotification() function from utils.js to create notifications
 */

(async() => {
  const baseContainer = document.querySelector('#users-container');
  const modifyContainer = document.querySelector('#modify-user');
  const userTemplate = document.querySelector('#user-template');
  const formTemplate = document.querySelector('#form-template');

  const updateUser = async event => {
    event.preventDefault();

    const form = event.target;
    const id = form.querySelector('#id-input').value;
    const role = form.querySelector('#role-input').value;

    try {
      const user = await postOrPutJSON(`/api/users/${id}`, 'PUT', { role });
      document.querySelector(`#role-${id}`).textContent = user.role;
      removeElement('modify-user', 'edit-user-form');
      return createNotification(`Updated user ${user.name}`, 'notifications-container');
    } catch (error) {
      console.error(error);
      return createNotification('Update failed!', 'notifications-container', false);
    }
  };

  const deleteUser = async userId => {
    removeElement('modify-user', 'edit-user-form');

    try {
      const user = await deleteResource(`/api/users/${userId}`);
      removeElement('users-container', `user-${userId}`);
      return createNotification(`Deleted user ${user.name}`, 'notifications-container');
    } catch (error) {
      console.error(error);
      return createNotification('Delete failed!', 'notifications-container', false);
    }
  };

  const showEditForm = (id, name, email, role) => {
    removeElement('modify-user', 'edit-user-form');

    const form = formTemplate.content.cloneNode(true);
    form.querySelector('h2').textContent = `Modify user ${name}`;
    form.querySelector('#id-input').value = id;
    form.querySelector('#name-input').value = name;
    form.querySelector('#email-input').value = email;
    form.querySelector('#role-input').value = role;

    modifyContainer.append(form);
    modifyContainer.querySelector('form').addEventListener('submit', updateUser);
  };

  try {
    const users = await getJSON('/api/users');

    if (users.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No users';
      baseContainer.append(p);
      return;
    }

    users.forEach(user => {
      const { _id: id, name, email, role } = user;
      const userContainer = userTemplate.content.cloneNode(true);

      userContainer.querySelector('.item-row').id = `user-${id}`;
      userContainer.querySelectorAll('[class]').forEach(elem => {
        if (elem.classList.contains('modify-button')) {
          elem.id = `modify-${id}`;
          return elem.addEventListener('click', () => showEditForm(id, name, email, role));
        }

        if (elem.classList.contains('delete-button')) {
          elem.id = `delete-${id}`;
          return elem.addEventListener('click', () => deleteUser(id));
        }

        const prop = elem.className.split('-')[1];
        if (!user[prop]) return;

        elem.id = `${prop}-${id}`;
        elem.textContent = user[prop];
      });

      baseContainer.append(userContainer);
    });
  } catch (error) {
    console.error(error);
    return createNotification(
      'There was an error while fetching users',
      'notifications-container',
      false
    );
  }
})();