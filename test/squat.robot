*** Settings ***
Library			SeleniumLibrary

*** Variables ***
${BROWSER}		%{BROWSER}

*** Test Cases ***
Open Squat
	Open Browser			http://localhost:3000		${BROWSER}
	Capture Page Screenshot
