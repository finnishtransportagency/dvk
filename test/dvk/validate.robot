*** Settings ***
Documentation     This test suite contains test cases for DVK
Test Setup        Open DVK
Test Teardown     Close All Browsers
Library           SeleniumLibrary
Library           String
Library           DateTime
Library           Collections
Resource          resources_dvk.resource
*** Variables ***
${PROTOCOL}       http
${HOST}           localhost
${PORT}           3000
${URL}            ${PROTOCOL}://${HOST}:${PORT}
${BROWSER}        headlesschrome

*** Test Cases ***
Check Scale
    [Documentation]    This test case checks that scale exists in DVK
    ${SCALE_STRING}=    Get Text    ${SCALE_ELEMENT}
    Should Match Regexp    ${SCALE_STRING}    ${REGEX_SCALE}

Check Layer Control
    [Documentation]    This test case checks that layer control can be opened in DVK
    Click Element    ${LAYER_CONTROL_BUTTON}
    Wait Until Element Is Visible    ${LAYER_CONTROL_HEADING}    30s
    ${LAYER_CONTROL}=    Get Text    ${LAYER_CONTROL_HEADING}
    Capture Page Screenshot
    Click Element At Coordinates    ${LAYER_CONTROL_HEADING}    -300    0
    Wait Until Element Is Visible    ${LAYER_CONTROL_BUTTON}    30s

Check Center And Zoom Buttons
    [Documentation]    This test case checks that center- and zoom-buttons are visible in DVK
    Element Should Be Visible    ${CENTER_TO_OWN_LOCATION_BUTTON}
    Element Should Be Visible    ${ZOOM_IN_BUTTON}
    Element Should Be Visible    ${ZOOM_OUT_BUTTON}

Check Fairway Card In Finnish
    [Documentation]    This test case contains checks for content of randomly selected fairway card in finnish language
    Change Language And Check Fairway Cards Page And Select Fairway    FINNISH
    Search Selected Fairway Card    ${SELECTED_FAIRWAY_CARD}
    Check Fairway Harbours Tab    FINNISH
    Check Fairway Areas Tab
    Check Fairway Card Tab    FINNISH
    Scroll Element Into View    ${CLOSE_BUTTON}
    Click Element    ${CLOSE_BUTTON}

Check Fairway Card In Swedish
    [Documentation]    This test case contains checks for content of randomly selected fairway card in swedish language
    Change Language And Check Fairway Cards Page And Select Fairway    SWEDISH
    Search Selected Fairway Card    ${SELECTED_FAIRWAY_CARD}
    Check Fairway Harbours Tab    SWEDISH
    Check Fairway Areas Tab
    Check Fairway Card Tab    SWEDISH
    Scroll Element Into View    ${CLOSE_BUTTON}
    Click Element    ${CLOSE_BUTTON}

Check Fairway Card In English
    [Documentation]    This test case contains checks for content of randomly selected fairway card in english language
    Change Language And Check Fairway Cards Page And Select Fairway    ENGLISH
    Search Selected Fairway Card    ${SELECTED_FAIRWAY_CARD}
    Check Fairway Harbours Tab    ENGLISH
    Check Fairway Areas Tab
    Check Fairway Card Tab    ENGLISH
    Scroll Element Into View    ${CLOSE_BUTTON}
    Click Element    ${CLOSE_BUTTON}
*** Keywords ***
Open DVK
    [Documentation]    This keyword opens DVK in localhost with port and browser given as variables
    Wait Until Keyword Succeeds    3x    2s    Open Browser    ${URL}    ${BROWSER}     options=add_experimental_option("excludeSwitches", ["enable-logging"])
    Sleep    5s
    Press Keys    None    ESC
    Wait Until Element Is Not Visible    ${SOVELLUSTA_ALUSTETAAN_POP_UP}    30s
    Capture Page Screenshot
    Element Should Not Be Visible    ${LATAUSVIRHE_POP_UP}    Loading DVK failed

Change Fairway Card Language To
    [Arguments]    ${language_button}    ${language_button_disabled}    ${fairways_text}
    [Documentation]    This keyword changes Fairway Card language to language given in keyword arguments, but if language is already selected the keyword is returned before changing language
    ${count}=    Get WebElements    ${language_button_disabled}
    ${language_button_disabled_count}=    Get Length    ${count}
    IF    ${language_button_disabled_count} == 1    RETURN
    Wait Until Element Is Visible    ${language_button}
    Click Element    ${language_button}
    Wait Until Element Is Visible    ${language_button_disabled}    30s
    Wait Until Element Contains    ${FAIRWAYS_LINK}    ${fairways_text}    30s

Check That Toggle Wide Button Works Correctly For Fairway Card Tab
    [Documentation]    This keyword checks that toggle wide button work correctly in Fairway Card tab
    Element Should Not Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
    Element Should Be Visible    ${EXPAND_WIDE_BUTTON}
    Click Element    ${EXPAND_WIDE_BUTTON}
    Wait Until Element Is Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
    Element Should Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
    Wait Until Element Is Visible    ${REVERT_WIDE_BUTTON}
    Element Should Be Visible    ${REVERT_WIDE_BUTTON}
    Scroll Element Into View    ${REVERT_WIDE_BUTTON}
    Click Element    ${REVERT_WIDE_BUTTON}
    Wait Until Element Is Not Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
    Element Should Not Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_WIDE}
    Sleep    2s

Check That Toggle Wide Button Works Correctly For Fairway Harbours Tab
    [Documentation]    This keyword checks that toggle wide button work correctly in Fairway Harbours tab
    Element Should Not Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
    Element Should Be Visible    ${EXPAND_WIDE_BUTTON}
    Click Element    ${EXPAND_WIDE_BUTTON}
    Wait Until Element Is Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
    Element Should Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
    Wait Until Element Is Visible    ${REVERT_WIDE_BUTTON}
    Element Should Be Visible    ${REVERT_WIDE_BUTTON}
    Scroll Element Into View    ${REVERT_WIDE_BUTTON}
    Click Element    ${REVERT_WIDE_BUTTON}
    Wait Until Element Is Not Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
    Element Should Not Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
    Sleep    2s

Check That Toggle Wide Button Works Correctly For Fairway Areas Tab
    [Documentation]    This keyword checks that toggle wide button work correctly in Fairway Areas tab
    Element Should Not Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
    Element Should Be Visible    ${EXPAND_WIDE_BUTTON}
    Click Element    ${EXPAND_WIDE_BUTTON}
    Wait Until Element Is Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
    Element Should Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
    Wait Until Element Is Visible    ${REVERT_WIDE_BUTTON}
    Element Should Be Visible    ${REVERT_WIDE_BUTTON}
    Scroll Element Into View    ${REVERT_WIDE_BUTTON}
    Click Element    ${REVERT_WIDE_BUTTON}
    Wait Until Element Is Not Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
    Element Should Not Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
    Sleep    2s

Change Language And Check Fairway Cards Page And Select Fairway
    [Arguments]    ${language}
    [Documentation]    This keyword changes language with language given in keyword argument, checks content of Fairway Cards page, selects random fairway and sets the selected fairway as test variable
    Click Element    ${SIDEBAR_MENU_CONTROL_BUTTON}
    Wait Until Element Is Visible    ${FAIRWAYS_LINK}    30s
    Capture Page Screenshot
    Change Fairway Card Language To    ${IN_${language}_BUTTON}    ${IN_${language}_BUTTON_DISABLED}    ${FAIRWAYS_TEXT_${language}}
    Click Element    ${FAIRWAYS_LINK}
    Sleep    5s
    Capture Page Screenshot
    Check Fairway Cards Page    ${language}
    @{fairway_cards_list}=    Create List
    ${fairway_cards_count}=    Get Element Count    ${FAIRWAY_CARDS}
    Run Keyword If    ${fairway_cards_count} == 0    Fail    No fairway cards found on the page!
    ${selected_number}=    Evaluate    1
    ${all_elements}=    Get WebElements    ${FAIRWAY_CARDS}
    FOR    ${item}    IN    @{all_elements}
    Scroll Element Into View    ${item}
    Append To List    ${fairway_cards_list}    ${item.text}
    END
    ${fairway_cards_list_count}=    Get Length    ${fairway_cards_list}
    Should Be Equal    ${fairway_cards_count}    ${fairway_cards_list_count}
    ${SELECTED_FAIRWAY_CARD}=    Get From List    ${fairway_cards_list}    ${selected_number}
    Set Test Variable    ${SELECTED_FAIRWAY_CARD}
    Scroll Element Into View    ${BACK_TO_HOME_BUTTON}
    Capture Page Screenshot
    Click Element    ${BACK_TO_HOME_BUTTON}
    Sleep    2s

Check Fairway Navigability Headings
    [Arguments]    ${language}
    [Documentation]    This keyword checks headings of Fairway Navigability section with language given in keyword argument
    Scroll Element Into View    ${FAIRWAY_NAVIGABILITY_HEADING_${language}}
    Element Should Be Visible    ${FAIRWAY_NAVIGABILITY_HEADING_${language}}
    Scroll Element Into View    ${NAVIGATION_CONDITIONS_HEADING_${language}}
    Element Should Be Visible    ${NAVIGATION_CONDITIONS_HEADING_${language}}
    Scroll Element Into View    ${ICE_CONDITIONS_HEADING_${language}}
    Element Should Be Visible    ${ICE_CONDITIONS_HEADING_${language}}
    Scroll Element Into View    ${CLOSE_BUTTON}

Check Fairway Data Headings
    [Arguments]    ${language}
    [Documentation]    This keyword checks headings of Fairway Data section with language given in keyword argument
    Scroll Element Into View    ${FAIRWAY_DATA_HEADING_${language}}
    Element Should Be Visible    ${FAIRWAY_DATA_HEADING_${language}}
    Scroll Element Into View    ${CHANNEL_ALIGNMENT_AND_MARKING_HEADING_${language}}
    Element Should Be Visible    ${CHANNEL_ALIGNMENT_AND_MARKING_HEADING_${language}}
    # Scroll Element Into View    ${FAIRWAY_DESIGN_SHIP_HEADING_${language}}
    # Element Should Be Visible    ${FAIRWAY_DESIGN_SHIP_HEADING_${language}}
    Scroll Element Into View    ${FAIRWAY_DIMENSIONS_HEADING_${language}}
    Element Should Be Visible    ${FAIRWAY_DIMENSIONS_HEADING_${language}}
    Scroll Element Into View    ${MEETING_AND_OVERTAKING_PROHIBITION_AREAS_HEADING_${language}}
    Element Should Be Visible    ${MEETING_AND_OVERTAKING_PROHIBITION_AREAS_HEADING_${language}}
    Scroll Element Into View    ${SPEED_LIMITS_AND_RECOMMENDATIONS_HEADING_${language}}
    Element Should Be Visible    ${SPEED_LIMITS_AND_RECOMMENDATIONS_HEADING_${language}}
    Scroll Element Into View    ${CLOSE_BUTTON}

Check Traffic Services Headings
    [Arguments]    ${language}
    [Documentation]    This keyword checks headings of Traffice Services section with language given in keyword argument
    Scroll Element Into View    ${TRAFFIC_SERVICES_HEADING_${language}}
    Element Should Be Visible    ${TRAFFIC_SERVICES_HEADING_${language}}
    Scroll Element Into View    ${PILOTAGE_HEADING_${language}}
    Element Should Be Visible    ${PILOTAGE_HEADING_${language}}
    Scroll Element Into View    ${VTS_HEADING_${language}}
    Element Should Be Visible    ${VTS_HEADING_${language}}
    Scroll Element Into View    ${CLOSE_BUTTON}

Check Fairway Harbours Headings
    [Arguments]    ${language}
    [Documentation]    This keyword checks headings of Fairway Harbours tab with language given in keyword argument
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
    [Documentation]    This keyword checks that heading count matches the harbours count, both are given in keyword arguments
    ${heading_elements}=    Get WebElements    ${heading_locator}
    ${heading_count}=    Get Length    ${heading_elements}
    Should Be Equal    ${heading_count}    ${harbours_count}

Open Fairway Card Tab
    [Documentation]    This keyword opens Fairway Card tab
    Click Element    ${FAIRWAY_CARD_TAB}
    Wait Until Element Is Visible    ${FAIRWAY_CARD_TAB_IS_SELECTED}    30s
    Scroll Element Into View    ${CLOSE_BUTTON}

Check Fairway Cards Page
    [Arguments]    ${language}
    [Documentation]    This keyword checks the headings in Fairway Cards page with language given in keyword argument
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
    [Documentation]    This keyword searches the Fairway Card that is given in keyword argument
    ${input_fairway_dropdown_locator}=    Set Variable    //*[@data-testid = "cardOption"]/*[text() = "${selected_fairway}"]
    Input Text    ${INPUT_FAIRWAY}    ${selected_fairway}
    ${fairway}=    Get Text    ${input_fairway_dropdown_locator}
    Should Be Equal    ${selected_fairway}    ${fairway}
    Click Element    ${input_fairway_dropdown_locator}
    Wait Until Element Is Visible    ${FAIRWAY_HEADING}    30s
    Element Should Contain    ${FAIRWAY_HEADING}    ${selected_fairway}

Check Fairway Card Tab
    [Arguments]    ${language}
    [Documentation]    This keyword checks that Fairway Card tab can be selected, tab content is activated and checks the tab content with language given in keyword argument
    Click Element    ${FAIRWAY_CARD_TAB}
    Wait Until Element Is Visible    ${FAIRWAY_CARD_TAB_IS_SELECTED}    30s
    Element Should Be Visible    ${FAIRWAY_CARD_TAB_CONTENT_IS_ACTIVE}
    Check That Toggle Wide Button Works Correctly For Fairway Card Tab
    Check Fairway Navigability Headings    ${language}
    Check Fairway Data Headings    ${language}
    Check Traffic Services Headings    ${language}

Check Fairway Harbours Tab
    [Arguments]    ${language}
    [Documentation]    This keyword checks that Fairway Harbours tab can be selected, tab content is activated and checks the tab content with language given in keyword argument
    Click Element    ${FAIRWAY_HARBOURS_TAB}
    Wait Until Element Is Visible    ${FAIRWAY_HARBOURS_TAB_IS_SELECTED}    30s
    Element Should Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_IS_ACTIVE}
    Check That Toggle Wide Button Works Correctly For Fairway Harbours Tab
    Check Fairway Harbours Headings    ${language}

Check Fairway Areas Tab
    [Documentation]    This keyword checks that Fairway Areas tab can be selected and tab content is activated
    Click Element    ${FAIRWAY_AREAS_TAB}
    Wait Until Element Is Visible    ${FAIRWAY_AREAS_TAB_IS_SELECTED}    30s
    Element Should Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_IS_ACTIVE}
    Check That Toggle Wide Button Works Correctly For Fairway Areas Tab
