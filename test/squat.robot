*** Settings ***
Library			SeleniumLibrary
Test Setup    Open Browser    http://localhost:3000    ${BROWSER}
Test Teardown    Close All Browsers

*** Variables ***
${BROWSER}		headlesschrome
${SQUAT_LASKENTA_HEADER}    //h1/strong[text() = "Squat-laskenta"]
${ALUKSEN_TIEDOT_HEADER}    //h2/strong[text() = "Aluksen tiedot"]
${YMPARISTO_HEADER}    //h2/strong[text() = "Ympäristö"]
${LASKENTA_HEADER}    //h2/strong[text() = "Laskenta"]
${ALUKSEN_SQUAT_HEADER}    //h4[text() = "Aluksen squat nopeuden funktiona"]

*** Test Cases ***
Open Squat Calculator And Check Labels
	[Documentation]    This test case opens Squat calculation page and verifies it is open
	Element Should Contain    ${SQUAT_LASKENTA_HEADER}    Squat-laskenta
	Element Should Contain    ${ALUKSEN_TIEDOT_HEADER}    Aluksen tiedot
	Element Should Contain    ${YMPARISTO_HEADER}    Ympäristö
	Scroll Element Into View    ${LASKENTA_HEADER}
	Element Should Contain    ${LASKENTA_HEADER}    Laskenta
	Scroll Element Into View    ${ALUKSEN_SQUAT_HEADER}
	Element Should Contain    ${ALUKSEN_SQUAT_HEADER}    Aluksen squat nopeuden funktiona
	Capture Page Screenshot
