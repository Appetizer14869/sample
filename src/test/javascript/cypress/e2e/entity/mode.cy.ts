import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateCancelButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityDetailsBackButtonSelector,
  entityDetailsButtonSelector,
  entityEditButtonSelector,
  entityTableSelector,
} from '../../support/entity';

describe('Mode e2e test', () => {
  const modePageUrl = '/mode';
  const modePageUrlPattern = new RegExp('/mode(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const modeSample = { name: 'fill atop faraway', handle: 'council' };

  let mode;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/modes+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/modes').as('postEntityRequest');
    cy.intercept('DELETE', '/api/modes/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (mode) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/modes/${mode.id}`,
      }).then(() => {
        mode = undefined;
      });
    }
  });

  it('Modes menu should load Modes page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('mode');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Mode').should('exist');
    cy.url().should('match', modePageUrlPattern);
  });

  describe('Mode page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(modePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Mode page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/mode/new$'));
        cy.getEntityCreateUpdateHeading('Mode');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', modePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/modes',
          body: modeSample,
        }).then(({ body }) => {
          mode = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/modes+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [mode],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(modePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Mode page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('mode');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', modePageUrlPattern);
      });

      it('edit button click should load edit Mode page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Mode');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', modePageUrlPattern);
      });

      it('edit button click should load edit Mode page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Mode');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', modePageUrlPattern);
      });

      it('last delete button click should delete instance of Mode', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('mode').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', modePageUrlPattern);

        mode = undefined;
      });
    });
  });

  describe('new Mode page', () => {
    beforeEach(() => {
      cy.visit(`${modePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Mode');
    });

    it('should create an instance of Mode', () => {
      cy.get(`[data-cy="name"]`).type('annex rally dazzling');
      cy.get(`[data-cy="name"]`).should('have.value', 'annex rally dazzling');

      cy.get(`[data-cy="handle"]`).type('jiggle limping gadzooks');
      cy.get(`[data-cy="handle"]`).should('have.value', 'jiggle limping gadzooks');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        mode = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', modePageUrlPattern);
    });
  });
});
