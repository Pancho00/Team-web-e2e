describe("Home", () => {
  it("[Error H-1] Redirect to /login page when token is not provided", () => {
    cy.visit("/");
    cy.url().should(
      "eq",
      "http://pruebas-soft.s3-website.us-east-2.amazonaws.com/login"
    );
  });
});
describe("When is logged in", () => {
  beforeEach(() => {
    cy.login().then(() => {
      cy.goHome();
    });
  });
  it("[SUCCESS H-2] Welcomes the user. Welcome Name,", () => {
    const user = JSON.parse(localStorage.getItem("user")).user;
    cy.get("h2").contains("Welcome " + user.name);
  });

  it("[SUCCESS H-3] Verify that a list of a list of clubs", () => {
    const token = JSON.parse(localStorage.getItem("user")).token;
    cy.getClubs(token).then((clubes) => {
      cy.get(`div[id=${clubes[0]._id}]`).find("div").contains(clubes[0].name);
    });
  });
  it("[SUCCESS H-4] The club must be added correctly  the correct club", () => {
    const token = JSON.parse(localStorage.getItem("user")).token;
    cy.getClubs(token).then((clubes) => {
      //se obtiene el tamaño del arreglo de clubes para verificar el ultimo club agregado
      let clubesLength = clubes.length - 1;

      //condicional realizada debido a que no existe forma de eliminar clubes
      if (clubes[clubesLength].name != "Club de prueba") {
        cy.get(`div[for="add-club"]`).click();
        cy.get('input[aria-label="Club name"]').type("Club de prueba");
        cy.get('input[aria-label="Club description"]').type(
          "Descripcion de prueba"
        );
        cy.get("span").contains("Add Club").click();

        //en caso de agregar nuevo club se actualiza el tamaño del arreglo de clubes
        clubesLength += 1;
      } else {
        cy.get(`div[id=${clubes[clubesLength]._id}]`).click();
      }

      //se verifica que se renderiza un nuevo club
      cy.get(`div[id=${clubes[clubesLength]._id}]`)
        .find("div")
        .contains(clubes[clubesLength].name);
      cy.get('div[id="toolbar"]').contains(
        " Team Web - " + clubes[clubesLength].name
      );
    });
  });

  it("[ERROR H_5] Failure to add club due to missing name", () => {
    const token = JSON.parse(localStorage.getItem("user")).token;
    cy.getClubs(token).as("initialClubs");

    // Regresa a la página principal y agrega un nuevo club sin nombre

    cy.get(`div[for="add-club"]`).click();
    cy.get('input[aria-label="Club description"]').type(
      "Descripcion de prueba"
    );
    cy.get("span").contains("Add Club").click();

    // Verifica que aparezca el mensaje de error
    cy.get("p").contains("name is required");

    // Verifica que la longitud de los clubes no haya cambiado
    cy.get("@initialClubs").then((initialClubs) => {
      cy.getClubs(token).should("deep.equal", initialClubs);
    });
  });
});
