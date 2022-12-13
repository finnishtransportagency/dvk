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
${FAIRWAY_CARD_TAB_CONTENT_WIDE}    //div[@class = "tabContent tab1 wide active"]
${FAIRWAY_CARD_TAB}    //ion-segment-button[@value = "1"]
${FAIRWAY_CARD_TAB_IS_SELECTED}    //ion-segment-button[@value = "1" and @aria-selected = "true"]
${FAIRWAY_CARD_TAB_CONTENT_IS_ACTIVE}    //div[@class = "tabContent tab1 active"]
${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}    //div[@class = "tabContent tab2 wide active"]
${FAIRWAY_HARBOURS_TAB}    //ion-segment-button[@value = "2"]
${FAIRWAY_HARBOURS_TAB_IS_SELECTED}    //ion-segment-button[@value = "2" and @aria-selected = "true"]
${FAIRWAY_HARBOURS_TAB_CONTENT_IS_ACTIVE}    //div[@class = "tabContent tab2 active"]
${FAIRWAY_AREAS_TAB_CONTENT_WIDE}    //div[@class = "tabContent tab3 wide active"]
${FAIRWAY_AREAS_TAB}    //ion-segment-button[@value = "3"]
${FAIRWAY_AREAS_TAB_IS_SELECTED}    //ion-segment-button[@value = "3" and @aria-selected = "true"]
${FAIRWAY_AREAS_TAB_CONTENT_IS_ACTIVE}    //div[@class = "tabContent tab3 active"]

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
	Check That Tabs Can Be Selected And Tab Contents Are Activated

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

Check Fairway Card In Swedish
	Change Fairway Card Language To    ${IN_SWEDISH_BUTTON}
	Sleep    2s
	Element Should Contain    ${FAIRWAY_HEADING}    Nordsjöleden
	Capture Page Screenshot
	Check That Tabs Can Be Selected And Tab Contents Are Activated

Check Fairway Card In English
	Change Fairway Card Language To    ${IN_ENGLISH_BUTTON}
	Sleep    2s
	Element Should Contain    ${FAIRWAY_HEADING}    Vuosaari channel
	Capture Page Screenshot
	Check That Tabs Can Be Selected And Tab Contents Are Activated

*** Keywords ***
Change Fairway Card Language To
	[Arguments]    ${language}
	Click Element    ${MENU_BUTTON}
	Wait Until Element Is Visible    ${language}
	Click Element    ${language}
	Click Element    ${CLOSE_MENU_BUTTON}

Check That Toggle Wide Button Works Correctly For Fairway Card Tab
	Element Should Not Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
	Click Element    ${TOGGLE_WIDE_BUTTON}
	Element Should Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
	Capture Page Screenshot
	Click Element    ${TOGGLE_WIDE_BUTTON}
	Element Should Not Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}

Check That Toggle Wide Button Works Correctly For Fairway Harbours Tab
	Element Should Not Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
	Click Element    ${TOGGLE_WIDE_BUTTON}
	Element Should Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
	Capture Page Screenshot
	Click Element    ${TOGGLE_WIDE_BUTTON}
	Element Should Not Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}

Check That Toggle Wide Button Works Correctly For Fairway Areas Tab
	Element Should Not Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
	Click Element    ${TOGGLE_WIDE_BUTTON}
	Element Should Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
	Capture Page Screenshot
	Click Element    ${TOGGLE_WIDE_BUTTON}
	Element Should Not Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}

Check That Tabs Can Be Selected And Tab Contents Are Activated
	Click Element    ${FAIRWAY_HARBOURS_TAB}
	Element Should Be Visible    ${FAIRWAY_HARBOURS_TAB_IS_SELECTED}
	Element Should Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_IS_ACTIVE}
	Check That Toggle Wide Button Works Correctly For Fairway Harbours Tab
	Click Element    ${FAIRWAY_AREAS_TAB}
	Element Should Be Visible    ${FAIRWAY_AREAS_TAB_IS_SELECTED}
	Element Should Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_IS_ACTIVE}
	Check That Toggle Wide Button Works Correctly For Fairway Areas Tab
	Click Element    ${FAIRWAY_CARD_TAB}
	Element Should Be Visible    ${FAIRWAY_CARD_TAB_IS_SELECTED}
	Element Should Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_IS_ACTIVE}
	Check That Toggle Wide Button Works Correctly For Fairway Card Tab
