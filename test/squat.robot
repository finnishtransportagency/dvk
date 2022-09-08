*** Settings ***
Library    SeleniumLibrary
Test Setup    Open Browser    http://localhost:3000    ${BROWSER}
Test Teardown    Close All Browsers

*** Variables ***
${BROWSER}    headlesschrome

#Language selection locators
${LANGUAGE_SELECT_BUTTON}    //ion-select[@class = "ion-padding md"]
${OK_BUTTON}    //span[text() = "OK"]
${FI_RADIO_BUTTON}    //div[text() = "fi"]/preceding-sibling::div
${SV_RADIO_BUTTON}    //div[text() = "sv"]/preceding-sibling::div
${EN_RADIO_BUTTON}    //div[text() = "en"]/preceding-sibling::div
${FI_LANGUAGE_SELECTED_LABEL}    //ion-select[@value = "fi"]
${SV_LANGUAGE_SELECTED_LABEL}    //ion-select[@value = "sv"]
${EN_LANGUAGE_SELECTED_LABEL}    //ion-select[@value = "en"]

#Squat-calculator locators in Finnish language
${SQUAT_LASKENTA_HEADER}    //h1/strong[text() = "Squat-laskenta"]
${ALUKSEN_TIEDOT_HEADER}    //h2/strong[text() = "Aluksen tiedot"]
${YMPARISTO_HEADER}    //h2/strong[text() = "Ympäristö"]
${LASKENTA_HEADER}    //h2/strong[text() = "Laskenta"]
${ALUKSEN_SQUAT_HEADER}    //h4[text() = "Aluksen squat nopeuden funktiona"]

#General
${LENGTHBPP_INPUT}    //input[@name = "lengthBPP"]
${BREADTH_INPUT}    //input[@name = "breadth"]
${DRAUGHT_INPUT}    //input[@name = "draught"]
${BLOCKCOEFFICIENT_INPUT}    //input[@name = "blockCoefficient"]
${DISPLACEMENT_INPUT}    //input[@name = "displacement"]

#Weather
${WINDSPEED_INPUT}    //input[@name = "windSpeed"]
${WINDDIRECTION_INPUT}    //input[@name = "windDirection"]
${AALLONKORKEUS_INPUT}    //input[@name = "waveHeight"]
${WAVEPERIOD_INPUT}    //input[@name = "wavePeriod"]

#Detailed
${WINDSURFACE_INPUT}    //input[@name = "windSurface"]
${DECKCARGO_INPUT}    //input[@name = "deckCargo"]
${BOWTHRUSTER_INPUT}    //input[@name = "bowThruster"]
${BOWTHRUSTEREFFICIENCY_INPUT}    //input[@name = "bowThrusterEfficiency"]
${PROFILESELECTED_INPUT}    //input[@name = "profileSelected"]

#Fairway
${SWEPTDEPTH_INPUT}    //input[@name = "sweptDepth"]
${WATERLEVEL_INPUT}    //input[@name = "waterLevel"]
${WATERDEPTH_INPUT}    //input[@name = "waterDepth"]

#Stability
${KG_INPUT}    //input[@name = "KG"]
${GM_INPUT}    //input[@name = "GM"]
${KB_INPUT}    //input[@name = "KB"]

#Vessel
${VESSEL_COURSE_INPUT}    //input[@name = "vesselCourse"]
${VESSEL_SPEED_INPUT}    //input[@name = "vesselSpeed"]
${TURNING_RADIUS_INPUT}    //input[@name = "turningRadius"]

#Attribute
${AIRDENSITY_INPUT}    //input[@name = "airDensity"]
${WATERDENSITY_INPUT}    //input[@name = "waterDensity"]
${REQUIREDUKC_INPUT}    //input[@name = "requiredUKC"]
${MOTIONCLEARANCE_INPUT}    //input[@name = "motionClearance"]
${SAFETYMARGINWINDFORCE_INPUT}    //input[@name = "safetyMarginWindForce"]


*** Test Cases ***
Check UI Elements In Finnish Language
	[Documentation]    This test case opens Squat calculation page in Finnish and checks the UI elements in it
	Change Squat Calculator Language To    FI
	Open Squat Calculator And Check Labels In Finnish
	Check Input Fields In General Section
	Check Input Fields In Weather Section
	Check Input Fields In Detailed Section
	Check Input Fields In Fairway Section
	Check Input Fields In Stability Section
	Check Input Fields In Vessel Section
	Check Input Fields Attribute Section

Check UI Elements In Swedish Language
	[Documentation]    This test case opens Squat calculation page in Swedish and checks the UI elements in it
	Change Squat Calculator Language To    SV
	Check Input Fields In General Section
	Check Input Fields In Weather Section
	Check Input Fields In Detailed Section
	Check Input Fields In Fairway Section
	Check Input Fields In Stability Section
	Check Input Fields In Vessel Section
	Check Input Fields Attribute Section

Check UI Elements In English Language
	[Documentation]    This test case opens Squat calculation page in English and checks the UI elements in it
	Change Squat Calculator Language To    EN
	Check Input Fields In General Section
	Check Input Fields In Weather Section
	Check Input Fields In Detailed Section
	Check Input Fields In Fairway Section
	Check Input Fields In Stability Section
	Check Input Fields In Vessel Section
	Check Input Fields Attribute Section

*** Keywords ***
Check Squat Calculator Labels
	Element Should Contain    ${SQUAT_LASKENTA_HEADER}    Squat-laskenta
	Element Should Contain    ${ALUKSEN_TIEDOT_HEADER}    Aluksen tiedot
	Element Should Contain    ${YMPARISTO_HEADER}    Ympäristö
	Scroll Element Into View    ${LASKENTA_HEADER}
	Element Should Contain    ${LASKENTA_HEADER}    Laskenta
	Scroll Element Into View    ${ALUKSEN_SQUAT_HEADER}
	Element Should Contain    ${ALUKSEN_SQUAT_HEADER}    Aluksen squat nopeuden funktiona

Change Squat Calculator Language To
	[Arguments]    ${language}
	Click Element    ${LANGUAGE_SELECT_BUTTON}
	Wait Until Page Contains Element    ${${language}_RADIO_BUTTON}
	Click Element    ${${language}_RADIO_BUTTON}
	Sleep    2 seconds
	Click Element    ${OK_BUTTON}
	Wait Until Page Contains Element    ${${language}_LANGUAGE_SELECTED_LABEL}
	Page Should Contain Element    ${${language}_LANGUAGE_SELECTED_LABEL}

Open Squat Calculator And Check Labels In Finnish
	Element Should Contain    ${SQUAT_LASKENTA_HEADER}    Squat-laskenta
	Element Should Contain    ${ALUKSEN_TIEDOT_HEADER}    Aluksen tiedot
	Element Should Contain    ${YMPARISTO_HEADER}    Ympäristö
	Scroll Element Into View    ${LASKENTA_HEADER}
	Element Should Contain    ${LASKENTA_HEADER}    Laskenta
	Scroll Element Into View    ${ALUKSEN_SQUAT_HEADER}
	Element Should Contain    ${ALUKSEN_SQUAT_HEADER}    Aluksen squat nopeuden funktiona

Check Input Fields In General Section
	Page Should Contain Element    ${LENGTHBPP_INPUT}
	Page Should Contain Element    ${BREADTH_INPUT}
	Page Should Contain Element    ${DRAUGHT_INPUT}
	Page Should Contain Element    ${BLOCKCOEFFICIENT_INPUT}
	Page Should Contain Element    ${DISPLACEMENT_INPUT}

Check Input Fields In Weather Section
	Page Should Contain Element    ${WINDSPEED_INPUT}
	Page Should Contain Element    ${WINDDIRECTION_INPUT}
	Page Should Contain Element    ${AALLONKORKEUS_INPUT}
	Page Should Contain Element    ${WAVEPERIOD_INPUT}

Check Input Fields In Detailed Section
	Page Should Contain Element    ${WINDSURFACE_INPUT}
	Page Should Contain Element    ${WINDSURFACE_INPUT}
	Page Should Contain Element    ${BOWTHRUSTER_INPUT}
	Page Should Contain Element    ${BOWTHRUSTEREFFICIENCY_INPUT}
	Page Should Contain Element    ${PROFILESELECTED_INPUT}

Check Input Fields In Fairway Section
	Page Should Contain Element    ${SWEPTDEPTH_INPUT}
    Page Should Contain Element    ${WATERLEVEL_INPUT}
    Page Should Contain Element    ${WATERDEPTH_INPUT}

Check Input Fields In Stability Section
	Page Should Contain Element    ${KG_INPUT}
    Page Should Contain Element    ${GM_INPUT}
    Page Should Contain Element    ${KB_INPUT}

Check Input Fields In Vessel Section
	Page Should Contain Element    ${VESSEL_COURSE_INPUT}
    Page Should Contain Element    ${VESSEL_SPEED_INPUT}
    Page Should Contain Element    ${TURNING_RADIUS_INPUT}

Check Input Fields Attribute Section
	Page Should Contain Element    ${AIRDENSITY_INPUT}
	Page Should Contain Element    ${WATERDENSITY_INPUT}
	Page Should Contain Element    ${REQUIREDUKC_INPUT}
	Page Should Contain Element    ${MOTIONCLEARANCE_INPUT}
	Page Should Contain Element    ${SAFETYMARGINWINDFORCE_INPUT}
