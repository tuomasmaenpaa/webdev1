const { getUser } = require("../utils/users");
const { getCredentials } = require("../utils/requestUtils");
/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
  // TODO: 8.5 Implement getting current user based on the "Authorization" request header

  // NOTE: You can use getCredentials(request) function from utils/requestUtils.js
  // and getUser(email, password) function from utils/users.js to get the currently
  // logged in user

  // Gets a list [user, pass]
  const credentials = getCredentials(request);
  if(credentials === null){
    return null;
  }
  const user = getUser(credentials[0], credentials[1]);
  return user;

};

module.exports = { getCurrentUser };