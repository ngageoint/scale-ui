
import { createYield } from "typescript"

describe('My First Test', function(){
    
    it('create workspace and strike', () => {
        cy.visit('https://scale.alpha.aisohio.net/api/login/')
        cy.get('#id_username').type("admin")
        cy.get('#id_password').type("admin")
        cy.get('button').click()
        cy.get('.footer > ul.ng-star-inserted > .ng-star-inserted').should('contain', 'Admin')
        
        //workspace testing
        cy.visit('https://scale.alpha.aisohio.net/system/workspaces')
        cy.get('.margin-left-md > .ui-button > .ui-button-icon-left').click()
        cy.get(':nth-child(1) > :nth-child(1) > label > .ui-inputtext').clear()
        cy.get(':nth-child(1) > :nth-child(1) > label > .ui-inputtext').type("Automated-Workspace")
        cy.get(':nth-child(2) > label > .ui-inputtext').type("Workspace Description")
        cy.get('.ui-dropdown-label').click()
        cy.get(':nth-child(1) > .ui-dropdown-item').click()
        cy.get('.ng-star-inserted > .ui-inputtext').type("/dfs/testing/automated")
        cy.get('[label="Validate"] > .ui-button-text').should('not.be.disabled')
        // cy.get('[label="Save"] > .ui-button-text').should('be.disabled')

        cy.get('[label="Validate"] > .ui-button-text').click()
        cy.get('[label="Save"] > .ui-button-text').should('not.be.disabled')
        // cy.get('.logo').click()
        // cy.get('.ui-button-icon-left', {timeout: 10000}).click() 


        //strike testing
        cy.visit('https://scale.alpha.aisohio.net/system/strikes/create')
        // cy.visit('https://scale.alpha.aisohio.net/system/nodes')
        cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(1) > label > .ui-inputtext').clear()
        cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(1) > label > .ui-inputtext').type("Automated-Strike")
        cy.get(':nth-child(1) > :nth-child(2) > label > .ui-inputtext').type("Automated strike description")
        cy.get('.ui-dropdown-label-container > .ng-tns-c14-11').click()
        cy.get(':nth-child(21) > .ui-dropdown-item').click()

        // cy.get('.ui-panel-content > :nth-child(1) > :nth-child(1) > label > .ui-inputtext').type
        // TODO need to set dropdown selections based on fresh DB

    }
    )
})