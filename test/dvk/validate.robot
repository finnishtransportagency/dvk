*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${BROWSER}    headlesschrome
${PORT}    3000
${INPUT_FAIRWAY}    //div[contains(@class, "searchbarControlContainer")]/input
${INPUT_FAIRWAY_DROPDOWN}    //*[contains(@class, "searchbarDropdown")]
${FAIRWAY_HEADING}    //ion-col[@data-testid = "cardPane"]/descendant::h2/strong
${LAYER_CONTROL_BUTTON}    //button[@class = "layerControl"]
${LAYER_CONTROL_HEADING}    //ion-modal[@id = "layerModalContainer"]/descendant::h6[1]
${MAIN_CONTENT_ELEMENT}    //ion-content[@id = "MainContent"]
${CENTER_TO_OWN_LOCATION_BUTTON}    //button[@class = "centerToOwnLocationControl"]
${ZOOM_IN_BUTTON}    //button[@class = "ol-zoom-in"]
${ZOOM_OUT_BUTTON}    //button[@class = "ol-zoom-out"]
${MENU_BUTTON}    //ion-col[@data-testid = "cardPane"]/descendant::button[@class = "icon"]
${IN_FINNISH_BUTTON}    //ion-button[@data-testid = "langFi"]
${IN_SWEDISH_BUTTON}    //ion-button[@data-testid = "langSv"]
${IN_ENGLISH_BUTTON}    //ion-button[@data-testid = "langEn"]
${CLOSE_MENU_BUTTON}    //ion-button[@data-testid = "closeMenu"]
${TOGGLE_WIDE_BUTTON}    //button[@data-testid = "toggleWide"]

*** Test Cases ***
Open DVK
	Open Browser    http://localhost:${PORT}    ${BROWSER}
	Sleep    5s
	Capture Page Screenshot

Check Fairway Card
	Input Text    ${INPUT_FAIRWAY}   vuo
	${FAIRWAY}=    Get Text    ${INPUT_FAIRWAY_DROPDOWN}
	Click Element    ${INPUT_FAIRWAY_DROPDOWN}
	Wait Until Element Is Visible    ${FAIRWAY_HEADING}    30s
	Element Should Contain    ${FAIRWAY_HEADING}    Vuosaaren väylä
	Capture Page Screenshot

Check Layer Control
	Click Element    ${LAYER_CONTROL_BUTTON}
	${LAYER_CONTROL}=    Get Text    ${LAYER_CONTROL_HEADING}
	Capture Page Screenshot
	Click Element At Coordinates    ${LAYER_CONTROL_HEADING}    -500    0
	Wait Until Element Is Visible    ${LAYER_CONTROL_BUTTON}    30s
	Capture Page Screenshot

Check Center And Zoom Buttons
	Element Should Be Visible    ${CENTER_TO_OWN_LOCATION_BUTTON}
	Element Should Be Visible    ${ZOOM_IN_BUTTON}
	Element Should Be Visible    ${ZOOM_OUT_BUTTON}
