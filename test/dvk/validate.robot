*** Settings ***
Library    SeleniumLibrary
Library    String
Library    DateTime

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
${IN_FINNISH_BUTTON_DISABLED}    //ion-button[@data-testid = "langFi" and @aria-disabled = "true"]
${IN_SWEDISH_BUTTON}    //ion-button[@data-testid = "langSv"]
${IN_SWEDISH_BUTTON_DISABLED}    //ion-button[@data-testid = "langSv" and @aria-disabled = "true"]
${IN_ENGLISH_BUTTON}    //ion-button[@data-testid = "langEn"]
${IN_ENGLISH_BUTTON_DISABLED}    //ion-button[@data-testid = "langEn" and @aria-disabled = "true"]
${FAIRWAYS_LINK}    //ion-item[@data-testid = "fairwaysLink"]
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
${COPYRIGHT_ELEMENT}    //div[@class = "copyrightElem"]
${SCALE_ELEMENT}    //div[@class = "ol-scale-line-inner"]
${REGEX_SCALE}    \\d+\\s(m|km)

*** Test Cases ***
Open DVK
	Open Browser    http://localhost:${PORT}    ${BROWSER}
	Sleep    5s
	Capture Page Screenshot
	Press Keys    None    ESC
	Sleep    5s

Check Copyright And Scale
	${COPYRIGHT_STRING}=    Get Text    ${COPYRIGHT_ELEMENT}
	${COPYRIGHT_TEXT}=    Fetch From Left    ${COPYRIGHT_STRING}    ${SPACE}
	${COPYRIGHT_YEAR}=    Fetch From Right    ${COPYRIGHT_STRING}    ©
	${COPYRIGHT_YEAR_INT}=    Convert To Integer    ${COPYRIGHT_YEAR}
	${date}=    Get Current Date    result_format=datetime
	Should Be Equal    ${COPYRIGHT_TEXT}    Maanmittauslaitos
	Should Be Equal    ${COPYRIGHT_YEAR_INT}    ${date.year}
	${SCALE_STRING}=    Get Text    ${SCALE_ELEMENT}
	Should Match Regexp    ${SCALE_STRING}    ${REGEX_SCALE}

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
	Wait Until Element Is Visible    ${LAYER_CONTROL_HEADING}    30s
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
	Change Fairway Card Language To    ${IN_SWEDISH_BUTTON}    ${IN_SWEDISH_BUTTON_DISABLED}    Farledskort
	Wait Until Element Contains    ${FAIRWAY_HEADING}    Nordsjöleden    30s
	Capture Page Screenshot
	Check That Tabs Can Be Selected And Tab Contents Are Activated

Check Fairway Card In English
	Change Fairway Card Language To    ${IN_ENGLISH_BUTTON}    ${IN_ENGLISH_BUTTON_DISABLED}    Fairway Cards
	Wait Until Element Contains    ${FAIRWAY_HEADING}    Vuosaari channel    30s
	Capture Page Screenshot
	Check That Tabs Can Be Selected And Tab Contents Are Activated

*** Keywords ***
Change Fairway Card Language To
	[Arguments]    ${language}    ${language_button_disabled}    ${fairways_text}
	Click Element    ${MENU_BUTTON}
	Wait Until Element Is Visible    ${language}
	Click Element    ${language}
	Wait Until Element Is Visible    ${language_button_disabled}    30s
	Wait Until Element Contains    ${FAIRWAYS_LINK}    ${fairways_text}    30s
	Capture Page Screenshot
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
