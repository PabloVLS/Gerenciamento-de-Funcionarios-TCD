describe('Teste completo da página de Login', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.wait(1000); 
  });

  it('Deve exibir erro se tentar logar com campos vazios', () => {
    cy.get('button[type="submit"]').click();
    cy.wait(1000);

    cy.on('window:alert', (str) => {
      expect(str).to.include('Usuário ou senha inválidos');
    });
  });

  it('Deve exibir erro se o usuário estiver vazio', () => {
    cy.get('input[name="senha"]').type('123456');
    cy.wait(500);

    cy.get('button[type="submit"]').click();
    cy.wait(1000);

    cy.on('window:alert', (str) => {
      expect(str).to.include('Usuário ou senha inválidos');
    });
  });

  it('Deve exibir erro se a senha estiver vazia', () => {
    cy.get('input[name="usuario"]').type('admin');
    cy.wait(500);

    cy.get('button[type="submit"]').click();
    cy.wait(1000);

    cy.on('window:alert', (str) => {
      expect(str).to.include('Usuário ou senha inválidos');
    });
  });

  it('Deve exibir erro se usuário e senha estiverem incorretos', () => {
    cy.get('input[name="usuario"]').type('usuarioteste');
    cy.wait(500);

    cy.get('input[name="senha"]').type('senhaerrada');
    cy.wait(500);

    cy.get('button[type="submit"]').click();
    cy.wait(1000);

    cy.on('window:alert', (str) => {
      expect(str).to.include('Usuário ou senha inválidos');
    });
  });

  it('Deve logar com sucesso com credenciais corretas', () => {
    cy.get('input[name="usuario"]').type('Pablo');
    cy.wait(500);

    cy.get('input[name="senha"]').type('123');
    cy.wait(500);

    cy.get('button[type="submit"]').click();
    cy.wait(1000);

    cy.url().should('not.include', '/login');
  });
});
