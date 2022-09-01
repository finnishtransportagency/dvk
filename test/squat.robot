*** Settings ***
Library			SeleniumLibrary

*** Variables ***
${BROWSER}		headlesschrome

*** Test Cases ***
Open Squat
	[Documentation]    This test case opens Squat calculation page and verifies it is open
	Open Browser    http://localhost:3000    ${BROWSER}
	Capture Page Screenshot
