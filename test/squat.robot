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
${SQUAT_LASKENTA_HEADER}    //h1/strong[text() = "Painumalaskenta (Squat)"]
${ALUKSEN_TIEDOT_HEADER}    //h2/strong[text() = "Aluksen tiedot"]
${YMPARISTO_HEADER}    //h2/strong[text() = "Ympäristö"]
${LASKENTA_HEADER}    //h2/strong[text() = "Laskenta"]
${ALUKSEN_SQUAT_HEADER}    //h4[text() = "Aluksen painuma nopeuden funktiona"]

#General
${LENGTHBPP_INPUT}    //input[@name = "lengthBPP"]
${BREADTH_INPUT}    //input[@name = "breadth"]
${DRAUGHT_INPUT}    //input[@name = "draught"]
${BLOCKCOEFFICIENT_INPUT}    //input[@name = "blockCoefficient"]
${DISPLACEMENT_INPUT}    //input[@name = "displacement"]

#Weather
${WINDSPEED_INPUT}    //input[@name = "windSpeed"]
${WINDDIRECTION_INPUT}    //input[@name = "windDirection"]
${WAVEHEIGHT_INPUT}    //input[@name = "waveHeight"]
${WAVEPERIOD_INPUT}    //input[@name = "wavePeriod"]

#Detailed
${WINDSURFACE_INPUT}    //input[@name = "windSurface"]
${DECKCARGO_INPUT}    //input[@name = "deckCargo"]
${BOWTHRUSTER_INPUT}    //input[@name = "bowThruster"]
${BOWTHRUSTEREFFICIENCY_INPUT}    //input[@name = "bowThrusterEfficiency"]
${BULKER_RADIO}    //ion-radio[@id="Bulker / Tanker"]
${CONTAINER_RADIO}    //ion-radio[@id="Container"]
${FERRY_RADIO}    //ion-radio[@id="Ferry"]
${LNG_RADIO}    //ion-radio[@id="LNG Tanker"]

#Fairway
${SWEPTDEPTH_INPUT}    //input[@name = "sweptDepth"]
${WATERLEVEL_INPUT}    //input[@name = "waterLevel"]
${WATERDEPTH_INPUT}    //input[@name = "waterDepth"]
${CHANNELWIDTH_INPUT}    //input[@name = "channelWidth"]
${AVOVESI_RADIOBUTTON}    //*[text() = "Avovesi"]/following-sibling::ion-radio
${KANAVA_RADIOBUTTON}    //*[text() = "Kanava"]/following-sibling::ion-radio
${LUISKA_RADIOBUTTON}    //*[text() = "Luiska"]/following-sibling::ion-radio
${SLOPESCALE_INPUT}    //input[@name = "slopeScale"]
${SLOPEHEIGHT_INPUT}    //input[@name = "slopeHeight"]

#Stability
${GM_INPUT}    //input[@name = "GM"]
${KB_INPUT}    //input[@name = "KB"]
${KG_INPUT}    //input[@name = "KG"]

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

#Profile selection view
${BULKER_TANKER_RADIOBUTTON}    //div[contains(text(), "Bulker / Tanker")]/preceding-sibling::div
${CONTAINER_RADIOBUTTON}    //div[contains(text(), "Container")]/preceding-sibling::div
${FERRY_RADIOBUTTON}    //div[contains(text(), "Ferry")]/preceding-sibling::div
${LNG_TANKER_RADIOBUTTON}    //div[contains(text(), "LNG Tanker")]/preceding-sibling::div

#Painuma (Squat) -calculation
${KALLISTUMA_KAANNOS_VALUE}    //ion-label[@title = "Käännöksen aiheuttama kallistuma"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${KALLISTUMA_TUULI_VALUE}    //ion-label[@title = "Tuulen aiheuttama kallistuma"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${ALUKSEN_TODELLINEN_SYVAYS_VALUE}    //ion-label[@title = "Aluksen todellinen syväys"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA_VALUE}    //ion-label[@title = "Aluksen todellinen syväys käännöksessä"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${KOLIVARA_JA_ALUKSEN_LIIKKEET_VALUE}    //ion-label[@title = "Kölivara ja aluksen liikkeet"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${KOLIVARA_SUORALLA_KURSSILLA_VALUE}    //ion-label[@title = "Kölivara suoralla kurssilla"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${KOLIVARA_KAANNOKSESSA_VALUE}    //ion-label[@title = "Kölivara käännöksessä"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${PAINUMA_LUISKA_VALUE}    //ion-label[@title = "Painuma (Squat), Luiska"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text

#Tuulen voima -calculation
${SUHTEELLINEN_TUULEN_SUUNTA_1_VALUE}    //strong[text() = "Tuulen voima"]/ancestor::ion-grid/following-sibling::ion-grid[1]/descendant::ion-label[@title = "Suhteellinen tuulen suunta"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${SUHTEELLINEN_TUULEN_NOPEUS_1_VALUE}    //strong[text() = "Tuulen voima"]/ancestor::ion-grid/following-sibling::ion-grid[1]/descendant::ion-label[@title = "Suhteellinen tuulen nopeus"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${TUULEN_VOIMA_VALUE}    //ion-label[@title = "Tuulen voima"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${AALLOKON_VOIMA_VALUE}    //ion-label[@title = "Aallokon voima"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${KEULAPOTKURIN_SUORITUSKYKY_VALUE}    //ion-label[@title = "Keulapotkurin suorituskyky"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${TURVAMARGINAALI_VALUE}    //ion-label[@title = "Käytettävissä oleva turvamarginaali"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA_VALUE}    //ion-label[@title = "Vähimmäisvaatimus tarvittavalle ulkoiselle työntövoimalle"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text

#Sorto -calculation
${SUHTEELLINEN_TUULEN_SUUNTA_2_VALUE}    //strong[text() = "Tuulen voima"]/ancestor::ion-grid/following-sibling::ion-grid[3]/descendant::ion-label[@title = "Suhteellinen tuulen suunta"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${SUHTEELLINEN_TUULEN_NOPEUS_2_VALUE}    //strong[text() = "Tuulen voima"]/ancestor::ion-grid/following-sibling::ion-grid[3]/descendant::ion-label[@title = "Suhteellinen tuulen nopeus"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${ARVIOITU_SORTOKULMA_VALUE}    //ion-label[@title = "Arvioitu sortokulma"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text
${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN_VALUE}    //ion-label[@title = "Aluksen arvioitu leveys sorto huomioiden"]/parent::ion-item/parent::ion-item/following-sibling::ion-item/ion-text


*** Test Cases ***
Check UI Elements In Finnish Language
	[Documentation]    This test case opens Squat calculation page in Finnish and checks the UI elements in it
	Change Squat Calculator Language To    FI
	Check Labels In Finnish
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

Calculate Squat
	[Documentation]    This test case inputs valid values to Squat calculator and checks the result
	Set Input Values To General Section
	Set Input Values To Weather Section
	Set Input Values To Detailed Section
	Set Input Values To Fairway Section
	Set Input Values To Stability Section
	Set Input Values To Vessel Section
	Set Input Values To Attribute Section
	Get Squat Calculation Values
	Get Tuulen Voima Calculation Values
	Get Sorto Calculation Values


*** Keywords ***
Change Squat Calculator Language To
	[Arguments]    ${language}
	Click Element    ${LANGUAGE_SELECT_BUTTON}
	Wait Until Page Contains Element    ${${language}_RADIO_BUTTON}
	Click Element    ${${language}_RADIO_BUTTON}
	Sleep    2 seconds
	Click Element    ${OK_BUTTON}
	Wait Until Page Contains Element    ${${language}_LANGUAGE_SELECTED_LABEL}
	Page Should Contain Element    ${${language}_LANGUAGE_SELECTED_LABEL}

Check Labels In Finnish
	Element Should Contain    ${SQUAT_LASKENTA_HEADER}    Painumalaskenta (Squat)
	Element Should Contain    ${ALUKSEN_TIEDOT_HEADER}    Aluksen tiedot
	Element Should Contain    ${YMPARISTO_HEADER}    Ympäristö
	Scroll Element Into View    ${LASKENTA_HEADER}
	Element Should Contain    ${LASKENTA_HEADER}    Laskenta
	Scroll Element Into View    ${ALUKSEN_SQUAT_HEADER}
	Element Should Contain    ${ALUKSEN_SQUAT_HEADER}    Aluksen painuma nopeuden funktiona

Check Input Fields In General Section
	Page Should Contain Element    ${LENGTHBPP_INPUT}
	Page Should Contain Element    ${BREADTH_INPUT}
	Page Should Contain Element    ${DRAUGHT_INPUT}
	Page Should Contain Element    ${BLOCKCOEFFICIENT_INPUT}
	Page Should Contain Element    ${DISPLACEMENT_INPUT}

Check Input Fields In Weather Section
	Page Should Contain Element    ${WINDSPEED_INPUT}
	Page Should Contain Element    ${WINDDIRECTION_INPUT}
	Page Should Contain Element    ${WAVEHEIGHT_INPUT}
	Page Should Contain Element    ${WAVEPERIOD_INPUT}

Check Input Fields In Detailed Section
	Page Should Contain Element    ${WINDSURFACE_INPUT}
	Page Should Contain Element    ${WINDSURFACE_INPUT}
	Page Should Contain Element    ${BOWTHRUSTER_INPUT}
	Page Should Contain Element    ${BOWTHRUSTEREFFICIENCY_INPUT}
	Page Should Contain Element    ${BULKER_RADIO}
	Page Should Contain Element    ${CONTAINER_RADIO}
	Page Should Contain Element    ${FERRY_RADIO}
	Page Should Contain Element    ${LNG_RADIO}

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

Set Input Values To General Section
	Input Text    ${LENGTHBPP_INPUT}    212
    Input Text    ${BREADTH_INPUT}    31
    Input Text    ${DRAUGHT_INPUT}    8
    Input Text    ${BLOCKCOEFFICIENT_INPUT}    0.60    clear=True
    Capture Page Screenshot

Set Input Values To Weather Section
	Input Text    ${WINDSPEED_INPUT}    5
    Input Text    ${WINDDIRECTION_INPUT}    45    clear=True
    Input Text    ${WAVEHEIGHT_INPUT}    1.5
    Input Text    ${WAVEPERIOD_INPUT}    5
	Capture Page Screenshot

Set Input Values To Detailed Section
	Scroll Element Into View    ${KG_INPUT}
	Input Text    ${WINDSURFACE_INPUT}    2000
    Input Text    ${DECKCARGO_INPUT}    5000
    Input Text    ${BOWTHRUSTER_INPUT}    1000
    Input Text    ${BOWTHRUSTEREFFICIENCY_INPUT}    95    clear=True
    Click Element    ${FERRY_RADIO}
	Capture Page Screenshot

Set Input Values To Fairway Section
	Input Text    ${SWEPTDEPTH_INPUT}    12.5
    Input Text    ${WATERLEVEL_INPUT}    10
    Input Text    ${WATERDEPTH_INPUT}    23
	Click Element    ${LUISKA_RADIOBUTTON}
	Sleep    2 seconds
	Scroll Element Into View    ${SLOPESCALE_INPUT}
	Input Text    ${CHANNELWIDTH_INPUT}    50    clear=True
	Input Text    ${SLOPESCALE_INPUT}    0.8    clear=True
    Input Text    ${SLOPEHEIGHT_INPUT}    15    clear=True
	Capture Page Screenshot

Set Input Values To Stability Section
	Input Text    ${KG_INPUT}    8
	Input Text    ${GM_INPUT}    2    clear=True
	Scroll Element Into View    ${KB_INPUT}
    Input Text    ${KB_INPUT}    4
    Capture Page Screenshot

Set Input Values To Vessel Section
	Scroll Element Into View    ${TURNING_RADIUS_INPUT}
	Input Text    ${VESSEL_COURSE_INPUT}    10
    Input Text    ${VESSEL_SPEED_INPUT}    17
    Input Text    ${TURNING_RADIUS_INPUT}    1    clear=True
	Capture Page Screenshot

Set Input Values To Attribute Section
	Scroll Element Into View    ${SAFETYMARGINWINDFORCE_INPUT}
	Input Text    ${AIRDENSITY_INPUT}    1.0    clear=True
    Input Text    ${WATERDENSITY_INPUT}    1010    clear=True
    Input Text    ${REQUIREDUKC_INPUT}    0.5    clear=True
    Input Text    ${MOTIONCLEARANCE_INPUT}    2.5    clear=True
    Input Text    ${SAFETYMARGINWINDFORCE_INPUT}    20    clear=True
	Capture Page Screenshot

Get Squat Calculation Values
	${KALLISTUMA_TUULI}=    Get Text    ${KALLISTUMA_TUULI_VALUE}
	${KALLISTUMA_KAANNOS}=    Get Text    ${KALLISTUMA_KAANNOS_VALUE}
	${ALUKSEN_TODELLINEN_SYVAYS}=    Get Text    ${ALUKSEN_TODELLINEN_SYVAYS_VALUE}
	${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA}=    Get Text    ${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA_VALUE}
	${KOLIVARA_JA_ALUKSEN_LIIKKEET}=    Get Text    ${KOLIVARA_JA_ALUKSEN_LIIKKEET_VALUE}
    ${KOLIVARA_SUORALLA_KURSSILLA}=    Get Text    ${KOLIVARA_SUORALLA_KURSSILLA_VALUE}
    ${KOLIVARA_KAANNOKSESSA}=    Get Text    ${KOLIVARA_KAANNOKSESSA_VALUE}
    ${PAINUMA_LUISKA}=    Get Text    ${PAINUMA_LUISKA_VALUE}

Get Tuulen Voima Calculation Values
	${SUHTEELLINEN_TUULEN_SUUNTA_1}=    Get Text    ${SUHTEELLINEN_TUULEN_SUUNTA_1_VALUE}
    ${SUHTEELLINEN_TUULEN_NOPEUS_1}=    Get Text    ${SUHTEELLINEN_TUULEN_NOPEUS_1_VALUE}
    ${TUULEN_VOIMA}=    Get Text    ${TUULEN_VOIMA_VALUE}
    ${AALLOKON_VOIMA}=    Get Text    ${AALLOKON_VOIMA_VALUE}
    ${KEULAPOTKURIN_SUORITUSKYKY}=    Get Text    ${KEULAPOTKURIN_SUORITUSKYKY_VALUE}
    ${TURVAMARGINAALI}=    Get Text    ${TURVAMARGINAALI_VALUE}
    ${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA}=    Get Text    ${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA_VALUE}

Get Sorto Calculation Values
	${SUHTEELLINEN_TUULEN_SUUNTA_2}=    Get Text    ${SUHTEELLINEN_TUULEN_SUUNTA_2_VALUE}
    ${SUHTEELLINEN_TUULEN_NOPEUS_2}=    Get Text    ${SUHTEELLINEN_TUULEN_NOPEUS_2_VALUE}
    ${ARVIOITU_SORTOKULMA}=    Get Text    ${ARVIOITU_SORTOKULMA_VALUE}
    ${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN}=    Get Text    ${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN_VALUE}
