import config from '../config/config';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';

/**
 * Matches a username to a correct email address given a regex pattern. Truthy if the email is
 * valid, false otherwise.
 *
 * @param username sign-in username
 * @returns {boolean}
 */
const isValidUserName = (username) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = new RegExp(emailRegex).test(username.toLowerCase());
  console.log(`valid email address: ${isValid}`);
  return isValid;
}

/**
 * Generates a random id. Note: add to a shared utility folder to reuse.
 *
 * @param length the generated id length
 * @returns {string}
 */
const generateRandomId = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const addNonBreakingSpace = (spaces) => {
  let space = '';
  for (let i = 0; i < spaces; i++) {
    space += '&nbsp';
  }
  return space;
}

/**
 * Conducts a timeout in milliseconds.
 * @param ms time in ms
 * @returns {Promise<unknown>}
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Collects user data from sign in username and user pool data.
 */
const collectUserData = (username, userPool) => {
  return {
    Username: username,
    Pool: userPool,
  };
};

/**
 * Collects user pool data from Cognito configuration.
 *
 * @return {{UserPoolId: string, ClientId: string}}
 */
const collectUserPoolData = () => {
  return {
    UserPoolId: config.cognito.userPoolId,
    ClientId: config.cognito.clientId,
  }
}

/**
 * Gets Amazon Cognito User Pool.
 *
 * @param userPoolData user pool data
 * @return {module:amazon-cognito-identity-js.CognitoUserPool}
 */
const getUserPool = (userPoolData) => {
  return new AmazonCognitoIdentity.CognitoUserPool(userPoolData);
}

/**
 * Get Cognito user email attribute.
 *
 * @param email user email
 * @return {module:amazon-cognito-identity-js.CognitoUserAttribute}
 */
const getCognitoAttributeEmail = (email) => {
  return new AmazonCognitoIdentity.CognitoUserAttribute(email);
}

/**
 * Get Cognito user personal name attribute.
 *
 * @param personalName user personal name
 * @return {module:amazon-cognito-identity-js.CognitoUserAttribute}
 */
const getCognitoAttributePersonalName = (personalName) => {
  return new AmazonCognitoIdentity.CognitoUserAttribute(personalName);
}

/**
 * Builds a cognito user by building user pool data with cognito pool id, cognito
 * client id and username.
 *
 * @see CognitoUser
 * @see CognitoIdentityServiceProvider
 */
const buildCognitoUser = (username) => {
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(collectUserPoolData());
  const data = collectUserData(username, userPool);
  return new AmazonCognitoIdentity.CognitoUser(data);
};

export default {
  isValidUserName, buildCognitoUser, generateRandomId, collectUserPoolData, collectUserData,
  getUserPool, getCognitoAttributePersonalName, getCognitoAttributeEmail, sleep, addNonBreakingSpace
};
