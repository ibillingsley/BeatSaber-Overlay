import { Globals } from "./global.js";

export class Template {
    /////////////////////
    // PUBLIC FUNCTION //
    /////////////////////
    public loadSkin(moduleName: Globals.E_MODULES, skinName: string, fileName?: string): Promise<unknown> {
        return new Promise(resolve => {
            let skin = (Globals.SKIN_AVAILABLE[moduleName].hasOwnProperty(skinName) ? Globals.SKIN_AVAILABLE[moduleName][skinName] : Globals.SKIN_AVAILABLE[moduleName]["default"]);
            let skinPath = skin[0];

            $("link[rel=stylesheet][href*=\"./skins/" + moduleName + "\"]").remove();

            if (fileName !== undefined) {
                if (skin.includes(fileName)) {
                    for (let i = 1; i < skin.length; i++) {
                        if (skin[i] === "style.css") {
                            $("head").append("<link rel=\"stylesheet\" href=\"" + skinPath + skin[i] + "\" type=\"text/css\" />");
                            continue;
                        }
                    }

                    $("#" + moduleName).load(skinPath + fileName);
                }
            } else {
                for (let i = 1; i < skin.length; i++) {
                    if (skin[i] === "style.css") {
                        $("head").append("<link rel=\"stylesheet\" href=\"" + skinPath + skin[i] + "\" type=\"text/css\" />");
                        continue;
                    }

                    $("#" + moduleName).load(skinPath + skin[i]);
                }
            }

            setTimeout(() => resolve(""), 0);
        });
    }

    public refreshUI(data: Globals.I_playerCard|Globals.I_songCard, moduleName: Globals.E_MODULES): void {
        for (let[key, value] of Object.entries(data)) {
            switch (moduleName) {
                case Globals.E_MODULES.PLAYERCARD:
                    switch (key) {
                        case "topCountry":
                        case "topWorld":
                        case "performancePoint":
                            setText($("#" + key), value);
                            break;

                        case "playerFlag":
                        case "avatar":
                            $("#" + key).css("background-image", "url('" + value + "')");
                            break;
                    }
                    break;

                case Globals.E_MODULES.SONGCARD:
                    switch (key) {
                        case "title":
                        case "subTitle":
                        case "mapper":
                        case "author":
                        case "difficulty":
                        case "difficultyLabel":
                        case "characteristic":
                        case "bsrKey":
                        case "bpm":
                        case "timeToLetters":
                        case "totalTimeToLetters":
                        case "accuracy":
                        case "accuracyToLetters":
                        case "score":
                        case "combo":
                        case "miss":
                            setText($("#" + key), value);
                            break;

                        case "cover":
                            $("#" + key).css("background-image", "url('" + value + "')");
                            break;

                        case "qualified":
                        case "ranked":
                            $("#" + key).css("display", (value) ? "inline-block" : "none");
                            break;

                        case "accuracyToLetterClass":
                            $("." + key).removeClass(["ss", "s", "a", "b", "c", "de"].filter(c => c !== value))
                                .addClass(value);
                            break;
                        case "difficultyClass":
                            $("." + key).removeClass(["ExpertPlus", "Expert", "Hard", "Normal", "Easy"].filter(c => c !== value))
                                .addClass(value);
                            break;

                        case "health":
                        case "timeToPercentage":
                            $("#" + key).css("width", value + "%");
                            break;
                    }
                    break;
            }
        }
    }

    public moduleScale(moduleName: Globals.E_MODULES, position: string, scale: number): void {
        let element = $("#playerCard");

        if (moduleName === Globals.E_MODULES.SONGCARD)
            element = $("#songCard");

        element.css("transform-origin", position.replace(/(-)/g, " "));
        element.css("transform", "scale(" + scale + ")");
    }

    public moduleCorners(moduleName: Globals.E_MODULES, position: string): void {
        let element = $("#playerCard");

        if (moduleName === Globals.E_MODULES.SONGCARD)
            element = $("#songCard");

        element.removeClass(["top-left", "bottom-left", "top-right", "bottom-right"].filter(c => c !== position))
            .addClass(position);
    }

    public moduleToggleDisplay(playerCardData: Globals.I_playerCard, songCardData: Globals.I_songCard): void {
        if (playerCardData.disabled)
            $("#playerCard").addClass("hidden");

        if (songCardData.disabled)
            $("#songCard").addClass("hidden");

        if (!songCardData.started)
            $("#songCard").addClass("hidden");

        if (songCardData.started)
            $("#songCard").removeClass("hidden");

        if (!playerCardData.display)
            $("#playerCard").addClass("hidden");

        if (playerCardData.display)
            $("#playerCard").removeClass("hidden");
    }

    public stopOrStart(started: boolean, paused: boolean): void {
        $("#songCard").toggleClass("stop", !started || paused);
    }

    public missDisplay(display: boolean): void {
        if (display)
            $(".missGroup").css("display", "block");
        else
            $(".missGroup").css("display", "none");
    }

    /////////////////////////////
    // PUBLIC PLUGINS FUNCTION //
    /////////////////////////////
    public timerToCircleBar(percentage: number): void {
        const circumference = 30 * Math.PI * 2;

        $("#progress").css("stroke-dashoffset", ((1 - (percentage / 100)) * circumference) + "px");
    }

    public missChanger(missNumber: number): void {
        if (missNumber === 0) {
            setText($("#miss").removeClass("ion-android-cancel").addClass("ion-android-checkmark-circle"), "FC");
        } else {
            $("#miss").removeClass("ion-android-checkmark-circle").addClass("ion-android-cancel");
        }
    }

    ///////////////////////////
    // PUBLIC SETUP FUNCTION //
    ///////////////////////////
    public setupHide(display: boolean): void {
        if (display)
            $("#setupPanel").addClass("hidden");
        else
            $("#setupPanel").removeClass("hidden");
    }

    public makeActive(element?: JQuery): void {
        $("li").removeClass("active");

        if (element !== undefined)
            element.addClass("active");
    }

    public makeHidden(displayed: boolean): void {
        if (!displayed)
            $("#setup").removeClass("hidden");
        else
            $("#setup").addClass("hidden");
    }
}

function setText(target: JQuery, text: string) {
    const element = target.get(0);
    if (element) element.textContent = text;
}