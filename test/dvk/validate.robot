*** Settings ***
Library    SeleniumLibrary
Library    String
Library    DateTime
Library    Collections
Test Setup    Open DVK
Test Teardown    Close All Browsers

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
${EXPAND_WIDE_BUTTON}    //div[@class = "ion-page can-go-back"]/descendant::button[@class = "icon "]
${REVERT_WIDE_BUTTON}    //div[@class = "ion-page can-go-back"]/descendant::button[@class = "icon flip invert"]
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
${FAIRWAY_CARDS}    //ion-row[@class = "fairwayCards md"]/ion-col/ion-label/a
${SIDEBAR_MENU_CONTROL_BUTTON}    //button[@class = "openSidebarMenuControl"]
${FAIRWAY_CARDS_HEADING}    //h2/strong[text()= "Väyläkortit"]
${BACK_TO_HOME_BUTTON}    //div[@class = "ion-page can-go-back"]/descendant::ion-button[@data-testid = "backToHome"]
${CLOSE_BUTTON}    //div[@class = "ion-page can-go-back"]/descendant::ion-button[contains(@class, "closeButton")]
${SOVELLUSTA_ALUSTETAAN_POP_UP}    //div[contains(@class, "alert")]/h2[contains(@id, "alert") and text() = "Sovellusta alustetaan"]

*** Test Cases ***
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
	Select Fairway
	Input Text    ${INPUT_FAIRWAY}   ${SELECTED_FAIRWAY_CARD}
	${FAIRWAY}=    Get Text    ${INPUT_FAIRWAY_DROPDOWN}
	Click Element    ${INPUT_FAIRWAY_DROPDOWN}
	Wait Until Element Is Visible    ${FAIRWAY_HEADING}    30s
	Element Should Contain    ${FAIRWAY_HEADING}    ${SELECTED_FAIRWAY_CARD}
	Capture Page Screenshot
	Check That Tabs Can Be Selected And Tab Contents Are Activated
	Scroll Element Into View    ${CLOSE_BUTTON}
	Click Element    ${CLOSE_BUTTON}

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
	Select Fairway
	Capture Page Screenshot
	Input Text    ${INPUT_FAIRWAY}   ${SELECTED_FAIRWAY_CARD}
	${FAIRWAY}=    Get Text    ${INPUT_FAIRWAY_DROPDOWN}
	Click Element    ${INPUT_FAIRWAY_DROPDOWN}
	Wait Until Element Is Visible    ${FAIRWAY_HEADING}    30s
	Element Should Contain    ${FAIRWAY_HEADING}    ${SELECTED_FAIRWAY_CARD}
	Capture Page Screenshot
	Check That Tabs Can Be Selected And Tab Contents Are Activated
	Scroll Element Into View    ${CLOSE_BUTTON}
	Click Element    ${CLOSE_BUTTON}

Check Fairway Card In English
	Change Fairway Card Language To    ${IN_ENGLISH_BUTTON}    ${IN_ENGLISH_BUTTON_DISABLED}    Fairway Cards
	Select Fairway
	Capture Page Screenshot
	Input Text    ${INPUT_FAIRWAY}   ${SELECTED_FAIRWAY_CARD}
	${FAIRWAY}=    Get Text    ${INPUT_FAIRWAY_DROPDOWN}
	Click Element    ${INPUT_FAIRWAY_DROPDOWN}
	Wait Until Element Is Visible    ${FAIRWAY_HEADING}    30s
	Element Should Contain    ${FAIRWAY_HEADING}    ${SELECTED_FAIRWAY_CARD}
	Capture Page Screenshot
	Check That Tabs Can Be Selected And Tab Contents Are Activated
	Scroll Element Into View    ${CLOSE_BUTTON}
	Click Element    ${CLOSE_BUTTON}

*** Keywords ***
Open DVK
	Open Browser    http://localhost:${PORT}    ${BROWSER}
	Sleep    5s
	Capture Page Screenshot
	Press Keys    None    ESC
	Sleep    5s
	Wait Until Element Is Not Visible    ${SOVELLUSTA_ALUSTETAAN_POP_UP}    30s

Change Fairway Card Language To
	[Arguments]    ${language}    ${language_button_disabled}    ${fairways_text}
	Click Element    ${SIDEBAR_MENU_CONTROL_BUTTON}
	Sleep    2s
	Wait Until Element Is Visible    ${language}
	Click Element    ${language}
	Wait Until Element Is Visible    ${language_button_disabled}    30s
	Wait Until Element Contains    ${FAIRWAYS_LINK}    ${fairways_text}    30s
	Capture Page Screenshot
	Click Element    ${CLOSE_MENU_BUTTON}
	Wait Until Element Is Not Visible    ${CLOSE_MENU_BUTTON}    30s

Check That Toggle Wide Button Works Correctly For Fairway Card Tab
	Element Should Not Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
	Element Should Be Visible    ${EXPAND_WIDE_BUTTON}
	Click Element    ${EXPAND_WIDE_BUTTON}
	Element Should Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
	Capture Page Screenshot
	Click Element    ${REVERT_WIDE_BUTTON}
	Element Should Not Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}

Check That Toggle Wide Button Works Correctly For Fairway Harbours Tab
	Element Should Not Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
	Element Should Be Visible    ${EXPAND_WIDE_BUTTON}
	Click Element    ${EXPAND_WIDE_BUTTON}
	Element Should Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
	Capture Page Screenshot
	Click Element    ${REVERT_WIDE_BUTTON}
	Element Should Not Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}

Check That Toggle Wide Button Works Correctly For Fairway Areas Tab
	Element Should Not Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
	Element Should Be Visible    ${EXPAND_WIDE_BUTTON}
	Click Element    ${EXPAND_WIDE_BUTTON}
	Element Should Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
	Capture Page Screenshot
	Click Element    ${REVERT_WIDE_BUTTON}
	Element Should Not Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}

Check That Tabs Can Be Selected And Tab Contents Are Activated
	Click Element    ${FAIRWAY_HARBOURS_TAB}
	Wait Until Element Is Visible    ${FAIRWAY_HARBOURS_TAB_IS_SELECTED}    30s
	Element Should Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_IS_ACTIVE}
	Check That Toggle Wide Button Works Correctly For Fairway Harbours Tab
	Click Element    ${FAIRWAY_AREAS_TAB}
	Wait Until Element Is Visible    ${FAIRWAY_AREAS_TAB_IS_SELECTED}    30s
	Element Should Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_IS_ACTIVE}
	Check That Toggle Wide Button Works Correctly For Fairway Areas Tab
	Click Element    ${FAIRWAY_CARD_TAB}
	Wait Until Element Is Visible    ${FAIRWAY_CARD_TAB_IS_SELECTED}    30s
	Element Should Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_IS_ACTIVE}
	Check That Toggle Wide Button Works Correctly For Fairway Card Tab

Select Fairway
	Click Element    ${SIDEBAR_MENU_CONTROL_BUTTON}
	Wait Until Element Is Visible    ${FAIRWAYS_LINK}    30s
	Capture Page Screenshot
	Click Element    ${FAIRWAYS_LINK}
	Sleep    5s
	Capture Page Screenshot
	@{fairway_cards_list}=    Create List
	${fairway_cards_count}=    Get Element Count    ${FAIRWAY_CARDS}
	${selected_number}=    Evaluate    random.randint(1, ${fairway_cards_count})
	${selected_number_minus_one}=    Evaluate    ${selected_number} - 1
	${all_elements}=    Get WebElements    ${FAIRWAY_CARDS}
	FOR    ${item}    IN    @{all_elements}
		Scroll Element Into View    ${item}
		Append To List    ${fairway_cards_list}    ${item.text}
	END
	${fairway_cards_list_count}=    Get Length    ${fairway_cards_list}
	Should Be Equal    ${fairway_cards_count}    ${fairway_cards_list_count}
	${SELECTED_FAIRWAY_CARD}=    Get From List    ${fairway_cards_list}    ${selected_number_minus_one}
	Set Test Variable    ${SELECTED_FAIRWAY_CARD}
	Scroll Element Into View    ${BACK_TO_HOME_BUTTON}
	Capture Page Screenshot
	Click Element    ${BACK_TO_HOME_BUTTON}
	Sleep    5s
