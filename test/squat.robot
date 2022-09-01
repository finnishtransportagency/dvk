*** Settings ***
Library			SeleniumLibrary
Test Setup    Open Browser    http://localhost:3000    ${BROWSER}
Test Teardown    Close All Browsers

*** Variables ***
${BROWSER}		headlesschrome
${SQUAT_LASKENTA_HEADER}    //h1/strong[text() = "Squat-laskenta"]
${ALUKSEN_TIEDOT_HEADER}    //h2/strong[text() = "Aluksen tiedot"]

*** Test Cases ***
Open Squat Calculator
	[Documentation]    This test case opens Squat calculation page and verifies it is open
	Element Should Contain    //h1/strong[text() = "Squat-laskenta"]    Squat-laskenta
	Capture Page Screenshot
