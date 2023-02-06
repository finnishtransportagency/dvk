*** Settings ***
Documentation    This test suite contains test cases for DVK
Library    SeleniumLibrary
Library    String
Library    DateTime
Library    Collections
Resource    resources_dvk.resource
Test Setup    Open DVK
Test Teardown    Close All Browsers

*** Variables ***
${BROWSER}    headlesschrome
${PORT}    3000

*** Test Cases ***
Check Copyright And Scale
	[Documentation]    This test case checks copyright and scale in DVK
	${COPYRIGHT_STRING}=    Get Text    ${COPYRIGHT_ELEMENT}
	${COPYRIGHT_TEXT}=    Fetch From Left    ${COPYRIGHT_STRING}    ${SPACE}
	${COPYRIGHT_YEAR}=    Fetch From Right    ${COPYRIGHT_STRING}    ©
	${COPYRIGHT_YEAR_INT}=    Convert To Integer    ${COPYRIGHT_YEAR}
	${date}=    Get Current Date    result_format=datetime
	Should Be Equal    ${COPYRIGHT_TEXT}    Maanmittauslaitos
	Should Be Equal    ${COPYRIGHT_YEAR_INT}    ${date.year}
	${SCALE_STRING}=    Get Text    ${SCALE_ELEMENT}
	Should Match Regexp    ${SCALE_STRING}    ${REGEX_SCALE}

Check Layer Control
	[Documentation]    This test case checks that layer control can be opened in DVK
	Click Element    ${LAYER_CONTROL_BUTTON}
	Wait Until Element Is Visible    ${LAYER_CONTROL_HEADING}    30s
	${LAYER_CONTROL}=    Get Text    ${LAYER_CONTROL_HEADING}
	Capture Page Screenshot
	Click Element At Coordinates    ${LAYER_CONTROL_HEADING}    -500    0
	Wait Until Element Is Visible    ${LAYER_CONTROL_BUTTON}    30s

Check Center And Zoom Buttons
	[Documentation]    This test case checks that center- and zoom-buttons are visible in DVK
	Element Should Be Visible    ${CENTER_TO_OWN_LOCATION_BUTTON}
	Element Should Be Visible    ${ZOOM_IN_BUTTON}
	Element Should Be Visible    ${ZOOM_OUT_BUTTON}

Check Fairway Card
	[Documentation]    This test case contains checks for content of randomly selected fairway card in finnish language
	Check Fairway Cards Page And Select Fairway    FINNISH
	${input_fairway_dropdown_locator}=    Set Variable    //*[@data-testid = "cardOption"]/*[text() = "${SELECTED_FAIRWAY_CARD}"]
	Input Text    ${INPUT_FAIRWAY}   ${SELECTED_FAIRWAY_CARD}
	${FAIRWAY}=    Get Text    ${input_fairway_dropdown_locator}
	Click Element    ${input_fairway_dropdown_locator}
	Wait Until Element Is Visible    ${FAIRWAY_HEADING}    30s
	Element Should Contain    ${FAIRWAY_HEADING}    ${SELECTED_FAIRWAY_CARD}
	Check Fairway Navigability Headings    ${FAIRWAY_NAVIGABILITY_HEADING_FINNISH}    ${NAVIGATION_CONDITIONS_HEADING_FINNISH}    ${ICE_CONDITIONS_HEADING_FINNISH}
	Check Fairway Data Headings    ${FAIRWAY_DATA_HEADING_FINNISH}    ${CHANNEL_ALIGNMENT_AND_MARKING_HEADING_FINNISH}    ${FAIRWAY_DESIGN_SHIP_HEADING_FINNISH}    ${FAIRWAY_DIMENSIONS_HEADING_FINNISH}    ${MEETING_AND_OVERTAKING_PROHIBITION_AREAS_HEADING_FINNISH}    ${SPEED_LIMITS_AND_RECOMMENDATIONS_HEADING_FINNISH}
	Check Traffic Services Headings    ${TRAFFIC_SERVICES_HEADING_FINNISH}    ${PILOTAGE_HEADING_FINNISH}    ${VTS_HEADING_FINNISH}
	Check Fairway Harbours Headings    ${HARBOUR_NAME_HEADING}    ${HARBOUR_RESTRICTIONS_HEADING_FINNISH}    ${QUAYS_HEADING_FINNISH}    ${CARGO_HANDLING_HEADING_FINNISH}    ${HARBOUR_BASIN_HEADING_FINNISH}    ${CONTACT_DETAILS_HEADING_FINNISH}
	Check That Tabs Can Be Selected And Tab Contents Are Activated
	Scroll Element Into View    ${CLOSE_BUTTON}
	Click Element    ${CLOSE_BUTTON}

Check Fairway Card In Swedish
	[Documentation]    This test case contains checks for content of randomly selected fairway card in swedish language
	Change Fairway Card Language To    ${IN_SWEDISH_BUTTON}    ${IN_SWEDISH_BUTTON_DISABLED}    Farledskort
	Check Fairway Cards Page And Select Fairway    SWEDISH
	${input_fairway_dropdown_locator}=    Set Variable    //*[@data-testid = "cardOption"]/*[text() = "${SELECTED_FAIRWAY_CARD}"]
	Input Text    ${INPUT_FAIRWAY}   ${SELECTED_FAIRWAY_CARD}
	${FAIRWAY}=    Get Text    ${input_fairway_dropdown_locator}
	Click Element    ${input_fairway_dropdown_locator}
	Wait Until Element Is Visible    ${FAIRWAY_HEADING}    30s
	Element Should Contain    ${FAIRWAY_HEADING}    ${SELECTED_FAIRWAY_CARD}
	Check Fairway Navigability Headings    ${FAIRWAY_NAVIGABILITY_HEADING_SWEDISH}    ${NAVIGATION_CONDITIONS_HEADING_SWEDISH}    ${ICE_CONDITIONS_HEADING_SWEDISH}
	Check Fairway Data Headings    ${FAIRWAY_DATA_HEADING_SWEDISH}    ${CHANNEL_ALIGNMENT_AND_MARKING_HEADING_SWEDISH}    ${FAIRWAY_DESIGN_SHIP_HEADING_SWEDISH}    ${FAIRWAY_DIMENSIONS_HEADING_SWEDISH}    ${MEETING_AND_OVERTAKING_PROHIBITION_AREAS_HEADING_SWEDISH}    ${SPEED_LIMITS_AND_RECOMMENDATIONS_HEADING_SWEDISH}
	Check Traffic Services Headings    ${TRAFFIC_SERVICES_HEADING_SWEDISH}    ${PILOTAGE_HEADING_SWEDISH}    ${VTS_HEADING_SWEDISH}
	Check Fairway Harbours Headings    ${HARBOUR_NAME_HEADING}    ${HARBOUR_RESTRICTIONS_HEADING_SWEDISH}    ${QUAYS_HEADING_SWEDISH}    ${CARGO_HANDLING_HEADING_SWEDISH}    ${HARBOUR_BASIN_HEADING_SWEDISH}    ${CONTACT_DETAILS_HEADING_SWEDISH}
	Check That Tabs Can Be Selected And Tab Contents Are Activated
	Scroll Element Into View    ${CLOSE_BUTTON}
	Click Element    ${CLOSE_BUTTON}

Check Fairway Card In English
	[Documentation]    This test case contains checks for content of randomly selected fairway card in swedish language
	Change Fairway Card Language To    ${IN_ENGLISH_BUTTON}    ${IN_ENGLISH_BUTTON_DISABLED}    Fairway Cards
	Check Fairway Cards Page And Select Fairway    ENGLISH
	${input_fairway_dropdown_locator}=    Set Variable    //*[@data-testid = "cardOption"]/*[text() = "${SELECTED_FAIRWAY_CARD}"]
	Input Text    ${INPUT_FAIRWAY}   ${SELECTED_FAIRWAY_CARD}
	${FAIRWAY}=    Get Text    ${input_fairway_dropdown_locator}
	Click Element    ${input_fairway_dropdown_locator}
	Wait Until Element Is Visible    ${FAIRWAY_HEADING}    30s
	Element Should Contain    ${FAIRWAY_HEADING}    ${SELECTED_FAIRWAY_CARD}
	Check Fairway Navigability Headings    ${FAIRWAY_NAVIGABILITY_HEADING_ENGLISH}    ${NAVIGATION_CONDITIONS_HEADING_ENGLISH}    ${ICE_CONDITIONS_HEADING_ENGLISH}
	Check Fairway Data Headings    ${FAIRWAY_DATA_HEADING_ENGLISH}    ${CHANNEL_ALIGNMENT_AND_MARKING_HEADING_ENGLISH}    ${FAIRWAY_DESIGN_SHIP_HEADING_ENGLISH}    ${FAIRWAY_DIMENSIONS_HEADING_ENGLISH}    ${MEETING_AND_OVERTAKING_PROHIBITION_AREAS_HEADING_ENGLISH}    ${SPEED_LIMITS_AND_RECOMMENDATIONS_HEADING_ENGLISH}
	Check Traffic Services Headings    ${TRAFFIC_SERVICES_HEADING_ENGLISH}    ${PILOTAGE_HEADING_ENGLISH}    ${VTS_HEADING_ENGLISH}
	Check Fairway Harbours Headings    ${HARBOUR_NAME_HEADING}    ${HARBOUR_RESTRICTIONS_HEADING_ENGLISH}    ${QUAYS_HEADING_ENGLISH}    ${CARGO_HANDLING_HEADING_ENGLISH}    ${HARBOUR_BASIN_HEADING_ENGLISH}    ${CONTACT_DETAILS_HEADING_ENGLISH}
	Check That Tabs Can Be Selected And Tab Contents Are Activated
	Scroll Element Into View    ${CLOSE_BUTTON}
	Click Element    ${CLOSE_BUTTON}

*** Keywords ***
Open DVK
	Open Browser    http://localhost:${PORT}    ${BROWSER}
	Sleep    5s
	Press Keys    None    ESC
	Sleep    5s
	Wait Until Element Is Not Visible    ${SOVELLUSTA_ALUSTETAAN_POP_UP}    30s
	Capture Page Screenshot
	Element Should Not Be Visible    ${LATAUSVIRHE_POP_UP}    Loading DVK failed

Change Fairway Card Language To
	[Arguments]    ${language}    ${language_button_disabled}    ${fairways_text}
	Click Element    ${SIDEBAR_MENU_CONTROL_BUTTON}
	Sleep    2s
	Wait Until Element Is Visible    ${language}
	Click Element    ${language}
	Wait Until Element Is Visible    ${language_button_disabled}    30s
	Wait Until Element Contains    ${FAIRWAYS_LINK}    ${fairways_text}    30s
	Click Element    ${CLOSE_MENU_BUTTON}
	Wait Until Element Is Not Visible    ${CLOSE_MENU_BUTTON}    30s

Check That Toggle Wide Button Works Correctly For Fairway Card Tab
	Element Should Not Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
	Element Should Be Visible    ${EXPAND_WIDE_BUTTON}
	Click Element    ${EXPAND_WIDE_BUTTON}
	Element Should Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
	Click Element    ${REVERT_WIDE_BUTTON}
	Element Should Not Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
	Sleep    2s

Check That Toggle Wide Button Works Correctly For Fairway Harbours Tab
	Element Should Not Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
	Element Should Be Visible    ${EXPAND_WIDE_BUTTON}
	Click Element    ${EXPAND_WIDE_BUTTON}
	Element Should Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
	Click Element    ${REVERT_WIDE_BUTTON}
	Element Should Not Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
	Sleep    2s

Check That Toggle Wide Button Works Correctly For Fairway Areas Tab
	Element Should Not Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
	Element Should Be Visible    ${EXPAND_WIDE_BUTTON}
	Click Element    ${EXPAND_WIDE_BUTTON}
	Element Should Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
	Click Element    ${REVERT_WIDE_BUTTON}
	Element Should Not Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
	Sleep    2s

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

Check Fairway Cards Page And Select Fairway
	[Arguments]    ${language}
	Click Element    ${SIDEBAR_MENU_CONTROL_BUTTON}
	Wait Until Element Is Visible    ${FAIRWAYS_LINK}    30s
	Capture Page Screenshot
	Click Element    ${FAIRWAYS_LINK}
	Sleep    5s
	Capture Page Screenshot
	Check Fairway Cards Page    ${language}
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
	Sleep    2s

Check Fairway Navigability Headings
	[Arguments]    ${heading1_locator}    ${heading2_locator}    ${heading3_locator}
	Scroll Element Into View    ${heading1_locator}
	Element Should Be Visible    ${heading1_locator}
	Scroll Element Into View    ${heading2_locator}
	Element Should Be Visible    ${heading2_locator}
	Scroll Element Into View    ${heading3_locator}
	Element Should Be Visible    ${heading3_locator}
	Scroll Element Into View    ${CLOSE_BUTTON}

Check Fairway Data Headings
	[Arguments]    ${heading1_locator}    ${heading2_locator}    ${heading3_locator}    ${heading4_locator}    ${heading5_locator}    ${heading6_locator}
	Scroll Element Into View    ${heading1_locator}
	Element Should Be Visible    ${heading1_locator}
	Scroll Element Into View    ${heading2_locator}
	Element Should Be Visible    ${heading2_locator}
	Scroll Element Into View    ${heading3_locator}
	Element Should Be Visible    ${heading3_locator}
	Scroll Element Into View    ${heading4_locator}
	Element Should Be Visible    ${heading4_locator}
	Scroll Element Into View    ${heading5_locator}
	Element Should Be Visible    ${heading5_locator}
	Scroll Element Into View    ${heading6_locator}
	Element Should Be Visible    ${heading6_locator}
	Scroll Element Into View    ${CLOSE_BUTTON}

Check Traffic Services Headings
	[Arguments]    ${heading1_locator}    ${heading2_locator}    ${heading3_locator}
	Scroll Element Into View    ${heading1_locator}
	Element Should Be Visible    ${heading1_locator}
	Scroll Element Into View    ${heading2_locator}
	Element Should Be Visible    ${heading2_locator}
	Scroll Element Into View    ${heading3_locator}
	Element Should Be Visible    ${heading3_locator}
	Scroll Element Into View    ${CLOSE_BUTTON}

Check Fairway Harbours Headings
	[Arguments]    ${heading1_locator}    ${heading2_locator}    ${heading3_locator}    ${heading4_locator}    ${heading5_locator}    ${heading6_locator}
	Click Element    ${FAIRWAY_HARBOURS_TAB}
	Wait Until Element Is Visible    ${FAIRWAY_HARBOURS_TAB_IS_SELECTED}    30s
	${heading1_elements}=    Get WebElements    ${heading1_locator}
	${harbours_count}=    Get Length    ${heading1_elements}
	Run Keyword And Return If    ${harbours_count} == 0    Open Fairway Card Tab
	Scroll Element Into View    ${heading1_locator}
	Element Should Be Visible    ${heading1_locator}
	Scroll Element Into View    ${heading2_locator}
	Heading Count Matches Harbours Count    ${heading2_locator}    ${harbours_count}
	Element Should Be Visible    ${heading2_locator}
	Scroll Element Into View    ${heading3_locator}
	Heading Count Matches Harbours Count    ${heading3_locator}    ${harbours_count}
	Element Should Be Visible    ${heading3_locator}
	Scroll Element Into View    ${heading4_locator}
	Heading Count Matches Harbours Count    ${heading4_locator}    ${harbours_count}
	Element Should Be Visible    ${heading4_locator}
	Scroll Element Into View    ${heading5_locator}
	Heading Count Matches Harbours Count    ${heading5_locator}    ${harbours_count}
	Element Should Be Visible    ${heading5_locator}
	Scroll Element Into View    ${heading6_locator}
	Heading Count Matches Harbours Count    ${heading6_locator}    ${harbours_count}
	Element Should Be Visible    ${heading6_locator}
	Scroll Element Into View    ${FAIRWAY_CARD_TAB}
	Open Fairway Card Tab

Heading Count Matches Harbours Count
	[Arguments]    ${heading_locator}    ${harbours_count}
	${heading_elements}=    Get WebElements    ${heading_locator}
	${heading_count}=    Get Length    ${heading_elements}
	Should Be Equal    ${heading_count}    ${harbours_count}

Open Fairway Card Tab
	Click Element    ${FAIRWAY_CARD_TAB}
	Wait Until Element Is Visible    ${FAIRWAY_CARD_TAB_IS_SELECTED}    30s
	Scroll Element Into View    ${CLOSE_BUTTON}

Check Fairway Cards Page
	[Arguments]    ${language}
	Scroll Element Into View    ${FAIRWAY_CARDS_HEADING_${language}}
	Element Should Be Visible    ${FAIRWAY_CARDS_HEADING_${language}}
	Scroll Element Into View    ${GENERAL_HEADING_${language}}
	Element Should Be Visible    ${GENERAL_HEADING_${language}}
	Scroll Element Into View    ${ARCHIPELAGO_SEA_HEADING_${language}}
	Element Should Be Visible    ${ARCHIPELAGO_SEA_HEADING_${language}}
	Scroll Element Into View    ${ARCHIPELAGO_SEA_FAIRWAY_TABLE_${language}}
	Element Should Be Visible    ${ARCHIPELAGO_SEA_FAIRWAY_TABLE_${language}}
	Scroll Element Into View    ${ARCHIPELAGO_SEA_FAIRWAY_TABLE_HEADING_1_${language}}
	Element Should Be Visible    ${ARCHIPELAGO_SEA_FAIRWAY_TABLE_HEADING_1_${language}}
	Scroll Element Into View    ${ARCHIPELAGO_SEA_FAIRWAY_TABLE_HEADING_2_${language}}
	Element Should Be Visible    ${ARCHIPELAGO_SEA_FAIRWAY_TABLE_HEADING_2_${language}}
	Scroll Element Into View    ${GULF_OF_FINLAND_HEADING_${language}}
	Element Should Be Visible    ${GULF_OF_FINLAND_HEADING_${language}}
	Scroll Element Into View    ${GULF_OF_FINLAND_FAIRWAY_TABLE_${language}}
	Element Should Be Visible    ${GULF_OF_FINLAND_FAIRWAY_TABLE_${language}}
	Scroll Element Into View    ${GULF_OF_FINLAND_FAIRWAY_TABLE_HEADING_1_${language}}
	Element Should Be Visible    ${GULF_OF_FINLAND_FAIRWAY_TABLE_HEADING_1_${language}}
	Scroll Element Into View    ${GULF_OF_FINLAND_FAIRWAY_TABLE_HEADING_2_${language}}
	Element Should Be Visible    ${GULF_OF_FINLAND_FAIRWAY_TABLE_HEADING_2_${language}}
	Scroll Element Into View    ${GULF_OF_BOTHNIA_HEADING_${language}}
	Element Should Be Visible    ${GULF_OF_BOTHNIA_HEADING_${language}}
	Scroll Element Into View    ${GULF_OF_BOTHNIA_FAIRWAY_TABLE_${language}}
	Element Should Be Visible    ${GULF_OF_BOTHNIA_FAIRWAY_TABLE_${language}}
	Scroll Element Into View    ${GULF_OF_BOTHNIA_FAIRWAY_TABLE_HEADING_1_${language}}
	Element Should Be Visible    ${GULF_OF_BOTHNIA_FAIRWAY_TABLE_HEADING_1_${language}}
	Scroll Element Into View    ${GULF_OF_BOTHNIA_FAIRWAY_TABLE_HEADING_2_${language}}
	Element Should Be Visible    ${GULF_OF_BOTHNIA_FAIRWAY_TABLE_HEADING_2_${language}}
	Scroll Element Into View    ${BACK_TO_HOME_BUTTON}
