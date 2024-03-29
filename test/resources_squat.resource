*** Settings ***
Documentation    This resource file contains resources for Squat tests

*** Variables ***
#Language selection locators
${LANGUAGE_SELECT_BUTTON}    //ion-select[@class = "ion-padding md"]
${OK_BUTTON}    //span[text() = "OK"]
${FI_BUTTON}	//ion-button[@id="language_fi"]
${FI_BUTTON_NOT_SELECTED}	//ion-button[@id="language_fi" and @disabled="false"]
${SV_BUTTON}	//ion-button[@id="language_sv"]
${SV_BUTTON_NOT_SELECTED}	//ion-button[@id="language_sv" and @disabled="false"]
${EN_BUTTON}	//ion-button[@id="language_en"]
${EN_BUTTON_NOT_SELECTED}	//ion-button[@id="language_en" and @disabled="false"]

#Squat-calculator header locators
${SQUAT_GRAPH_HEADER}    //ion-text[@class = "squatChartTitle md"]/h3/strong

#Squat-calculator locators in Finnish language
${SQUAT_CALCULATION_HEADER_FI}    //h1/strong[text() = "Painumalaskenta (Squat)"]
${VESSEL_HEADER_FI}    //h2/strong[text() = "Aluksen tiedot"]
${ENVIRONMENT_HEADER_FI}    //h2/strong[text() = "Ympäristö"]
${CALCULATIONS_HEADER_FI}    //h2/strong[text() = "Laskenta"]

#Squat-calculator locators in Swedish language
${SQUAT_CALCULATION_HEADER_SV}    //h1/strong[text() = "Squat beräkning"]
${VESSEL_HEADER_SV}    //h2/strong[text() = "Fartygets basuppgifter"]
${ENVIRONMENT_HEADER_SV}    //h2/strong[text() = "Omgivning"]
${CALCULATIONS_HEADER_SV}    //h2/strong[text() = "Beräkning"]

#Squat-calculator locators in English language
${SQUAT_CALCULATION_HEADER_EN}    //h1/strong[text() = "Squat Calculation"]
${VESSEL_HEADER_EN}    //h2/strong[text() = "Vessel"]
${ENVIRONMENT_HEADER_EN}    //h2/strong[text() = "Environment"]
${CALCULATIONS_HEADER_EN}    //h2/strong[text() = "Calculations"]

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
${AVOVESI_RADIOBUTTON}    //ion-radio[@id="Open Water"]
${KANAVA_RADIOBUTTON}    //ion-radio[@id="Channel"]
${LUISKA_RADIOBUTTON}    //ion-radio[@id="Sloped Channel"]
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
${KALLISTUMA_TUULI_VALUE}    //ion-text[@title = "Tuulen aiheuttama kallistuma"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${KALLISTUMA_KAANNOS_VALUE}    //ion-text[@title = "Käännöksen aiheuttama kallistuma"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${ALUKSEN_TODELLINEN_SYVAYS_VALUE}    //ion-text[@title = "Aluksen todellinen syväys"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${ALUKSEN_TODELLINEN_SYVAYS_KAANNOKSESSA_VALUE}    //ion-text[@title = "Aluksen todellinen syväys käännöksessä"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${KOLIVARA_JA_ALUKSEN_LIIKKEET_VALUE}    //ion-text[@title = "Kölivara ja aluksen liikkeet"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${KOLIVARA_SUORALLA_KURSSILLA_VALUE}    //ion-text[@title = "Kölivara suoralla kurssilla"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${KOLIVARA_KAANNOKSESSA_VALUE}    //ion-text[@title = "Kölivara käännöksessä"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${PAINUMA_SLOPED_VALUE}    //ion-text[@title = "Painuma (Squat), luiska"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${PAINUMA_CHANNEL_VALUE}    //ion-text[@title = "Painuma (Squat), kanava"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${PAINUMA_OPEN_VALUE}    //ion-text[@title = "Painuma (Squat), avovesi"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text

#Tuulen voima -calculation
${SUHTEELLINEN_TUULEN_SUUNTA_1_VALUE}    //strong[text() = "Tuulen voima"]/ancestor::ion-grid/following-sibling::ion-grid[1]/descendant::ion-text[@title = "Suhteellinen tuulen suunta"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${SUHTEELLINEN_TUULEN_NOPEUS_1_VALUE}    //strong[text() = "Tuulen voima"]/ancestor::ion-grid/following-sibling::ion-grid[1]/descendant::ion-text[@title = "Suhteellinen tuulen nopeus"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${TUULEN_VOIMA_VALUE}    //ion-text[@title = "Tuulen voima"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${AALLOKON_VOIMA_VALUE}    //ion-text[@title = "Aallokon voima"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${KEULAPOTKURIN_SUORITUSKYKY_VALUE}    //ion-text[@title = "Keulapotkurin suorituskyky"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${TURVAMARGINAALI_VALUE}    //ion-text[@title = "Käytettävissä oleva turvamarginaali"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${VAHIMMAISVAATIMUS_ULKOINEN_TYONTOVOIMA_VALUE}    //ion-text[@title = "Vähimmäisvaatimus tarvittavalle ulkoiselle työntövoimalle"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text

#Sorto -calculation
${SUHTEELLINEN_TUULEN_SUUNTA_2_VALUE}    //strong[text() = "Tuulen voima"]/ancestor::ion-grid/following-sibling::ion-grid[3]/descendant::ion-text[@title = "Suhteellinen tuulen suunta"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${SUHTEELLINEN_TUULEN_NOPEUS_2_VALUE}    //strong[text() = "Tuulen voima"]/ancestor::ion-grid/following-sibling::ion-grid[3]/descendant::ion-text[@title = "Suhteellinen tuulen nopeus"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${ARVIOITU_SORTOKULMA_VALUE}    //ion-text[@title = "Arvioitu sortokulma"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
${ARVIOITU_LEVEYS_SORTO_HUOMIOIDEN_VALUE}    //ion-text[@title = "Aluksen arvioitu leveys sorto huomioiden"]/parent::div/parent::ion-label/following-sibling::ion-item/ion-text
