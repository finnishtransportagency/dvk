*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${BROWSER}    headlesschrome

*** Test Cases ***
Open DVK
  Open Browser    http://localhost:3000    ${BROWSER}
  Capture Page Screenshot
