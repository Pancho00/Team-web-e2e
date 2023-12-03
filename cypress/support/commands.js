// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * Send login request with email and password
 */
import { LOGIN_CREDENTIALS } from "../consts/global-consts";
Cypress.Commands.add("login", () => {
  return cy
    .request({
      method: "POST",
      url: `http://3.138.52.135:3000/auth/login`,
      body: {
        email: LOGIN_CREDENTIALS.EMAIL,
        password: LOGIN_CREDENTIALS.PASSWORD,
      },
    })
    .then(({ body }) => {
      const { token, user } = body;
      cy.window().then((win) => {
        win.localStorage.setItem("user", JSON.stringify({ token, user }));
        return token;
      });
    });
});

/**
 * Send request to clubs endpoint with the input token and return the user clubs
 */
Cypress.Commands.add("getClubs", (token) => {
  cy.request({
    url: `http://3.138.52.135:3000/clubs`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(({ body }) => {
    return body.clubs;
  });
});
