import { createYield } from "typescript"

describe('My First Test', function(){

    // Cypress.Commands.add('loginByCSRF', (csrfToken) => {

    //     const username = 'admin'
    //     const password = 'admin'

    //     cy.request({
    //       method: 'POST',
    //       url: 'https://scale.alpha.aisohio.net/api/login/',
    //       failOnStatusCode: false, // dont fail so we can make assertions
    //       form: true, // we are submitting a regular form body
    //       body: {
    //         username,
    //         password,
    //         _csrf: csrfToken, // insert this as part of form body
    //       },
    //     })
    // })


    // it('Visits site and logs in', function(){
    //     cy.visit('https://scale.alpha.aisohio.net/api/login/')
    // })

    // it('403 status without a valid CSRF token', function () {
    // // first show that by not providing a valid CSRF token
    // // that we will get a 403 status code
    // cy.loginByCSRF('invalid-token')
    // .its('status')
    // .should('eq', 403)
    // })

    // it('strategy #1: parse token from HTML', function () {
    //     // if we cannot change our server code to make it easier
    //     // to parse out the CSRF token, we can simply use cy.request
    //     // to fetch the login page, and then parse the HTML contents
    //     // to find the CSRF token embedded in the page
    //     cy.request('https://scale.alpha.aisohio.net/api/login/')
    //     .its('body')
    //     .then((body) => {
    //       // we can use Cypress.$ to parse the string body
    //       // thus enabling us to query into it easily
    //       const $html = Cypress.$(body)
    //       const csrf = $html.find('input[name=_csrf]').val()
    
    //       cy.loginByCSRF(csrf)
    //       .then((resp) => {
    //         expect(resp.status).to.eq(200)
    //       })
    //     })
    
    //     // successful "cy.request" sets all returned cookies, thus we should
    //     // be able to visit the protected page - we are logged in!
    //   })
    

    // it('Visits site and logs in', function(){
    //     cy.visit('https://scale.alpha.aisohio.net/api/login/')
        
        
    // })
    it('loginto site', () => {
        cy.visit('https://scale.alpha.aisohio.net/api/login/')
        cy.get('#id_username').type("admin")
        cy.get('#id_password').type("admin")
        cy.get('button').click()
        cy.get('.footer > ul.ng-star-inserted > .ng-star-inserted').should('contain', 'Admin')
        

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

        cy.visit('https://scale.alpha.aisohio.net/system/strikes/create')
        // cy.visit('https://scale.alpha.aisohio.net/system/nodes')
        cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(1) > label > .ui-inputtext').clear()
        cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(1) > label > .ui-inputtext').type("Automated-Strike")
        cy.get(':nth-child(1) > :nth-child(2) > label > .ui-inputtext').type("Automated strike description")
        cy.get('.ui-dropdown-label-container > .ng-tns-c14-11').click()
        cy.get(':nth-child(21) > .ui-dropdown-item').click()

    }
    )

    // it('loginto site', () => {
    //     cy.visit('https://scale.alpha.aisohio.net/system/workspaces')
    //     // cy.get('#id_username').type("admin")
    //     // cy.get('#id_password').type("admin")
    //     // cy.get('button').click()
    //     // cy.get('.footer > ul.ng-star-inserted > .ng-star-inserted').should('contain', 'Admin')
        
    //     // cy.get('.ui-button-icon-left', {timeout: 10000}).click() 
    //     // cy.visit('https://scale.alpha.aisohio.net/processing/jobs')
    //     // cy.visit('https://scale.alpha.aisohio.net/system/nodes')


    // }
    // )
})