*** Settings ***
Library			SeleniumLibrary

*** Variables ***
${BROWSER}		headlesschrome

*** Test Cases ***
Open Squat
	Open Browser    http://localhost:3000    ${BROWSER}
	Capture Page Screenshot
