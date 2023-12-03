import { LOGIN_CREDENTIALS } from "../consts/global-consts";
describe("Login", () => {
  it("[SUCCESS L-1] login", () => {
    cy.visit("/login", {
      failOnStatusCode: false,
    });
    cy.get('input[id="login-email"').type(LOGIN_CREDENTIALS.EMAIL);
    cy.get('input[id="login-password"').type(LOGIN_CREDENTIALS.PASSWORD);
    cy.get("button").click();
    cy.url().should(
      "eq",
      "http://pruebas-soft.s3-website.us-east-2.amazonaws.com/"
    );
    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem("user"));
      expect(user).exist;
    });
  });
  it("[Error L-2] invalid credentials", () => {
    cy.visit("/login", {
      failOnStatusCode: false,
    });
    cy.get('input[id="login-email"').type("correo@incorrecto.cl");
    cy.get('input[id="login-password"').type("correo");
    cy.get("button").click();

    cy.get(".text-negative").should("text", "invalid credentials");
  });
});
