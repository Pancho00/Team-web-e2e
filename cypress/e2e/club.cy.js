import { faker } from '@faker-js/faker';

describe("Club", () => {
	let token;

	beforeEach(() => {
		cy.login().then((t) => {
			token = t;
		})
	});

	it("[SUCCESS C-1] club details", () => {
		cy.getClubs(token).then((clubes) => {
			cy.visit("/", {
				failOnStatusCode: false,
			});
			cy.get(`div[id=${clubes[0]._id}]`).click();
			cy.get('span[class="text-h3"]').contains(clubes[0].name);
		});
	});

	it("[ERROR C-2] redirect to /login page when token does not exist", () => {
		cy.clearLocalStorage("user");
		cy.visit("/club", {
			failOnStatusCode: false,
		});
		cy.url().should(
			"eq",
			"http://pruebas-soft.s3-website.us-east-2.amazonaws.com/login"
		);
	});

	it("[SUCCESS C-3] add member", () => {
		const newMember = {
			name: faker.person.fullName(),
			lastName: faker.person.lastName(),
			dni: faker.string.numeric({ length: { min: 5, max: 8 } }),
			email: "",
			nickname: "",
		};
		newMember.email = faker.internet.email({ firstName: newMember.name, lastName: newMember.lastName });
		newMember.nickname = faker.internet.userName({ firstName: newMember.name, lastName: newMember.lastName });

		cy.getFirstClub(token).then((club) => {
			cy.intercept("**/clubs/*/subscriptions").as("club-requests");

			cy.visit("/", {
				failOnStatusCode: false,
			});

			cy.get(`#${club._id}`).should("exist").and("be.visible").click();
			cy.url().should(
				"eq",
				`http://pruebas-soft.s3-website.us-east-2.amazonaws.com/club`
			);

			//Esperar a que se cargue la información del club
			cy.wait("@club-requests").then((interception) => {
				//Obtener cantidad de miembros actuales
				cy.getMembersCount().then((numeroDeMiembros) => {
					cy.wrap(numeroDeMiembros).as('numeroDeMiembrosPrevio');
				});
			});

			//Añadir miembro
			cy.get('div[for="add-member"]')
				.should('exist').find("button").click();

			cy.get('input[name=member-name]').type(newMember.name);
			cy.get('input[name=member-lastname]').type(newMember.lastName);
			cy.get('input[name=member-email]').type(newMember.email);
			cy.get('input[name=member-dni]').type(newMember.dni);
			cy.get('input[name=member-nickname]').type(newMember.nickname);

			cy.get("button").contains('Add Member').should('exist').and('be.visible').click();
			cy.contains('div.q-notification__message', 'Member added successfully')
				.should('exist')
				.and('be.visible');

			cy.url().should(
				"eq",
				`http://pruebas-soft.s3-website.us-east-2.amazonaws.com/club`
			);

			//Comparar cantidad de miembros actuales con la cantidad de miembros previos
			cy.getMembersCount().then((numeroDeMiembrosActual) => {
				cy.get('@numeroDeMiembrosPrevio').then((numeroDeMiembrosPrevio) => {
					expect(numeroDeMiembrosActual).to.equal(numeroDeMiembrosPrevio + 1);

					//Verificar que la tabla de miembros haya aumentado en 1
					cy.get('.q-table').find('tbody tr').should('have.length', numeroDeMiembrosPrevio + 1);

					//Comparar que el nuevo miembro se encuentre en la lista de miembros en la base de datos
					cy.getMembersOfClub(token, club._id).then((miembros) => {
						expect(miembros).to.have.length(numeroDeMiembrosActual);
						expect(miembros).to.satisfy((members) =>
							members.some(member =>
								member.name === newMember.name &&
								member.email === newMember.email &&
								member.dni === newMember.dni
							)
						);
					});
				});
			});
		});
	});

	it("[ERROR C-4] not add member without email ", () => {
		const newMember = {
			name: faker.person.fullName(),
			lastName: faker.person.lastName(),
			dni: faker.string.numeric({ length: { min: 5, max: 8 } }),
			email: "",
			nickname: "",
		};
		newMember.nickname = faker.internet.userName({ firstName: newMember.name, lastName: newMember.lastName });

		cy.getFirstClub(token).then((club) => {
			cy.window().then((win) => {
				win.localStorage.setItem("club", JSON.stringify({ active: club }));
			});
			cy.visit("/club", {
				failOnStatusCode: false,
			});

			//Añadir miembro
			cy.get('div[for="add-member"]')
				.should('exist').find("button").click();

			cy.get('input[name=member-name]').type(newMember.name);
			cy.get('input[name=member-lastname]').type(newMember.lastName);
			//no se ingresa email
			cy.get('input[name=member-dni]').type(newMember.dni);
			cy.get('input[name=member-nickname]').type(newMember.nickname);

			cy.get("button").contains('Add Member')
				.should('exist').and('be.visible').click();

			cy.contains('p.text-negative', 'email is required and must be a valid email')
				.should('exist')
				.and('be.visible')
		});
	});

	it("[ERROR C-5] show notification with text unavailable when clicking on delete member button", () => {
		cy.getFirstClub(token).then((club) => {
			cy.window().then((win) => {
				win.localStorage.setItem("club", JSON.stringify({ active: club }));
			});
			cy.visit("/club", {
				failOnStatusCode: false,
			});

			//Get the first row of the members table and click on the delete button
			cy.get('tbody tr').first().find('button').contains('i', 'delete_forever').should('exist').click();

			//Verify that the notification with the text "Unavailable" is shown
			cy.contains('div.q-notification__message', 'Unavailable')
				.should('exist')
				.and('be.visible');
		});
	});
});
