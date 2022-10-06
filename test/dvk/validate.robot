*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${BROWSER}    headlesschrome
${PORT}    3000

*** Test Cases ***
Open DVK
  Open Browser    http://localhost:${PORT}    ${BROWSER}
  Sleep    5s
  Capture Page Screenshot
