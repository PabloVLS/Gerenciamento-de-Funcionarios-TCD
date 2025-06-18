it('fluxo completo: aprovar gerente, preencher itens, salvar e validar', () => {
    cy.visit('http://localhost:3000/solicitacoes', {
        onBeforeLoad(win) {
            win.localStorage.setItem('usuarioCargo', 'Gerente');
            win.localStorage.setItem('usuarioNome', 'Cypress');
        }
    });

    cy.intercept('PUT', /\/api\/solicitacoes\/\d+\/aprovar-gerente/).as('aprovarGerente');
    cy.intercept('GET', /\/api\/solicitacoes\/\d+\/itens/).as('carregarItens');
    cy.intercept('PUT', /\/api\/solicitacoes\/itens\/\d+/).as('salvarItem');
    cy.get('#listaSolicitacoes')
        .contains('button', 'Aprovar (Gerente)')  
        .first()
        .click();

    cy.wait('@aprovarGerente').its('response.statusCode').should('eq', 200);

    cy.get('.swal2-popup').should('contain', 'Aprovado!');
    cy.wait(2000);
    cy.get('.swal2-confirm').click();


    cy.get('#listaSolicitacoes')
        .contains('button', 'Preencher Itens')
        .first()
        .click();

    cy.wait('@carregarItens').its('response.statusCode').should('eq', 200);

    cy.get('#modalAprovacaoGerente', { timeout: 10000 }).should('exist');
    cy.get('#modalAprovacaoGerente', { timeout: 10000 }).should('be.visible');

    cy.get('#modalAprovacaoGerente', { timeout: 10000 }).should('be.visible').within(() => {
        cy.get('input[name^="modelo_celular_"]', { timeout: 10000 })
            .should('exist')
            .should('be.visible')
            .invoke('val', 'Xiaomi Redmi 13C')
            .trigger('input')
            .trigger('change');

        cy.wait(500);

        cy.get('input[name^="imei_"]').eq(0).type('123456789012345', { delay: 100 });
        cy.wait(500);

        cy.get('input[name^="numero_"]').eq(0).type('1198999999', { delay: 100 });
        cy.wait(500);

        cy.get('input[name^="valor_celular_"]').eq(0).type('6000', { delay: 100 });
        cy.wait(500);

        cy.get('input[name^="modelo_notebook_"]').eq(0).type('Dell XPS 13', { delay: 100 });
        cy.wait(500);

        cy.get('input[name^="numero_patrimonio_"]').eq(0).type('12345', { delay: 100 });
        cy.wait(500);

        cy.get('input[name^="sistema_operacional_"]').eq(0).type('Windows 10', { delay: 100 });
        cy.wait(500);

        cy.get('input[name^="valor_notebook_"]').eq(0).type('7000', { delay: 100 });
        cy.wait(500);

        cy.get('input[name^="numero_chip_"]').eq(0).type('11988887777', { delay: 100 });
        cy.wait(500);

        cy.get('input[name^="operadora_chip_"]').eq(0).type('Vivo', { delay: 100 });
        cy.wait(500);

        cy.get('input[name^="plano_"]').eq(0).type('Controle', { delay: 100 });
        cy.wait(500);
    });

    cy.get('#btnSalvarEquipamentos').click();


    cy.wait('@salvarItem');
    cy.wait('@salvarItem');
    cy.wait('@salvarItem');

    cy.get('#modalAprovacaoGerente').should('not.be.visible');

    cy.get('.swal2-popup').should('contain', 'Preenchido!');
    cy.wait(5000);
    cy.get('.swal2-confirm').click();

    cy.get('#listaSolicitacoes').should('exist');
});
