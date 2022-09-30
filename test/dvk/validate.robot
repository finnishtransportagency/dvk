*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${BROWSER}    headlesschrome

*** Test Cases ***
Open DVK
  Open Browser    http://localhost:3000    ${BROWSER}
  Sleep    2s
  Capture Page Screenshot
