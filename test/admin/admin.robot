*** Settings ***
Documentation     This test suite contains test cases for DVK
Test Setup        Open Admin
Test Teardown     Close All Browsers
Library           SeleniumLibrary    timeout=30s
Library           String
Library           DateTime
Library           Collections
*** Variables ***
${PROTOCOL}       http
${HOST}           localhost
${PORT}           3000
${URL}            ${PROTOCOL}://${HOST}:${PORT}
${BROWSER}        headlesschrome
${SAVE_BUTTON}    //ion-button[@id = "saveButton"]
${SAVE_BUTTON_DISABLED}    //ion-button[contains(@class, "button-disabled") and @id = "saveButton"]
${REMOVE_BUTTON}    //ion-button[@id = "deleteButton"]
${CANCEL_BUTTON}    //ion-button[@id = "cancelButton"]
${CREATE_HARBOR_BUTTON}    //ion-button[text() = "Luo satama"]
${CREATE_CARD_BUTTON}    //ion-button[text() = "Luo väyläkortti"]
${SEARCH_INPUT}    //div[@id = "fairwayCardOrHarborSearch"]
*** Test Cases ***

Open Existing Public Harbor And Save It
    [Documentation]    Open harbour and save it. Verify that saving it as is succeed.
    ${harbour}=    Get Random Item From List    Satama
    Select Row From List    ${harbour}
    Save Public Harbor

Open Existing Public Fairway Card And Save It
    [Documentation]    Open card and save it. Verify that saving it as is succeed.
    ${fairwayCard}=    Get Random Item From List    Väyläkortti
    Select Row From List    ${fairwayCard}
    Save Public Fairway Card

Create New Harbor From Existing One
    [Documentation]    Create new harbour based on existing harbour. After creation remove it.
    ${harbour}=    Get Random Item From List    Satama
    Create And Select Harbour    ${harbour}
    ${number}=    Generate Unique Id
    Fill Input Field    primaryId    xxx${number}
    Fill Multi Input Field    harbourName    xxx
    Save New Harbour
    Remove Harbour

Create New Fairway Card From Existing One
    [Documentation]    Create new fairway card based on existing card. After creation remove it.
    ${fairwayCard}=    Get Random Item From List    Väyläkortti
    Create And Select Fairway Card    ${fairwayCard}
    ${number}=    Generate Unique Id
    Fill Input Field    primaryId    yyy${number}
    Fill Multi Input Field    fairwayCardName    yyy
    Save New Fairway Card
    Remove Fairway Card

Create New Harbor From Scratch
    [Documentation]    Create new harbour from scratch and try saving before all mandatory fields are filled. In the end remove harbour.
    Create And Select Harbour    ${None}
    ${number}=    Generate Unique Id
    Fill Input Field    primaryId    xyz${number}
    Save New Harbour    Tallennus epäonnistui
    Fill Multi Input Field    harbourName    xyz
    Save New Harbour    Tallennus epäonnistui
    Scroll Element Into View    //input[@name = "lat"]
    Fill Input Field    lat    59
    Fill Input Field    lon    20
    Save New Harbour
    Remove Harbour

Test Unsaved Changes
    [Documentation]    Test verification popup is shown when leaving new harbour page unsaved.
    Create And Select Harbour    ${None}
    ${number}=    Generate Unique Id
    Fill Input Field    primaryId    xyz${number}
    Return Back To List View    Poistu tallentamatta

*** Keywords ***
Generate Unique Id
    [Documentation]    Generate unique number between 1 and 1000000.
    ${number}=    Evaluate    random.randint(1, 1000000)
    RETURN     ${number}

Get Random Item From List
    [Documentation]    Get random public item from list based item type.
    [Arguments]    ${ItemType}
    Wait Until Element Is Visible    //ion-grid[@class = "itemList md"]/ion-row[@tabindex = "0"]/ion-col[2]
    ${names}=    Get WebElements    //ion-grid[@class = "itemList md"]/ion-row[@tabindex = "0"]/ion-col[2]
    ${types}=    Get WebElements    //ion-grid[@class = "itemList md"]/ion-row[@tabindex = "0"]/ion-col[3]
    ${statuses}=    Get WebElements    //ion-grid[@class = "itemList md"]/ion-row[@tabindex = "0"]/ion-col[6]
    @{items}=    Create List
    FOR    ${name}    ${type}    ${status}    IN ZIP    ${names}    ${types}    ${statuses}
        IF    "${ItemType}" == "${type.text}" and "Julkaistu" == "${status.text}"
            Append To List    ${items}    ${name}
        END
    END
    ${itemCount}=    Get Length    ${items}
    ${random}=    Evaluate    random.randint(1, ${itemCount}) - 1
    ${selected}=    Get From List    ${items}    ${random}
    Scroll Element Into View    ${selected}
    Log    Item ${selected.text} selected
    RETURN    ${selected.text}

Open Admin
    [Documentation]    This keyword opens admin application in localhost with port and browser given as variables
    Wait Until Keyword Succeeds    3x    2s    Open Browser    ${URL}    ${BROWSER}    options=add_experimental_option("excludeSwitches", ["enable-logging"])
    Sleep    2s

Fill Multi Input Field
    [Documentation]    Fill all language fields at once for certain input.
    [Arguments]    ${FieldName}    ${Value}
    ${speed}=    Set Selenium Speed    1s
    Input Text    //input[@name = "${FieldName}fi"]    ${Value}fi
    Press Keys    //input[@name = "${FieldName}fi"]    TAB
    Input Text    //input[@name = "${FieldName}sv"]    ${Value}sv
    Press Keys    //input[@name = "${FieldName}sv"]    TAB
    Input Text    //input[@name = "${FieldName}en"]    ${Value}en
    Press Keys    //input[@name = "${FieldName}en"]    TAB
    Set Selenium Speed    ${speed}

Fill Input Field
    [Documentation]    Fill single input field.
    [Arguments]    ${FieldName}    ${Value}
    ${speed}=    Set Selenium Speed    1s
    Input Text    //input[@name = "${FieldName}"]    ${Value}
    Press Keys    //input[@name = "${FieldName}"]    TAB
    Set Selenium Speed    ${speed}

Create And Select Harbour
    [Documentation]    Start creating new harbour and take existing harbour as a base if given as argument.
    [Arguments]    ${HarbourName}
    Click Element    ${CREATE_HARBOR_BUTTON}
    Wait Until Element Is Visible    ${SEARCH_INPUT}
    Run Keyword If    "${HarbourName}" != "${None}"    Click Element    ${SEARCH_INPUT}
    Run Keyword If    "${HarbourName}" != "${None}"    Press Keys    ${SEARCH_INPUT}    ${HarbourName}
    Run Keyword If    "${HarbourName}" != "${None}"    Press Keys    ${SEARCH_INPUT}    ARROW_DOWN
    Run Keyword If    "${HarbourName}" != "${None}"    Press Keys    ${SEARCH_INPUT}    RETURN
    Click Element    //ion-button[@slot = "end" and text() = "Luo satama"]
    Wait Until Element Is Visible    //input[@name = "primaryId"]

Save New Harbour
    [Documentation]    Press "Create new" button and verify resulting popup title.
    [Arguments]    ${Text}=Tallennus onnistui
    Click Element    ${SAVE_BUTTON}
    Wait Until Element Is Visible    //div[@class = "wrappable-title" and text() = "${Text}"]
    Click Element    //ion-button[@slot = "end" and text() = "Ok"]

Remove Harbour
    [Documentation]    Remove harbour and verify resulting popup titles.
    Wait Until Element Is Visible    ${REMOVE_BUTTON}
    Click Element    ${REMOVE_BUTTON}
    Wait Until Element Is Visible    //div[@class = "wrappable-title" and text() = "Sataman poisto"]
    Click Element    //ion-button[@slot = "end" and text() = "Poista"]
    Wait Until Element Is Visible    //div[@class = "wrappable-title" and text() = "Tallennus onnistui"]
    Click Element    //ion-button[@slot = "end" and text() = "Ok"]

Select Row From List
    [Documentation]    Select item from list view.
    [Arguments]    ${Name}
    Wait Until Keyword Succeeds    3x    2s    Click Element    //ion-grid[@class = "itemList md"]/ion-row[@tabindex = "0"]/ion-col[text() = "${Name}"]
    Wait Until Element Is Visible    ${SAVE_BUTTON}

Save Public Harbor
    [Documentation]    Save harbour which state is public and verify resulting popup titles.
    Wait Until Element Is Visible    ${SAVE_BUTTON}
    Wait Until Element Is Not Visible    ${SAVE_BUTTON_DISABLED}
    Click Element    ${SAVE_BUTTON}
    Wait Until Element Is Visible    //div[@class = "wrappable-title" and text() = "Sataman muutosten tallentaminen"]
    Click Element    //ion-button[@slot = "end" and text() = "Tallenna"]
    Wait Until Element Is Visible    //div[@class = "wrappable-title" and text() = "Tallennus onnistui"]
    Click Element    //ion-button[@slot = "end" and text() = "Ok"]

Return Back To List View
    [Documentation]    Return back to list view from new harbour/fairway card page. Verify resulting popup if necessary.
    [Arguments]    ${VerificationMessage}=${None}
    Sleep    5s
    Click Element    ${CANCEL_BUTTON}
    Run Keyword If    "${VerificationMessage}" != "${None}"    Wait Until Element Is Visible    //div[@class = "wrappable-title" and text() = "${VerificationMessage}"]
    Run Keyword If    "${VerificationMessage}" != "${None}"    Click Element    //ion-button[@slot = "end" and text() = "Poistu"]
    Wait Until Element Is Visible    ${CREATE_HARBOR_BUTTON}

Save Public Fairway Card
    [Documentation]    Save fairway card which state is public and verify resulting popup titles.
    Wait Until Element Is Visible    ${SAVE_BUTTON}
    Wait Until Element Is Not Visible    ${SAVE_BUTTON_DISABLED}
    Click Element    ${SAVE_BUTTON}
    Wait Until Element Is Visible    //div[@class = "wrappable-title" and text() = "Väyläkortin muutosten tallentaminen"]
    Click Element    //ion-button[@slot = "end" and text() = "Tallenna"]
    Wait Until Element Is Visible    //div[@class = "wrappable-title" and text() = "Tallennus onnistui"]
    Click Element    //ion-button[@slot = "end" and text() = "Ok"]

Create And Select Fairway Card
    [Documentation]    Start creating new fairway card and take existing card as a base.
    [Arguments]    ${CardName}
    Click Element    ${CREATE_CARD_BUTTON}
    Wait Until Element Is Visible    ${SEARCH_INPUT}
    Click Element    ${SEARCH_INPUT}
    Press Keys    ${SEARCH_INPUT}    ${CardName}
    Press Keys    ${SEARCH_INPUT}    ARROW_DOWN
    Press Keys    ${SEARCH_INPUT}    RETURN
    Click Element    //ion-button[@slot = "end" and text() = "Luo väyläkortti"]
    Wait Until Element Is Visible    //input[@name = "primaryId"]

Save New Fairway Card
    [Documentation]    Press "Create new" button and verify resulting popup title.
    Click Element    ${SAVE_BUTTON}
    Wait Until Element Is Visible    //div[@class = "wrappable-title" and text() = "Tallennus onnistui"]
    Click Element    //ion-button[@slot = "end" and text() = "Ok"]

Remove Fairway Card
    [Documentation]    Remove fairway card and verify resulting popup titles.
    Wait Until Element Is Visible    ${REMOVE_BUTTON}
    Click Element    ${REMOVE_BUTTON}
    Wait Until Element Is Visible    //div[@class = "wrappable-title" and text() = "Väyläkortin poisto"]
    Click Element    //ion-button[@slot = "end" and text() = "Poista"]
    Wait Until Element Is Visible    //div[@class = "wrappable-title" and text() = "Tallennus onnistui"]
    Click Element    //ion-button[@slot = "end" and text() = "Ok"]
