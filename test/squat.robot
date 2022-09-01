*** Settings ***
Library			SeleniumLibrary

*** Variables ***
${BROWSER}		headlesschrome
${SQUAT_LASKENTA_HEADER}    //h1/strong[text() = "Squat-laskenta"]

*** Test Cases ***
Open Squat
	[Documentation]    This test case opens Squat calculation page and verifies it is open
	Open Browser    http://localhost:3000    ${BROWSER}
	Capture Page Screenshot
