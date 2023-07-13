*** Settings ***
Documentation    This test suite contains tests for Squat calculator
Library    SeleniumLibrary
Resource    resources_squat.resource
Test Setup    Open Squat
Test Teardown    Close All Browsers

*** Variables ***
${BROWSER}    headlesschrome
${PORT}    3000

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
${KALLISTUMA_TUULI_FERRY}    0,36
${KALLISTUMA_KAANNOS_FERRY}    8,64
${ALUKSEN_TODELLINEN_SYVAYS_FERRY}    8,1
${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA_FERRY}    10,24
${KOLIVARA_JA_ALUKSEN_LIIKKEET_FERRY_SLOPED}    2,13
${KOLIVARA_SUORALLA_KURSSILLA_FERRY_SLOPED}    2,13
${KOLIVARA_KAANNOKSESSA_FERRY_SLOPED}    −2,25
${PAINUMA_FERRY_SLOPED}    2,37
${SUHTEELLINEN_TUULEN_SUUNTA_1_FERRY}    27
${SUHTEELLINEN_TUULEN_NOPEUS_1_FERRY}    11
${TUULEN_VOIMA_FERRY}    1,7
${AALLOKON_VOIMA_FERRY}    19,1
${KEULAPOTKURIN_SUORITUSKYKY_FERRY}    13,4
${TURVAMARGINAALI_FERRY}    44,4
${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA_FERRY}    -
${SUHTEELLINEN_TUULEN_SUUNTA_2_FERRY}    27
${SUHTEELLINEN_TUULEN_NOPEUS_2_FERRY}    11
${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN_FERRY}    31,33
${ARVIOITU_SORTOKULMA_FERRY}    0,09

#LNG input-values
${LENGTHBPP_INPUT_LNG}    170
${BREADTH_INPUT_LNG}    29.5
${DRAUGHT_INPUT_LNG}    8
${WINDSPEED_INPUT_LNG}    8
${WAVEHEIGHT_INPUT_LNG}    2
${WAVEPERIOD_INPUT_LNG}    4
${WINDSURFACE_INPUT_LNG}    2500
${DECKCARGO_INPUT_LNG}    5000
${BOWTHRUSTER_INPUT_LNG}    1500
${SWEPTDEPTH_INPUT_LNG}    12.5
${WATERLEVEL_INPUT_LNG}    10
${WATERDEPTH_INPUT_LNG}    23
${CHANNELWIDTH_INPUT_LNG}    200
${SLOPEHEIGHT_INPUT_LNG}    12
${KG_INPUT_LNG}    8
${VESSEL_COURSE_INPUT_LNG}    10
${VESSEL_SPEED_INPUT_LNG}    16

#LNG squat-values
${KALLISTUMA_TUULI_LNG}    1,27
${KALLISTUMA_KAANNOS_LNG}    7,64
${ALUKSEN_TODELLINEN_SYVAYS_LNG}    8,33
${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA_LNG}    9,89
${KOLIVARA_JA_ALUKSEN_LIIKKEET_LNG_SLOPED}    2,01
${KOLIVARA_SUORALLA_KURSSILLA_LNG_SLOPED}    2,01
${KOLIVARA_KAANNOKSESSA_LNG_SLOPED}    −1,45
${PAINUMA_LNG_SLOPED}    2,26
${SUHTEELLINEN_TUULEN_SUUNTA_1_LNG}    39
${SUHTEELLINEN_TUULEN_NOPEUS_1_LNG}    12
${TUULEN_VOIMA_LNG}    7,7
${AALLOKON_VOIMA_LNG}    37,9
${KEULAPOTKURIN_SUORITUSKYKY_LNG}    20,1
${TURVAMARGINAALI_LNG}    −26,6
${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA_LNG}    5,3
${SUHTEELLINEN_TUULEN_SUUNTA_2_LNG}    39
${SUHTEELLINEN_TUULEN_NOPEUS_2_LNG}    12
${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN_LNG}    29,82
${ARVIOITU_SORTOKULMA_LNG}    0,11

#Container input-values
${LENGTHBPP_INPUT_CONTAINER}    200
${BREADTH_INPUT_CONTAINER}    35.20
${DRAUGHT_INPUT_CONTAINER}    11.02
${WINDSPEED_INPUT_CONTAINER}    2
${WAVEHEIGHT_INPUT_CONTAINER}    0.5
${WAVEPERIOD_INPUT_CONTAINER}    2
${WINDSURFACE_INPUT_CONTAINER}    2700
${DECKCARGO_INPUT_CONTAINER}    10000
${BOWTHRUSTER_INPUT_CONTAINER}    1200
${SWEPTDEPTH_INPUT_CONTAINER}    12.5
${WATERLEVEL_INPUT_CONTAINER}    10
${WATERDEPTH_INPUT_CONTAINER}    23
${CHANNELWIDTH_INPUT_CONTAINER}    200
${SLOPEHEIGHT_INPUT_CONTAINER}    12
${KG_INPUT_CONTAINER}    10
${VESSEL_COURSE_INPUT_CONTAINER}    10
${VESSEL_SPEED_INPUT_CONTAINER}    10

#Container squat-values
${KALLISTUMA_TUULI_CONTAINER}    0,06
${KALLISTUMA_KAANNOS_CONTAINER}    3,34
${ALUKSEN_TODELLINEN_SYVAYS_CONTAINER}    11,04
${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA_CONTAINER}    12,03
${KOLIVARA_JA_ALUKSEN_LIIKKEET_CONTAINER_SLOPED}    0,52
${KOLIVARA_SUORALLA_KURSSILLA_CONTAINER_SLOPED}    0,52
${KOLIVARA_KAANNOKSESSA_CONTAINER_SLOPED}    −1,47
${PAINUMA_CONTAINER_SLOPED}    1,04
${SUHTEELLINEN_TUULEN_SUUNTA_1_CONTAINER}    20
${SUHTEELLINEN_TUULEN_NOPEUS_1_CONTAINER}    6
${TUULEN_VOIMA_CONTAINER}    0,3
${AALLOKON_VOIMA_CONTAINER}    1,5
${KEULAPOTKURIN_SUORITUSKYKY_CONTAINER}    16,1
${TURVAMARGINAALI_CONTAINER}    189,1
${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA_CONTAINER}    -
${SUHTEELLINEN_TUULEN_SUUNTA_2_CONTAINER}    20
${SUHTEELLINEN_TUULEN_NOPEUS_2_CONTAINER}    6
${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN_CONTAINER}    35,37
${ARVIOITU_SORTOKULMA_CONTAINER}    0,05

#Bulker input-values
${LENGTHBPP_INPUT_BULKER}    189.90
${BREADTH_INPUT_BULKER}    32.26
${DRAUGHT_INPUT_BULKER}    12.04
${WINDSPEED_INPUT_BULKER}    5
${WAVEHEIGHT_INPUT_BULKER}    1
${WAVEPERIOD_INPUT_BULKER}    10
${WINDSURFACE_INPUT_BULKER}    2500
${DECKCARGO_INPUT_BULKER}    8000
${BOWTHRUSTER_INPUT_BULKER}    1000
${SWEPTDEPTH_INPUT_BULKER}    12.5
${WATERLEVEL_INPUT_BULKER}    10
${WATERDEPTH_INPUT_BULKER}    23
${CHANNELWIDTH_INPUT_BULKER}    200
${SLOPEHEIGHT_INPUT_BULKER}    12
${KG_INPUT_BULKER}    8
${VESSEL_COURSE_INPUT_BULKER}    10
${VESSEL_SPEED_INPUT_BULKER}    12

#Bulker squat-values
${KALLISTUMA_TUULI_BULKER}    0,54
${KALLISTUMA_KAANNOS_BULKER}    2,12
${ALUKSEN_TODELLINEN_SYVAYS_BULKER}    12,19
${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA_BULKER}    12,63
${KOLIVARA_JA_ALUKSEN_LIIKKEET_BULKER_SLOPED}    −1,27
${KOLIVARA_SUORALLA_KURSSILLA_BULKER_SLOPED}    −1,27
${KOLIVARA_KAANNOKSESSA_BULKER_SLOPED}    −2,3
${PAINUMA_BULKER_SLOPED}    1,68
${KOLIVARA_JA_ALUKSEN_LIIKKEET_BULKER_CHANNEL}    −1,58
${KOLIVARA_SUORALLA_KURSSILLA_BULKER_CHANNEL}    −1,58
${KOLIVARA_KAANNOKSESSA_BULKER_CHANNEL}    −2,61
${PAINUMA_BULKER_CHANNEL}    1,99
${KOLIVARA_JA_ALUKSEN_LIIKKEET_BULKER_OPEN}    −0,96
${KOLIVARA_SUORALLA_KURSSILLA_BULKER_OPEN}    −0,96
${KOLIVARA_KAANNOKSESSA_BULKER_OPEN}    −1,98
${PAINUMA_BULKER_OPEN}    1,37
${SUHTEELLINEN_TUULEN_SUUNTA_1_BULKER}    35
${SUHTEELLINEN_TUULEN_NOPEUS_1_BULKER}    9
${TUULEN_VOIMA_BULKER}    2,7
${AALLOKON_VOIMA_BULKER}    9,6
${KEULAPOTKURIN_SUORITUSKYKY_BULKER}    13,4
${TURVAMARGINAALI_BULKER}    108,4
${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA_BULKER}    -
${SUHTEELLINEN_TUULEN_SUUNTA_2_BULKER}    35
${SUHTEELLINEN_TUULEN_NOPEUS_2_BULKER}    9
${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN_BULKER}    32,32
${ARVIOITU_SORTOKULMA_BULKER}    0,02

#Squat-calculation Finnish header texts
${SQUAT_CALCULATION_HEADER_TEXT_FI}    Painumalaskenta (Squat)
${VESSEL_HEADER_TEXT_FI}    Aluksen tiedot
${ENVIRONMENT_HEADER_TEXT_FI}    Ympäristö
${CALCULATIONS_HEADER_TEXT_FI}    Laskenta
${SQUAT_GRAPH_HEADER_TEXT_FI}    Aluksen painuma nopeuden funktiona

#Squat-calculation Swedish header texts
${SQUAT_CALCULATION_HEADER_TEXT_SV}    Squat beräkning
${VESSEL_HEADER_TEXT_SV}    Fartygets basuppgifter
${ENVIRONMENT_HEADER_TEXT_SV}    Omgivning
${CALCULATIONS_HEADER_TEXT_SV}    Beräkning
${SQUAT_GRAPH_HEADER_TEXT_SV}    Fartygets Squat i samband med fart

#Squat-calculation English header texts
${SQUAT_CALCULATION_HEADER_TEXT_EN}    Squat Calculation
${VESSEL_HEADER_TEXT_EN}    Vessel
${ENVIRONMENT_HEADER_TEXT_EN}    Environment
${CALCULATIONS_HEADER_TEXT_EN}    Calculations
${SQUAT_GRAPH_HEADER_TEXT_EN}    Squat as a Function of Speed

*** Test Cases ***
Check UI Elements In Finnish Language
	[Documentation]    This test case opens Squat calculation page in Finnish and checks the UI elements in it
	Change Squat Calculator Language To    FI
	Check Headers    FI
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
	Check Headers    SV
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
	Check Headers    EN
	Check Input Fields In General Section
	Check Input Fields In Weather Section
	Check Input Fields In Detailed Section
	Check Input Fields In Fairway Section
	Check Input Fields In Stability Section
	Check Input Fields In Vessel Section
	Check Input Fields Attribute Section

Calculate Squat And Verify Results
	[Documentation]    This test case inputs valid values to Squat calculator for different vessel and fairway types and verify the result
	[Template]    Calculate Squat
	[Setup]    None
	[Teardown]    None
	FERRY    SLOPED
	LNG    SLOPED
	CONTAINER    SLOPED
	BULKER    SLOPED
	BULKER    CHANNEL
	BULKER    OPEN

*** Keywords ***

Open Squat
  [Documentation]    This keyword opens Squat in localhost with port and browser given as variables
  Wait Until Keyword Succeeds    3x    2s    Open Browser    http://localhost:${PORT}    ${BROWSER}

Calculate Squat
  [Arguments]    ${vessel_type}    ${fairway_type}
	[Documentation]    This keyword inputs valid values to Squat calculator and checks the result
	[Teardown]    Close All Browsers
  Open Browser    http://localhost:${PORT}    ${BROWSER}
	Set Input Values To General Section    ${vessel_type}
	Set Input Values To Weather Section    ${vessel_type}
	Set Input Values To Detailed Section    ${vessel_type}
	Set Input Values To Fairway Section    ${vessel_type}    ${fairway_type}
	Set Input Values To Stability Section    ${vessel_type}
	Set Input Values To Vessel Section    ${vessel_type}
	Get Squat Calculation Values    ${fairway_type}
	Get Tuulen Voima Calculation Values
	Get Sorto Calculation Values
	Check The Calculation Values    ${vessel_type}    ${fairway_type}

Change Squat Calculator Language To
	[Arguments]    ${language}
	[Documentation]    This keyword changes language in Squat calculator to language given in keyword arguments
	${count}=    Get WebElements    ${${language}_BUTTON_NOT_SELECTED}
	${language_not_selected}=    Get Length    ${count}
	IF    ${language_not_selected} == 0    RETURN
	Click Element    ${${language}_BUTTON}

Check Headers
	[Arguments]    ${language}
	[Documentation]    This keyword checks headers in language given in keyword arguments
	Element Should Contain    ${SQUAT_CALCULATION_HEADER_${language}}    ${SQUAT_CALCULATION_HEADER_TEXT_${language}}
	Element Should Contain    ${VESSEL_HEADER_${language}}    ${VESSEL_HEADER_TEXT_${language}}
	Element Should Contain    ${ENVIRONMENT_HEADER_${language}}    ${ENVIRONMENT_HEADER_TEXT_${language}}
	Scroll Element Into View    ${CALCULATIONS_HEADER_${language}}
	Element Should Contain    ${CALCULATIONS_HEADER_${language}}    ${CALCULATIONS_HEADER_TEXT_${language}}
	Scroll Element Into View    ${SQUAT_GRAPH_HEADER}
	Element Should Contain    ${SQUAT_GRAPH_HEADER}    ${SQUAT_GRAPH_HEADER_TEXT_${language}}

Check Input Fields In General Section
	[Documentation]    This keyword checks input fields in General section in Squat calculator
	Page Should Contain Element    ${LENGTHBPP_INPUT}
	Page Should Contain Element    ${BREADTH_INPUT}
	Page Should Contain Element    ${DRAUGHT_INPUT}
	Page Should Contain Element    ${BLOCKCOEFFICIENT_INPUT}
	Page Should Contain Element    ${DISPLACEMENT_INPUT}

Check Input Fields In Weather Section
	[Documentation]    This keyword checks input fields in Weather section in Squat calculator
	Page Should Contain Element    ${WINDSPEED_INPUT}
	Page Should Contain Element    ${WINDDIRECTION_INPUT}
	Page Should Contain Element    ${WAVEHEIGHT_INPUT}
	Page Should Contain Element    ${WAVEPERIOD_INPUT}

Check Input Fields In Detailed Section
	[Documentation]    This keyword checks input fields in Detailed section in Squat calculator
	Page Should Contain Element    ${WINDSURFACE_INPUT}
	Page Should Contain Element    ${DECKCARGO_INPUT}
	Page Should Contain Element    ${BOWTHRUSTER_INPUT}
	Page Should Contain Element    ${BOWTHRUSTEREFFICIENCY_INPUT}
	Page Should Contain Element    ${BULKER_RADIO}
	Page Should Contain Element    ${CONTAINER_RADIO}
	Page Should Contain Element    ${FERRY_RADIO}
	Page Should Contain Element    ${LNG_RADIO}

Check Input Fields In Fairway Section
	[Documentation]    This keyword checks input fields in Fairway section in Squat calculator
	Page Should Contain Element    ${SWEPTDEPTH_INPUT}
	Page Should Contain Element    ${WATERLEVEL_INPUT}
	Page Should Contain Element    ${WATERDEPTH_INPUT}

Check Input Fields In Stability Section
	[Documentation]    This keyword checks input fields in Stability section in Squat calculator
	Page Should Contain Element    ${KG_INPUT}
	Page Should Contain Element    ${GM_INPUT}
	Page Should Contain Element    ${KB_INPUT}

Check Input Fields In Vessel Section
	[Documentation]    This keyword checks input fields in Vessel section in Squat calculator
	Page Should Contain Element    ${VESSEL_COURSE_INPUT}
	Page Should Contain Element    ${VESSEL_SPEED_INPUT}
	Page Should Contain Element    ${TURNING_RADIUS_INPUT}

Check Input Fields Attribute Section
	[Documentation]    This keyword checks input fields in Attribute section in Squat calculator
	Page Should Contain Element    ${AIRDENSITY_INPUT}
	Page Should Contain Element    ${WATERDENSITY_INPUT}
	Page Should Contain Element    ${REQUIREDUKC_INPUT}
	Page Should Contain Element    ${MOTIONCLEARANCE_INPUT}
	Page Should Contain Element    ${SAFETYMARGINWINDFORCE_INPUT}

Set Input Values To General Section
	[Arguments]    ${vessel_type}
	[Documentation]    This keyword sets input values in General section in Squat calculator for vessel type given in keyword arguments
	Press Keys    ${LENGTHBPP_INPUT}    RETURN
	Press Keys    ${LENGTHBPP_INPUT}    ${LENGTHBPP_INPUT_${vessel_type}}
	Press Keys    ${BREADTH_INPUT}    RETURN
	Press Keys    ${BREADTH_INPUT}    ${BREADTH_INPUT_${vessel_type}}
	Press Keys    ${DRAUGHT_INPUT}    RETURN
	Press Keys    ${DRAUGHT_INPUT}    ${DRAUGHT_INPUT_${vessel_type}}
	Capture Page Screenshot

Set Input Values To Weather Section
	[Arguments]    ${vessel_type}
	[Documentation]    This keyword sets input values in Weather section in Squat calculator for vessel type given in keyword arguments
	Press Keys    ${WINDSPEED_INPUT}    RETURN
	Press Keys    ${WINDSPEED_INPUT}    ${WINDSPEED_INPUT_${vessel_type}}
	Press Keys    ${WAVEHEIGHT_INPUT}    RETURN
	Press Keys    ${WAVEHEIGHT_INPUT}    ${WAVEHEIGHT_INPUT_${vessel_type}}
	Press Keys    ${WAVEPERIOD_INPUT}    RETURN
	Press Keys    ${WAVEPERIOD_INPUT}    ${WAVEPERIOD_INPUT_${vessel_type}}
	Capture Page Screenshot

Set Input Values To Detailed Section
	[Arguments]    ${vessel_type}
	[Documentation]    This keyword sets input values in Detailed section in Squat calculator for vessel type given in keyword arguments
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
	[Arguments]    ${vessel_type}    ${fairway_type}=SLOPED
	[Documentation]    This keyword sets input values in Fairway section in Squat calculator for vessel type given in keyword arguments
	Press Keys    ${SWEPTDEPTH_INPUT}    RETURN
	Press Keys    ${SWEPTDEPTH_INPUT}    ${SWEPTDEPTH_INPUT_${vessel_type}}
	Press Keys    ${WATERLEVEL_INPUT}    RETURN
	Press Keys    ${WATERLEVEL_INPUT}    ${WATERLEVEL_INPUT_${vessel_type}}
	Press Keys    ${WATERDEPTH_INPUT}    RETURN
	Press Keys    ${WATERDEPTH_INPUT}    ${WATERDEPTH_INPUT_${vessel_type}}
	Run Keyword If    '${fairway_type}' == 'SLOPED'
	...    Set Input Values To Sloped Channel    ${vessel_type}
	...  ELSE IF    '${fairway_type}' == 'CHANNEL'
	...    Set Input Values To Channel    ${vessel_type}
	...  ELSE
	...    Set Input Values To Open Water

Set Input Values To Sloped Channel
  [Arguments]    ${vessel_type}
	[Documentation]    This keyword sets input values in Form of Fairway section in Squat calculator for vessel type given in keyword arguments
	Click Element    ${LUISKA_RADIOBUTTON}
	Sleep    2 seconds
	Scroll Element Into View    ${SLOPESCALE_INPUT}
	Press Keys    ${CHANNELWIDTH_INPUT}    RETURN
	Press Keys    ${CHANNELWIDTH_INPUT}    ${CHANNELWIDTH_INPUT_${vessel_type}}
	Press Keys    ${SLOPEHEIGHT_INPUT}    RETURN
	Press Keys    ${SLOPEHEIGHT_INPUT}    ${SLOPEHEIGHT_INPUT_${vessel_type}}
	Capture Page Screenshot

Set Input Values To Channel
  [Arguments]    ${vessel_type}
	[Documentation]    This keyword sets input values in Form of Fairway section in Squat calculator for vessel type given in keyword arguments
	Click Element    ${KANAVA_RADIOBUTTON}
	Sleep    2 seconds
	Scroll Element Into View    ${CHANNELWIDTH_INPUT}
	Press Keys    ${CHANNELWIDTH_INPUT}    RETURN
	Press Keys    ${CHANNELWIDTH_INPUT}    ${CHANNELWIDTH_INPUT_${vessel_type}}
	Capture Page Screenshot

Set Input Values To Open Water
  [Documentation]    This keyword sets input values in Form of Fairway section in Squat calculator for vessel type given in keyword arguments
	Click Element    ${AVOVESI_RADIOBUTTON}
	Sleep    2 seconds
	Capture Page Screenshot

Set Input Values To Stability Section
	[Arguments]    ${vessel_type}
	[Documentation]    This keyword sets input values in Stability section in Squat calculator for vessel type given in keyword arguments
	Press Keys    ${KG_INPUT}    RETURN
	Press Keys    ${KG_INPUT}    ${KG_INPUT_${vessel_type}}
	Capture Page Screenshot

Set Input Values To Vessel Section
	[Arguments]    ${vessel_type}
	[Documentation]    This keyword sets input values in Vessel section in Squat calculator for vessel type given in keyword arguments
	Scroll Element Into View    ${TURNING_RADIUS_INPUT}
	Press Keys    ${VESSEL_COURSE_INPUT}    RETURN
	Press Keys    ${VESSEL_COURSE_INPUT}    ${VESSEL_COURSE_INPUT_${vessel_type}}
	Press Keys    ${VESSEL_SPEED_INPUT}    RETURN
	Press Keys    ${VESSEL_SPEED_INPUT}    ${VESSEL_SPEED_INPUT_${vessel_type}}
	Click Element    ${TURNING_RADIUS_INPUT}
	Capture Page Screenshot

Get Squat Calculation Values
  [Arguments]    ${fairway_type}=SLOPED
	[Documentation]    This keyword gets squat calculation values from Squat calculator and sets them as test variables
	${KALLISTUMA_TUULI}=    Get Text    ${KALLISTUMA_TUULI_VALUE}
	${KALLISTUMA_KAANNOS}=    Get Text    ${KALLISTUMA_KAANNOS_VALUE}
	${ALUKSEN_TODELLINEN_SYVAYS}=    Get Text    ${ALUKSEN_TODELLINEN_SYVAYS_VALUE}
	${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA}=    Get Text    ${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA_VALUE}
	${KOLIVARA_JA_ALUKSEN_LIIKKEET}=    Get Text    ${KOLIVARA_JA_ALUKSEN_LIIKKEET_VALUE}
	${KOLIVARA_SUORALLA_KURSSILLA}=    Get Text    ${KOLIVARA_SUORALLA_KURSSILLA_VALUE}
	${KOLIVARA_KAANNOKSESSA}=    Get Text    ${KOLIVARA_KAANNOKSESSA_VALUE}
	${PAINUMA}=    Get Text    ${PAINUMA_${fairway_type}_VALUE}
	Set Test Variable    ${KALLISTUMA_TUULI}
	Set Test Variable    ${KALLISTUMA_KAANNOS}
	Set Test Variable    ${ALUKSEN_TODELLINEN_SYVAYS}
	Set Test Variable    ${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA}
	Set Test Variable    ${KOLIVARA_JA_ALUKSEN_LIIKKEET}
	Set Test Variable    ${KOLIVARA_SUORALLA_KURSSILLA}
	Set Test Variable    ${KOLIVARA_KAANNOKSESSA}
	Set Test Variable    ${PAINUMA}

Get Tuulen Voima Calculation Values
	[Documentation]    This keyword gets tuulen voima calculation values from Squat calculator and sets them as test variables
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
	[Documentation]    This keyword gets sorto calculation values from Squat calculator and sets them as test variables
	${SUHTEELLINEN_TUULEN_SUUNTA_2}=    Get Text    ${SUHTEELLINEN_TUULEN_SUUNTA_2_VALUE}
	${SUHTEELLINEN_TUULEN_NOPEUS_2}=    Get Text    ${SUHTEELLINEN_TUULEN_NOPEUS_2_VALUE}
	${ARVIOITU_SORTOKULMA}=    Get Text    ${ARVIOITU_SORTOKULMA_VALUE}
	${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN}=    Get Text    ${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN_VALUE}
	Set Test Variable    ${SUHTEELLINEN_TUULEN_SUUNTA_2}
	Set Test Variable    ${SUHTEELLINEN_TUULEN_NOPEUS_2}
	Set Test Variable    ${ARVIOITU_SORTOKULMA}
	Set Test Variable    ${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN}

Check The Calculation Values
	[Arguments]    ${vessel_type}    ${fairway_type}=SLOPED
	[Documentation]    This keyword compares actual calculation values with calculation value variables for vessel type given in keyword arguments
	Should Be Equal    ${KALLISTUMA_TUULI}    ${KALLISTUMA_TUULI_${vessel_type}}
	Should Be Equal    ${KALLISTUMA_KAANNOS}    ${KALLISTUMA_KAANNOS_${vessel_type}}
	Should Be Equal    ${ALUKSEN_TODELLINEN_SYVAYS}    ${ALUKSEN_TODELLINEN_SYVAYS_${vessel_type}}
	Should Be Equal    ${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA}    ${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA_${vessel_type}}
	Should Be Equal    ${KOLIVARA_JA_ALUKSEN_LIIKKEET}    ${KOLIVARA_JA_ALUKSEN_LIIKKEET_${vessel_type}_${fairway_type}}
	Should Be Equal    ${KOLIVARA_SUORALLA_KURSSILLA}    ${KOLIVARA_SUORALLA_KURSSILLA_${vessel_type}_${fairway_type}}
	Should Be Equal    ${KOLIVARA_KAANNOKSESSA}    ${KOLIVARA_KAANNOKSESSA_${vessel_type}_${fairway_type}}
	Should Be Equal    ${PAINUMA}    ${PAINUMA_${vessel_type}_${fairway_type}}
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
	Should Be Equal    ${ARVIOITU_SORTOKULMA}    ${ARVIOITU_SORTOKULMA_${vessel_type}}
