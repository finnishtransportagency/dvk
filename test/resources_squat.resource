*** Settings ***
Documentation    This resource file contains resources for Squat tests

*** Variables ***
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
