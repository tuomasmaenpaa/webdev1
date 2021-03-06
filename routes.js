const responseUtils = require('./utils/responseUtils');
const products = require('./products.json');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { emailInUse, getAllUsers, saveNewUser, validateUser, getUserById, updateUserRole, deleteUserById } = require('./utils/users');
const { getCurrentUser } = require('./auth/auth');
const User = require('./models/user');
const { expect } = require('chai');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET'],
  '/api/products': ['GET']
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
      'Access-Control-Allow-Headers': 'Content-Type,Accept',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers': 'Content-Type,Accept'
    });
    return response.end();
  }

  return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix
 * @returns {boolean}
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = '[0-9a-z]{8,24}';
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 */
const matchUserId = url => {
  return matchIdRoute(url, 'users');
};

const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }

  if (matchUserId(filePath)) {
    // TODO: 8.6 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body

    // Working: Should respond with "401 Unauthorized" when Authorization header is missing
    // Working: Should respond with Basic Auth Challenge when Authorization header is missing

    const logUser = await getCurrentUser(request);

    if (!logUser) {
      response.statusCode = 401;
      response.statusMessage = 'Unauthorized';
      return responseUtils.basicAuthChallenge(response);
    }

    const parts = filePath.split('/');
    const idUserResource = parts[parts.length - 1];

    const resUser = await User.findById(idUserResource).exec();

    //console.log('!!!!', logUser.role)

    // Should respond with "403 Forbidden" when customer credentials are received
    if (logUser.role !== 'admin') {
      return responseUtils.forbidden(response);
    }

    // Should respond with status code 404 when user does not exist
    if (!resUser) {
      response.statusCode = 404;
      return response.end();
    }

    if (method.toUpperCase() === 'GET') {
      return responseUtils.sendJson(response, resUser, 200);
    }
    else if (method.toUpperCase() === 'PUT') {
      const userInfo = await parseBodyJson(request);
      const isRoleSet = Boolean(userInfo.role);
      const isValidRole = Boolean(['admin', 'customer'].includes(userInfo.role));
      if (!isRoleSet || !isValidRole) {
        return responseUtils.badRequest(response, 'Invalid role');
      }
      const existingUser = await User.findById(idUserResource).exec();


      existingUser.role = userInfo.role;
      await existingUser.save();

      return responseUtils.sendJson(response, await User.findById(idUserResource).exec(), 200);
      
    }
    else if (method.toUpperCase() === 'DELETE') {
      await User.deleteOne({email: resUser.email});
      return responseUtils.sendJson(response, resUser, 200);
    }
  }

  // Default to 404 Not Found if unknown url
  if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

  // Check for allowable methods
  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // GET all users
  if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
    // TODO 8.4 Replace the current code in this function.
    // First call getAllUsers() function to fetch the list of users.
    // Then you can use the sendJson(response, payload, code = 200) from 
    // ./utils/responseUtils.js to send the response in JSON format.
    //
    // TODO: 8.5 Add authentication (only allowed to users with role "admin")

    const currentUser = await getCurrentUser(request);

    // Check that user is properly encoded and that Auhtorization header exists
    if (currentUser === null || currentUser === undefined) {
      return responseUtils.basicAuthChallenge(response);
    } else if (currentUser.role === 'admin') {
      const allUsers = await User.find({});
      responseUtils.sendJson(response, JSON.parse(JSON.stringify(allUsers)), 200);
    } else if (currentUser.role === 'customer') {
      return responseUtils.forbidden(response, "403 Forbidden");
    } else {
      return responseUtils.basicAuthChallenge(response);
    }
  }

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    // TODO: 8.4 Implement registration
    // You can use parseBodyJson(request) method from utils/requestUtils.js to parse request body.
    // 
    const userInfo = await parseBodyJson(request);
    const userData = {
      name: userInfo.name,
      email: userInfo.email,
      password: userInfo.password,
    };

    // Make necessary checks
    const emailTaken = await User.findOne({ email: userData.email }).exec();
    if (emailTaken /*|| !(validateUser(userData).length === 0)*/) {
      return responseUtils.badRequest(response, "400 Bad Request");
    }
    const newUser = new User(userData);
    try{
      await newUser.save();
      responseUtils.sendJson(response, newUser, 201);
    }catch(e){
      return responseUtils.badRequest(response, e.message);
    }
  }

  // Get products
  if (filePath === '/api/products' && method.toUpperCase() === 'GET') {
    const currentUser = await getCurrentUser(request);
    if (currentUser === null || currentUser === undefined){
      return responseUtils.basicAuthChallenge(response);
    }else if(currentUser.role === 'admin' || currentUser.role === 'customer'){
      return responseUtils.sendJson(response, products);
    }else{
      return responseUtils.basicAuthChallenge(response);
    }
  }
};

module.exports = { handleRequest };