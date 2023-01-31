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
${FAIRWAY_CARD_TAB_IS_SELECTED}    //ion-segment[@data-testid = "tabChange" and @value = "1"]
${FAIRWAY_CARD_TAB_CONTENT_IS_ACTIVE}    //div[@class = "tabContent tab1 active"]
${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}    //div[@class = "tabContent tab2 wide active"]
${FAIRWAY_HARBOURS_TAB}    //ion-segment-button[@value = "2"]
${FAIRWAY_HARBOURS_TAB_IS_SELECTED}    //ion-segment[@data-testid = "tabChange" and @value = "2"]
${FAIRWAY_HARBOURS_TAB_CONTENT_IS_ACTIVE}    //div[@class = "tabContent tab2 active"]
${FAIRWAY_AREAS_TAB_CONTENT_WIDE}    //div[@class = "tabContent tab3 wide active"]
${FAIRWAY_AREAS_TAB}    //ion-segment-button[@value = "3"]
${FAIRWAY_AREAS_TAB_IS_SELECTED}    //ion-segment[@data-testid = "tabChange" and @value = "3"]
${FAIRWAY_AREAS_TAB_CONTENT_IS_ACTIVE}    //div[@class = "tabContent tab3 active"]
${COPYRIGHT_ELEMENT}    //div[@class = "copyrightElem"]
${SCALE_ELEMENT}    //div[@class = "ol-scale-line-inner"]
${REGEX_SCALE}    \\d+\\s(m|km)
${FAIRWAY_CARDS}    //ion-row[@class = "fairwayCards md"]/ion-col/ion-label/a
${SIDEBAR_MENU_CONTROL_BUTTON}    //button[@class = "openSidebarMenuControl"]
${FAIRWAY_CARDS_HEADING_FINNISH}    //ion-text[@class = "fairwayTitle md"]/h2/strong[text() = "Väyläkortit"]
${GENERAL_HEADING_FINNISH}    //ion-item[@slot = "header"]/ion-label[text() = "Yleistä"]
${ARCHIPELAGO_SEA_HEADING_FINNISH}    //ion-text/h4/strong[text() = "Saaristomeri"]
${ARCHIPELAGO_SEA_FAIRWAY_TABLE_FINNISH}    //ion-text/h4/strong[text() = "Saaristomeri"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]
${ARCHIPELAGO_SEA_FAIRWAY_TABLE_HEADING_1_FINNISH}    //ion-text/h4/strong[text() = "Saaristomeri"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Väyläkortin nimi"]
${ARCHIPELAGO_SEA_FAIRWAY_TABLE_HEADING_2_FINNISH}    //ion-text/h4/strong[text() = "Saaristomeri"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Päivitetty"]
${GULF_OF_FINLAND_HEADING_FINNISH}    //ion-text/h4/strong[text() = "Suomenlahti"]
${GULF_OF_FINLAND_FAIRWAY_TABLE_FINNISH}    //ion-text/h4/strong[text() = "Suomenlahti"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]
${GULF_OF_FINLAND_FAIRWAY_TABLE_HEADING_1_FINNISH}    //ion-text/h4/strong[text() = "Suomenlahti"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Väyläkortin nimi"]
${GULF_OF_FINLAND_FAIRWAY_TABLE_HEADING_2_FINNISH}    //ion-text/h4/strong[text() = "Suomenlahti"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Päivitetty"]
${GULF_OF_BOTHNIA_HEADING_FINNISH}    //ion-text/h4/strong[text() = "Pohjanlahden alue"]
${GULF_OF_BOTHNIA_FAIRWAY_TABLE_FINNISH}    //ion-text/h4/strong[text() = "Pohjanlahden alue"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]
${GULF_OF_BOTHNIA_FAIRWAY_TABLE_HEADING_1_FINNISH}    //ion-text/h4/strong[text() = "Pohjanlahden alue"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Väyläkortin nimi"]
${GULF_OF_BOTHNIA_FAIRWAY_TABLE_HEADING_2_FINNISH}    //ion-text/h4/strong[text() = "Pohjanlahden alue"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Päivitetty"]
${FAIRWAY_CARDS_HEADING_SWEDISH}    //ion-text[@class = "fairwayTitle md"]/h2/strong[text() = "Farledskort"]
${GENERAL_HEADING_SWEDISH}    //ion-item[@slot = "header"]/ion-label[text() = "Allmänt"]
${ARCHIPELAGO_SEA_HEADING_SWEDISH}    //ion-text/h4/strong[text() = "Skärgårdshavet"]
${ARCHIPELAGO_SEA_FAIRWAY_TABLE_SWEDISH}    //ion-text/h4/strong[text() = "Skärgårdshavet"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]
${ARCHIPELAGO_SEA_FAIRWAY_TABLE_HEADING_1_SWEDISH}    //ion-text/h4/strong[text() = "Skärgårdshavet"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Farledskortets namn"]
${ARCHIPELAGO_SEA_FAIRWAY_TABLE_HEADING_2_SWEDISH}    //ion-text/h4/strong[text() = "Skärgårdshavet"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Uppdaterat"]
${GULF_OF_FINLAND_HEADING_SWEDISH}    //ion-text/h4/strong[text() = "Finska vikens område"]
${GULF_OF_FINLAND_FAIRWAY_TABLE_SWEDISH}    //ion-text/h4/strong[text() = "Finska vikens område"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]
${GULF_OF_FINLAND_FAIRWAY_TABLE_HEADING_1_SWEDISH}    //ion-text/h4/strong[text() = "Finska vikens område"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Farledskortets namn"]
${GULF_OF_FINLAND_FAIRWAY_TABLE_HEADING_2_SWEDISH}    //ion-text/h4/strong[text() = "Finska vikens område"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Uppdaterat"]
${GULF_OF_BOTHNIA_HEADING_SWEDISH}    //ion-text/h4/strong[text() = "Bottniska vikens område"]
${GULF_OF_BOTHNIA_FAIRWAY_TABLE_SWEDISH}    //ion-text/h4/strong[text() = "Bottniska vikens område"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]
${GULF_OF_BOTHNIA_FAIRWAY_TABLE_HEADING_1_SWEDISH}    //ion-text/h4/strong[text() = "Bottniska vikens område"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Farledskortets namn"]
${GULF_OF_BOTHNIA_FAIRWAY_TABLE_HEADING_2_SWEDISH}    //ion-text/h4/strong[text() = "Bottniska vikens område"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Uppdaterat"]
${FAIRWAY_CARDS_HEADING_ENGLISH}    //ion-text[@class = "fairwayTitle md"]/h2/strong[text() = "Fairway cards"]
${GENERAL_HEADING_ENGLISH}    //ion-item[@slot = "header"]/ion-label[text() = "General"]
${ARCHIPELAGO_SEA_HEADING_ENGLISH}    //ion-text/h4/strong[text() = "Archipelago sea"]
${ARCHIPELAGO_SEA_FAIRWAY_TABLE_ENGLISH}    //ion-text/h4/strong[text() = "Archipelago sea"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]
${ARCHIPELAGO_SEA_FAIRWAY_TABLE_HEADING_1_ENGLISH}    //ion-text/h4/strong[text() = "Archipelago sea"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Fairway card name"]
${ARCHIPELAGO_SEA_FAIRWAY_TABLE_HEADING_2_ENGLISH}    //ion-text/h4/strong[text() = "Archipelago sea"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Modified"]
${GULF_OF_FINLAND_HEADING_ENGLISH}    //ion-text/h4/strong[text() = "Gulf of Finland"]
${GULF_OF_FINLAND_FAIRWAY_TABLE_ENGLISH}    //ion-text/h4/strong[text() = "Gulf of Finland"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]
${GULF_OF_FINLAND_FAIRWAY_TABLE_HEADING_1_ENGLISH}    //ion-text/h4/strong[text() = "Gulf of Finland"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Fairway card name"]
${GULF_OF_FINLAND_FAIRWAY_TABLE_HEADING_2_ENGLISH}    //ion-text/h4/strong[text() = "Gulf of Finland"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Modified"]
${GULF_OF_BOTHNIA_HEADING_ENGLISH}    //ion-text/h4/strong[text() = "Gulf of Bothnia"]
${GULF_OF_BOTHNIA_FAIRWAY_TABLE_ENGLISH}    //ion-text/h4/strong[text() = "Gulf of Bothnia"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]
${GULF_OF_BOTHNIA_FAIRWAY_TABLE_HEADING_1_ENGLISH}    //ion-text/h4/strong[text() = "Gulf of Bothnia"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Fairway card name"]
${GULF_OF_BOTHNIA_FAIRWAY_TABLE_HEADING_2_ENGLISH}    //ion-text/h4/strong[text() = "Gulf of Bothnia"]/ancestor::div[@class = "group"]/ion-grid[@class = "table md"]/ion-row[@class = "header md"]/ion-col[text() = "Modified"]
${BACK_TO_HOME_BUTTON}    //div[@class = "ion-page can-go-back"]/descendant::ion-button[@data-testid = "backToHome"]
${CLOSE_BUTTON}    //div[@class = "ion-page can-go-back"]/descendant::ion-button[contains(@class, "closeButton")]
${SOVELLUSTA_ALUSTETAAN_POP_UP}    //div[contains(@class, "alert")]/h2[contains(@id, "alert") and text() = "Sovellusta alustetaan"]
${FAIRWAY_NAVIGABILITY_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/h4/strong[text() = "Väylän navigoitavuus"]
${NAVIGATION_CONDITIONS_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Navigointiolosuhteet"]
${ICE_CONDITIONS_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Jääolosuhteet"]
${FAIRWAY_NAVIGABILITY_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/h4/strong[text() = "Navigerbarhet"]
${NAVIGATION_CONDITIONS_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Navigationsförhållanden"]
${ICE_CONDITIONS_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Isförhållanden"]
${FAIRWAY_NAVIGABILITY_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/h4/strong[text() = "Fairway navigability"]
${NAVIGATION_CONDITIONS_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Navigation conditions"]
${ICE_CONDITIONS_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Ice conditions"]
${FAIRWAY_DATA_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/h4/strong[text() = "Väylätiedot"]
${CHANNEL_ALIGNMENT_AND_MARKING_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Linjaus ja merkintä"]
${FAIRWAY_DESIGN_SHIP_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Väylän mitoitusalus" or text() = "Väylän mitoitusalukset"]
${FAIRWAY_DIMENSIONS_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Väylän mitoitustiedot"]
${MEETING_AND_OVERTAKING_PROHIBITION_AREAS_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Kohtaamis- ja ohittamiskieltoalueet"]
${SPEED_LIMITS_AND_RECOMMENDATIONS_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Nopeusrajoitukset"]
${FAIRWAY_DATA_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/h4/strong[text() = "Farledsdata"]
${CHANNEL_ALIGNMENT_AND_MARKING_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Farledsdragning och utmärkning"]
${FAIRWAY_DESIGN_SHIP_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Farledens dimensionerande fartyg"]
${FAIRWAY_DIMENSIONS_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Dimensionering"]
${MEETING_AND_OVERTAKING_PROHIBITION_AREAS_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Områden med mötes- och omkörningsförbud"]
${SPEED_LIMITS_AND_RECOMMENDATIONS_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Fartbegränsningar och -rekommendationer"]
${FAIRWAY_DATA_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/h4/strong[text() = "Fairway data"]
${CHANNEL_ALIGNMENT_AND_MARKING_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Channel alignment and marking"]
${FAIRWAY_DESIGN_SHIP_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Fairway design ship"]
${FAIRWAY_DIMENSIONS_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Fairway dimensions"]
${MEETING_AND_OVERTAKING_PROHIBITION_AREAS_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Meeting and overtaking prohibition areas"]
${SPEED_LIMITS_AND_RECOMMENDATIONS_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Speed limits and recommendations"]
${TRAFFIC_SERVICES_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/h4/strong[text() = "Liikennepalvelut"]
${PILOTAGE_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Luotsintilaus"]
${VTS_HEADING_FINNISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "VTS"]
${TRAFFIC_SERVICES_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/h4/strong[text() = "Trafikservice"]
${PILOTAGE_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Lotsbeställning"]
${VTS_HEADING_SWEDISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "VTS"]
${TRAFFIC_SERVICES_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/h4/strong[text() = "Traffic services"]
${PILOTAGE_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "Pilotage"]
${VTS_HEADING_ENGLISH}    //div[@class = "tabContent tab1 active"]/ion-text/p/strong[text() = "VTS"]
${HARBOUR_NAME_HEADING}    //div[@class = "tabContent tab2 active"]/ion-text/h4
${HARBOUR_RESTRICTIONS_HEADING_FINNISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Sataman rajoitukset"]
${QUAYS_HEADING_FINNISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Laiturit"]
${CARGO_HANDLING_HEADING_FINNISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Lastinkäsittely"]
${HARBOUR_BASIN_HEADING_FINNISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Satama-allas"]
${CONTACT_DETAILS_HEADING_FINNISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Yhteystiedot"]
${HARBOUR_RESTRICTIONS_HEADING_SWEDISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Hamnens begränsningar"]
${QUAYS_HEADING_SWEDISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Kajer"]
${CARGO_HANDLING_HEADING_SWEDISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Lasthantering"]
${HARBOUR_BASIN_HEADING_SWEDISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Hamnbassäng"]
${CONTACT_DETAILS_HEADING_SWEDISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Kontaktinformation"]
${HARBOUR_RESTRICTIONS_HEADING_ENGLISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Harbour restrictions"]
${QUAYS_HEADING_ENGLISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Quays"]
${CARGO_HANDLING_HEADING_ENGLISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Cargo handling"]
${HARBOUR_BASIN_HEADING_ENGLISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Harbour basin"]
${CONTACT_DETAILS_HEADING_ENGLISH}    //div[@class = "tabContent tab2 active"]/ion-text/h5[text() = "Contact details"]

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

Check Fairway Card
	Check Fairway Cards Page    FINNISH
	Select Fairway
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
	Change Fairway Card Language To    ${IN_SWEDISH_BUTTON}    ${IN_SWEDISH_BUTTON_DISABLED}    Farledskort
	Check Fairway Cards Page    SWEDISH
	Select Fairway
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
	Change Fairway Card Language To    ${IN_ENGLISH_BUTTON}    ${IN_ENGLISH_BUTTON_DISABLED}    Fairway Cards
	Check Fairway Cards Page    ENGLISH
	Select Fairway
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
	Sleep    2s

Check That Toggle Wide Button Works Correctly For Fairway Harbours Tab
	Element Should Not Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
	Element Should Be Visible    ${EXPAND_WIDE_BUTTON}
	Click Element    ${EXPAND_WIDE_BUTTON}
	Element Should Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
	Capture Page Screenshot
	Click Element    ${REVERT_WIDE_BUTTON}
	Element Should Not Be Visible    ${FAIRWAY_HARBOURS_TAB_CONTENT_WIDE}
	Sleep    2s

Check That Toggle Wide Button Works Correctly For Fairway Areas Tab
	Element Should Not Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
	Element Should Be Visible    ${EXPAND_WIDE_BUTTON}
	Click Element    ${EXPAND_WIDE_BUTTON}
	Element Should Be Visible    ${FAIRWAY_AREAS_TAB_CONTENT_WIDE}
	Capture Page Screenshot
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
	Click Element    ${SIDEBAR_MENU_CONTROL_BUTTON}
	Wait Until Element Is Visible    ${FAIRWAYS_LINK}    30s
	Sleep    2s
	Click Element    ${FAIRWAYS_LINK}
	Sleep    5s
	Capture Page Screenshot
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
	Capture Page Screenshot
	Click Element    ${BACK_TO_HOME_BUTTON}
	Sleep    5s
