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

Check Fairway Card In Finnish
	[Documentation]    This test case contains checks for content of randomly selected fairway card in finnish language
	Change Language And Check Fairway Cards Page And Select Fairway    FINNISH    ${IN_FINNISH_BUTTON}    ${IN_FINNISH_BUTTON_DISABLED}    Väyläkortit
	Search Selected Fairway Card    ${SELECTED_FAIRWAY_CARD}
	Check Fairway Navigability Headings    FINNISH
	Check Fairway Data Headings    FINNISH
	Check Traffic Services Headings    FINNISH
	Check Fairway Harbours Headings    FINNISH
	Check That Tabs Can Be Selected And Tab Contents Are Activated
	Scroll Element Into View    ${CLOSE_BUTTON}
	Click Element    ${CLOSE_BUTTON}

Check Fairway Card In Swedish
	[Documentation]    This test case contains checks for content of randomly selected fairway card in swedish language
	Change Language And Check Fairway Cards Page And Select Fairway    SWEDISH    ${IN_SWEDISH_BUTTON}    ${IN_SWEDISH_BUTTON_DISABLED}    Farledskort
	Search Selected Fairway Card    ${SELECTED_FAIRWAY_CARD}
	Check Fairway Navigability Headings    SWEDISH
	Check Fairway Data Headings    SWEDISH
	Check Traffic Services Headings    SWEDISH
	Check Fairway Harbours Headings    SWEDISH
	Check That Tabs Can Be Selected And Tab Contents Are Activated
	Scroll Element Into View    ${CLOSE_BUTTON}
	Click Element    ${CLOSE_BUTTON}

Check Fairway Card In English
	[Documentation]    This test case contains checks for content of randomly selected fairway card in english language
	Change Language And Check Fairway Cards Page And Select Fairway    ENGLISH    ${IN_ENGLISH_BUTTON}    ${IN_ENGLISH_BUTTON_DISABLED}    Fairway Cards
	Search Selected Fairway Card    ${SELECTED_FAIRWAY_CARD}
	Check Fairway Navigability Headings    ENGLISH
	Check Fairway Data Headings    ENGLISH
	Check Traffic Services Headings    ENGLISH
	Check Fairway Harbours Headings    ENGLISH
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
	[Arguments]    ${language_button}    ${language_button_disabled}    ${fairways_text}
	${count}=    Get WebElements    ${language_button_disabled}
	${language_button_disabled_count}=    Get Length    ${count}
	IF    ${language_button_disabled_count} == 1    RETURN
	Wait Until Element Is Visible    ${language_button}
	Click Element    ${language_button}
	Wait Until Element Is Visible    ${language_button_disabled}    30s
	Wait Until Element Contains    ${FAIRWAYS_LINK}    ${fairways_text}    30s

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

Change Language And Check Fairway Cards Page And Select Fairway
	[Arguments]    ${language}    ${language_button}    ${language_button_disabled}    ${fairways_text}
	Click Element    ${SIDEBAR_MENU_CONTROL_BUTTON}
	Wait Until Element Is Visible    ${FAIRWAYS_LINK}    30s
	Capture Page Screenshot
	Change Fairway Card Language To    ${language_button}    ${language_button_disabled}    ${fairways_text}
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
	[Arguments]    ${language}
	Scroll Element Into View    ${FAIRWAY_NAVIGABILITY_HEADING_${language}}
	Element Should Be Visible    ${FAIRWAY_NAVIGABILITY_HEADING_${language}}
	Scroll Element Into View    ${NAVIGATION_CONDITIONS_HEADING_${language}}
	Element Should Be Visible    ${NAVIGATION_CONDITIONS_HEADING_${language}}
	Scroll Element Into View    ${ICE_CONDITIONS_HEADING_${language}}
	Element Should Be Visible    ${ICE_CONDITIONS_HEADING_${language}}
	Scroll Element Into View    ${CLOSE_BUTTON}

Check Fairway Data Headings
	[Arguments]    ${language}
	Scroll Element Into View    ${FAIRWAY_DATA_HEADING_${language}}
	Element Should Be Visible    ${FAIRWAY_DATA_HEADING_${language}}
	Scroll Element Into View    ${CHANNEL_ALIGNMENT_AND_MARKING_HEADING_${language}}
	Element Should Be Visible    ${CHANNEL_ALIGNMENT_AND_MARKING_HEADING_${language}}
	Scroll Element Into View    ${FAIRWAY_DESIGN_SHIP_HEADING_${language}}
	Element Should Be Visible    ${FAIRWAY_DESIGN_SHIP_HEADING_${language}}
	Scroll Element Into View    ${FAIRWAY_DIMENSIONS_HEADING_${language}}
	Element Should Be Visible    ${FAIRWAY_DIMENSIONS_HEADING_${language}}
	Scroll Element Into View    ${MEETING_AND_OVERTAKING_PROHIBITION_AREAS_HEADING_${language}}
	Element Should Be Visible    ${MEETING_AND_OVERTAKING_PROHIBITION_AREAS_HEADING_${language}}
	Scroll Element Into View    ${SPEED_LIMITS_AND_RECOMMENDATIONS_HEADING_${language}}
	Element Should Be Visible    ${SPEED_LIMITS_AND_RECOMMENDATIONS_HEADING_${language}}
	Scroll Element Into View    ${CLOSE_BUTTON}

Check Traffic Services Headings
	[Arguments]    ${language}
	Scroll Element Into View    ${TRAFFIC_SERVICES_HEADING_${language}}
	Element Should Be Visible    ${TRAFFIC_SERVICES_HEADING_${language}}
	Scroll Element Into View    ${PILOTAGE_HEADING_${language}}
	Element Should Be Visible    ${PILOTAGE_HEADING_${language}}
	Scroll Element Into View    ${VTS_HEADING_${language}}
	Element Should Be Visible    ${VTS_HEADING_${language}}
	Scroll Element Into View    ${CLOSE_BUTTON}

Check Fairway Harbours Headings
	[Arguments]    ${language}
	Click Element    ${FAIRWAY_HARBOURS_TAB}
	Wait Until Element Is Visible    ${FAIRWAY_HARBOURS_TAB_IS_SELECTED}    30s
	${heading1_elements}=    Get WebElements    ${HARBOUR_NAME_HEADING}
	${harbours_count}=    Get Length    ${heading1_elements}
	Run Keyword And Return If    ${harbours_count} == 0    Open Fairway Card Tab
	Scroll Element Into View    ${HARBOUR_NAME_HEADING}
	Element Should Be Visible    ${HARBOUR_NAME_HEADING}
	Scroll Element Into View    ${HARBOUR_RESTRICTIONS_HEADING_${language}}
	Heading Count Matches Harbours Count    ${HARBOUR_RESTRICTIONS_HEADING_${language}}    ${harbours_count}
	Element Should Be Visible    ${HARBOUR_RESTRICTIONS_HEADING_${language}}
	Scroll Element Into View    ${QUAYS_HEADING_${language}}
	Heading Count Matches Harbours Count    ${QUAYS_HEADING_${language}}    ${harbours_count}
	Element Should Be Visible    ${QUAYS_HEADING_${language}}
	Scroll Element Into View    ${CARGO_HANDLING_HEADING_${language}}
	Heading Count Matches Harbours Count    ${CARGO_HANDLING_HEADING_${language}}    ${harbours_count}
	Element Should Be Visible    ${CARGO_HANDLING_HEADING_${language}}
	Scroll Element Into View    ${HARBOUR_BASIN_HEADING_${language}}
	Heading Count Matches Harbours Count    ${HARBOUR_BASIN_HEADING_${language}}    ${harbours_count}
	Element Should Be Visible    ${HARBOUR_BASIN_HEADING_${language}}
	Scroll Element Into View    ${CONTACT_DETAILS_HEADING_${language}}
	Heading Count Matches Harbours Count    ${CONTACT_DETAILS_HEADING_${language}}    ${harbours_count}
	Element Should Be Visible    ${CONTACT_DETAILS_HEADING_${language}}
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

Search Selected Fairway Card
	[Arguments]    ${selected_fairway}
	${input_fairway_dropdown_locator}=    Set Variable    //*[@data-testid = "cardOption"]/*[text() = "${selected_fairway}"]
	Input Text    ${INPUT_FAIRWAY}    ${selected_fairway}
	${fairway}=    Get Text    ${input_fairway_dropdown_locator}
	Should Be Equal    ${selected_fairway}    ${fairway}
	Click Element    ${input_fairway_dropdown_locator}
	Wait Until Element Is Visible    ${FAIRWAY_HEADING}    30s
	Element Should Contain    ${FAIRWAY_HEADING}    ${selected_fairway}
