/// <reference types="cypress" />
describe('Cadastro de Funcionários', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/cadastro');
    });
    it('carrega a página de cadastro', () => {
        cy.contains('Cadastrar Funcionário');
    });
    it('preenche e envia o formulário de cadastro com dados válidos', () => {
        cy.window().then(win => {
            win.localStorage.setItem('usuarioCargo', 'RH');
        });
        cy.get('#nome').type('Teste do Cypress', { delay: 100 });
        cy.get('#cpf').type('123.456.789-09', { delay: 100 });
        cy.get('#cargo').type('Vendedor', { delay: 100 });
        cy.get('#loja').select('Olimáquinas Patrocínio');
        cy.wait(500);
        cy.get('#observacoes').type('Funcionário novo da loja.', { delay: 100 });
        cy.get('#foto').attachFile('imagens/foto_teste.JPG');
        cy.get('#cpf_upload').attachFile('imagens/cpf_scan.JPG');
        cy.wait(500);
        cy.get('form#form-funcionario').submit();
        cy.contains('Sucesso').should('be.visible');
        cy.wait(3000);
    });
    it('não permite enviar o formulário sem o nome', () => {
        cy.window().then(win => {
            win.localStorage.setItem('usuarioCargo', 'RH');
        });
        cy.get('#nome').clear();
        cy.get('#cpf').type('123.456.789-09', { delay: 200 });
        cy.get('#cargo').type('Vendedor', { delay: 200 });
        cy.get('#loja').select('Olimáquinas Patrocínio');
        cy.wait(300);
        cy.get('form#form-funcionario').submit();
        cy.get('#nome:invalid').should('exist');
        cy.wait(3000);
    });
    it('mostra erro para CPF inválido (menos de 11 dígitos)', () => {
        cy.window().then(win => {
            win.localStorage.setItem('usuarioCargo', 'RH');
        });
        cy.get('#nome').type('Teste do Cypress', { delay: 100 });
        cy.get('#cpf').type('123.456.789', { delay: 100 });
        cy.get('#cargo').type('Vendedor', { delay: 100 });
        cy.get('#loja').select('Olimáquinas Patrocínio');
        cy.wait(300);
        cy.get('form#form-funcionario').submit();
        cy.contains('CPF inválido').should('be.visible');
        cy.wait(3000);
    });
    it('nega cadastro para usuário sem permissão', () => {
        cy.window().then(win => {
            win.localStorage.setItem('usuarioCargo', 'Vendedor');
        });
        cy.get('#nome').type('Teste do Cypress', { delay: 100 });
        cy.get('#cpf').type('987.654.321-00', { delay: 100 });
        cy.get('#cargo').type('Vendedor', { delay: 100 });
        cy.get('#loja').select('Olimáquinas Patrocínio');

        cy.wait(300);
        cy.get('form#form-funcionario').submit();

        cy.contains('Você não tem permissão para cadastrar funcionário!').should('be.visible');
        cy.wait(3000);
    });
});
