describe("Login", () => {
	it("[SUCCESS L-1] login", () => {
		cy.visit("/login", {
			failOnStatusCode: false,
		});
		cy.get('input[id="login-email"').type("f.espinosa01@ufromail.cl");
		cy.get('input[id="login-password"').type("nkn5OD5D");
		cy.get("button").click();
		cy.window().then((win) => {
			const user = win.localStorage.getItem("user");
			expect(user).not.to.be.null;
			expect(user.user).exist;
			expect(user.token).exist;
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
