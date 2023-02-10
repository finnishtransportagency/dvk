*** Settings ***
Library    SeleniumLibrary
Test Setup    Open Browser    http://localhost:3000    ${BROWSER}
Test Teardown    Close All Browsers

*** Variables ***
${BROWSER}    headlesschrome

#Language selection locators
${LANGUAGE_SELECT_BUTTON}    //ion-select[@class = "ion-padding md"]
${OK_BUTTON}    //span[text() = "OK"]
${FI_BUTTON}	//ion-button[@id="language_fi"]
${SV_BUTTON}	//ion-button[@id="language_sv"]
${EN_BUTTON}	//ion-button[@id="language_en"]

#Squat-calculator locators in Finnish language
${SQUAT_LASKENTA_HEADER}    //h1/strong[text() = "Painumalaskenta (Squat)"]
${ALUKSEN_TIEDOT_HEADER}    //h2/strong[text() = "Aluksen tiedot"]
${YMPARISTO_HEADER}    //h2/strong[text() = "Ympäristö"]
${LASKENTA_HEADER}    //h2/strong[text() = "Laskenta"]
${ALUKSEN_SQUAT_HEADER}    //h3/strong[text() = "Aluksen painuma nopeuden funktiona"]

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

#Ferry input-values
${LENGTHBPP_INPUT_FERRY}    212
${BREADTH_INPUT_FERRY}    31
${DRAUGHT_INPUT_FERRY}    8
${WINDSPEED_INPUT_FERRY}    5
${WAVEHEIGHT_INPUT_FERRY}    1.5
${WAVEPERIOD_INPUT_FERRY}    5
${WINDSURFACE_INPUT_FERRY}    2000
${DECKCARGO_INPUT_FERRY}    5000
${BOWTHRUSTER_INPUT_FERRY}    1000
${SWEPTDEPTH_INPUT_FERRY}    12.5
${WATERLEVEL_INPUT_FERRY}    10
${WATERDEPTH_INPUT_FERRY}    23
${CHANNELWIDTH_INPUT_FERRY}    200
${SLOPEHEIGHT_INPUT_FERRY}    12
${KG_INPUT_FERRY}    8
${VESSEL_COURSE_INPUT_FERRY}    10
${VESSEL_SPEED_INPUT_FERRY}    17

#Ferry squat-values
${KALLISTUMA_TUULI_FERRY}    0,69
${KALLISTUMA_KAANNOS_FERRY}    0
${ALUKSEN_TODELLINEN_SYVAYS_FERRY}    8,19
${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA_FERRY}    8
${KOLIVARA_JA_ALUKSEN_LIIKKEET_FERRY}    4,41
${KOLIVARA_SUORALLA_KURSSILLA_FERRY}    4,41
${KOLIVARA_KAANNOKSESSA_FERRY}    4,6
${PAINUMA_LUISKA_FERRY}    0
${SUHTEELLINEN_TUULEN_SUUNTA_1_FERRY}    80
${SUHTEELLINEN_TUULEN_NOPEUS_1_FERRY}    5
${TUULEN_VOIMA_FERRY}    3,7
${AALLOKON_VOIMA_FERRY}    41,3
${KEULAPOTKURIN_SUORITUSKYKY_FERRY}    13,4
${TURVAMARGINAALI_FERRY}    −136
${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA_FERRY}    18,2
${SUHTEELLINEN_TUULEN_SUUNTA_2_FERRY}    80
${SUHTEELLINEN_TUULEN_NOPEUS_2_FERRY}    5
${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN_FERRY}    31

*** Test Cases ***
Check UI Elements In Finnish Language
	[Documentation]    This test case opens Squat calculation page in Finnish and checks the UI elements in it
	Change Squat Calculator Language To    SV	# Finnish selected and disabled by default, test it by changing to sv first
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

Calculate Squat For Ferry
	[Documentation]    This test case inputs valid values to Squat calculator for Ferry and checks the result
	Set Input Values To General Section    FERRY
	Set Input Values To Weather Section    FERRY
	Set Input Values To Detailed Section    FERRY
	Set Input Values To Fairway Section    FERRY
	Set Input Values To Stability Section    FERRY
	Set Input Values To Vessel Section    FERRY
	Get Squat Calculation Values
	Get Tuulen Voima Calculation Values
	Get Sorto Calculation Values
	Check The Squat Calculation Values    FERRY

*** Keywords ***
Change Squat Calculator Language To
	[Arguments]    ${language}
	Click Element    ${${language}_BUTTON}

Check Labels In Finnish
	Element Should Contain    ${SQUAT_LASKENTA_HEADER}    Painumalaskenta (Squat)
	Element Should Contain    ${ALUKSEN_TIEDOT_HEADER}    Aluksen tiedot
	Element Should Contain    ${YMPARISTO_HEADER}    Ympäristö
	Scroll Element Into View    ${LASKENTA_HEADER}
	Element Should Contain    ${LASKENTA_HEADER}    Laskenta
	Scroll Element Into View    ${ALUKSEN_SQUAT_HEADER}
	Element Should Contain    ${ALUKSEN_SQUAT_HEADER}    Aluksen painuma nopeuden funktiona

Check Labels In Swedish
	Element Should Contain    ${SQUAT_LASKENTA_HEADER}    Squat beräkning
	Element Should Contain    ${ALUKSEN_TIEDOT_HEADER}    Fartygets basuppgifter
	Element Should Contain    ${YMPARISTO_HEADER}    Omgivning
	Scroll Element Into View    ${LASKENTA_HEADER}
	Element Should Contain    ${LASKENTA_HEADER}    Beräkning
	Scroll Element Into View    ${ALUKSEN_SQUAT_HEADER}
	Element Should Contain    ${ALUKSEN_SQUAT_HEADER}    Fartygets Squat i samband med fart

Check Labels In English
	Element Should Contain    ${ALUKSEN_TIEDOT_HEADER}    Vessel
	Element Should Contain    ${YMPARISTO_HEADER}    Environment
	Scroll Element Into View    ${LASKENTA_HEADER}
	Element Should Contain    ${LASKENTA_HEADER}    Calculations
	Scroll Element Into View    ${ALUKSEN_SQUAT_HEADER}

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
	Page Should Contain Element    ${DECKCARGO_INPUT}
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
	[Arguments]    ${vessel_type}
	Press Keys    ${LENGTHBPP_INPUT}    RETURN
	Press Keys    ${LENGTHBPP_INPUT}    ${LENGTHBPP_INPUT_${vessel_type}}
	Press Keys    ${BREADTH_INPUT}    RETURN
	Press Keys    ${BREADTH_INPUT}    ${BREADTH_INPUT_${vessel_type}}
	Press Keys    ${DRAUGHT_INPUT}    RETURN
	Press Keys    ${DRAUGHT_INPUT}    ${DRAUGHT_INPUT_${vessel_type}}
	Capture Page Screenshot

Set Input Values To Weather Section
	[Arguments]    ${vessel_type}
	Press Keys    ${WINDSPEED_INPUT}    RETURN
	Press Keys    ${WINDSPEED_INPUT}    ${WINDSPEED_INPUT_${vessel_type}}
	Press Keys    ${WAVEHEIGHT_INPUT}    RETURN
	Press Keys    ${WAVEHEIGHT_INPUT}    ${WAVEHEIGHT_INPUT_${vessel_type}}
	Press Keys    ${WAVEPERIOD_INPUT}    RETURN
	Press Keys    ${WAVEPERIOD_INPUT}    ${WAVEPERIOD_INPUT_${vessel_type}}
	Capture Page Screenshot

Set Input Values To Detailed Section
	[Arguments]    ${vessel_type}
	Scroll Element Into View    ${KG_INPUT}
	Press Keys    ${WINDSURFACE_INPUT}    RETURN
	Press Keys    ${WINDSURFACE_INPUT}    ${WINDSURFACE_INPUT_${vessel_type}}
	Press Keys    ${DECKCARGO_INPUT}    RETURN
	Press Keys    ${DECKCARGO_INPUT}    ${DECKCARGO_INPUT_${vessel_type}}
	Press Keys    ${BOWTHRUSTER_INPUT}    RETURN
	Press Keys    ${BOWTHRUSTER_INPUT}    ${BOWTHRUSTER_INPUT_${vessel_type}}
	Click Element    ${${vessel_type}_RADIO}
	Capture Page Screenshot

Set Input Values To Fairway Section
	[Arguments]    ${vessel_type}
	Press Keys    ${SWEPTDEPTH_INPUT}    RETURN
	Press Keys    ${SWEPTDEPTH_INPUT}    ${SWEPTDEPTH_INPUT_${vessel_type}}
	Press Keys    ${WATERLEVEL_INPUT}    RETURN
	Press Keys    ${WATERLEVEL_INPUT}    ${WATERLEVEL_INPUT_${vessel_type}}
	Press Keys    ${WATERDEPTH_INPUT}    RETURN
	Press Keys    ${WATERDEPTH_INPUT}    ${WATERDEPTH_INPUT_${vessel_type}}
	Click Element    ${LUISKA_RADIOBUTTON}
	Sleep    2 seconds
	Scroll Element Into View    ${SLOPESCALE_INPUT}
	Press Keys    ${CHANNELWIDTH_INPUT}    RETURN
	Press Keys    ${CHANNELWIDTH_INPUT}    ${CHANNELWIDTH_INPUT_${vessel_type}}
	Press Keys    ${SLOPEHEIGHT_INPUT}    RETURN
	Press Keys    ${SLOPEHEIGHT_INPUT}    ${SLOPEHEIGHT_INPUT_${vessel_type}}
	Capture Page Screenshot

Set Input Values To Stability Section
	[Arguments]    ${vessel_type}
	Press Keys    ${KG_INPUT}    RETURN
	Press Keys    ${KG_INPUT}    ${KG_INPUT_${vessel_type}}
	Capture Page Screenshot

Set Input Values To Vessel Section
	[Arguments]    ${vessel_type}
	Scroll Element Into View    ${TURNING_RADIUS_INPUT}
	Press Keys    ${VESSEL_COURSE_INPUT}    RETURN
	Press Keys    ${VESSEL_COURSE_INPUT}    ${VESSEL_COURSE_INPUT_${vessel_type}}
	Press Keys    ${VESSEL_SPEED_INPUT}    RETURN
	Press Keys    ${VESSEL_SPEED_INPUT}    ${VESSEL_SPEED_INPUT_${vessel_type}}
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
	Set Test Variable    ${KALLISTUMA_TUULI}
	Set Test Variable    ${KALLISTUMA_KAANNOS}
	Set Test Variable    ${ALUKSEN_TODELLINEN_SYVAYS}
	Set Test Variable    ${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA}
	Set Test Variable    ${KOLIVARA_JA_ALUKSEN_LIIKKEET}
	Set Test Variable    ${KOLIVARA_SUORALLA_KURSSILLA}
	Set Test Variable    ${KOLIVARA_KAANNOKSESSA}
	Set Test Variable    ${PAINUMA_LUISKA}

Get Tuulen Voima Calculation Values
	${SUHTEELLINEN_TUULEN_SUUNTA_1}=    Get Text    ${SUHTEELLINEN_TUULEN_SUUNTA_1_VALUE}
	${SUHTEELLINEN_TUULEN_NOPEUS_1}=    Get Text    ${SUHTEELLINEN_TUULEN_NOPEUS_1_VALUE}
	${TUULEN_VOIMA}=    Get Text    ${TUULEN_VOIMA_VALUE}
	${AALLOKON_VOIMA}=    Get Text    ${AALLOKON_VOIMA_VALUE}
	${KEULAPOTKURIN_SUORITUSKYKY}=    Get Text    ${KEULAPOTKURIN_SUORITUSKYKY_VALUE}
	${TURVAMARGINAALI}=    Get Text    ${TURVAMARGINAALI_VALUE}
	${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA}=    Get Text    ${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA_VALUE}
	Set Test Variable    ${SUHTEELLINEN_TUULEN_SUUNTA_1}
	Set Test Variable    ${SUHTEELLINEN_TUULEN_NOPEUS_1}
	Set Test Variable    ${TUULEN_VOIMA}
	Set Test Variable    ${AALLOKON_VOIMA}
	Set Test Variable    ${KEULAPOTKURIN_SUORITUSKYKY}
	Set Test Variable    ${TURVAMARGINAALI}
	Set Test Variable    ${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA}

Get Sorto Calculation Values
	${SUHTEELLINEN_TUULEN_SUUNTA_2}=    Get Text    ${SUHTEELLINEN_TUULEN_SUUNTA_2_VALUE}
	${SUHTEELLINEN_TUULEN_NOPEUS_2}=    Get Text    ${SUHTEELLINEN_TUULEN_NOPEUS_2_VALUE}
	${ARVIOITU_SORTOKULMA}=    Get Text    ${ARVIOITU_SORTOKULMA_VALUE}
	${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN}=    Get Text    ${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN_VALUE}
	Set Test Variable    ${SUHTEELLINEN_TUULEN_SUUNTA_2}
	Set Test Variable    ${SUHTEELLINEN_TUULEN_NOPEUS_2}
	Set Test Variable    ${ARVIOITU_SORTOKULMA}
	Set Test Variable    ${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN}

Check The Squat Calculation Values
	[Arguments]    ${vessel_type}
	Should Be Equal    ${KALLISTUMA_TUULI}    ${KALLISTUMA_TUULI_${vessel_type}}
	Should Be Equal    ${KALLISTUMA_KAANNOS}    ${KALLISTUMA_KAANNOS_${vessel_type}}
	Should Be Equal    ${ALUKSEN_TODELLINEN_SYVAYS}    ${ALUKSEN_TODELLINEN_SYVAYS_${vessel_type}}
	Should Be Equal    ${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA}    ${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA_${vessel_type}}
	Should Be Equal    ${KOLIVARA_JA_ALUKSEN_LIIKKEET}    ${KOLIVARA_JA_ALUKSEN_LIIKKEET_${vessel_type}}
	Should Be Equal    ${KOLIVARA_SUORALLA_KURSSILLA}    ${KOLIVARA_SUORALLA_KURSSILLA_${vessel_type}}
	Should Be Equal    ${KOLIVARA_KAANNOKSESSA}    ${KOLIVARA_KAANNOKSESSA_${vessel_type}}
	Should Be Equal    ${PAINUMA_LUISKA}    ${PAINUMA_LUISKA_${vessel_type}}
	Should Be Equal    ${SUHTEELLINEN_TUULEN_SUUNTA_1}    ${SUHTEELLINEN_TUULEN_SUUNTA_1_${vessel_type}}
	Should Be Equal    ${SUHTEELLINEN_TUULEN_NOPEUS_1}    ${SUHTEELLINEN_TUULEN_NOPEUS_1_${vessel_type}}
	Should Be Equal    ${TUULEN_VOIMA}    ${TUULEN_VOIMA_${vessel_type}}
	Should Be Equal    ${AALLOKON_VOIMA}    ${AALLOKON_VOIMA_${vessel_type}}
	Should Be Equal    ${KEULAPOTKURIN_SUORITUSKYKY}    ${KEULAPOTKURIN_SUORITUSKYKY_${vessel_type}}
	Should Be Equal    ${TURVAMARGINAALI}    ${TURVAMARGINAALI_${vessel_type}}
	Should Be Equal    ${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA}    ${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA_${vessel_type}}
	Should Be Equal    ${SUHTEELLINEN_TUULEN_SUUNTA_2}    ${SUHTEELLINEN_TUULEN_SUUNTA_2_${vessel_type}}
	Should Be Equal    ${SUHTEELLINEN_TUULEN_NOPEUS_2}    ${SUHTEELLINEN_TUULEN_NOPEUS_2_${vessel_type}}
	Should Be Equal    ${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN}    ${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN_${vessel_type}}
