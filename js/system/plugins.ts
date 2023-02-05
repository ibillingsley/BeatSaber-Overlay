import { Globals }              from "../globals";
import { Parameters }           from "./parameters";
import { WebSocketManager }     from './websocket-manager';
import { PlayerCard }           from "../modules/playerCard";
import { SongCard }             from "../modules/songCard";
import { BSPlus }               from "../games/beatSaber/BSPlus";
import { BSPlusLeaderboard }    from "../games/beatSaber/bsPlusLeaderboard";
import { HTTP_sira_Status }     from "../games/beatSaber/HTTP_sira_Status";
import { DataPuller }           from "../games/beatSaber/dataPuller";
import { SynthRiders }          from "../games/synthRiders/synthRiders";
import { AudioTrip }            from "../games/audioTrip/audioTrip";
import { Audica }               from "../games/audica/audica";

export class Plugins {

    ///////////////
    // @Instance //
    ///////////////
    private static _instance: Plugins;

    //////////////////////
    // @Class Variables //
    //////////////////////
    private _parameters         : Parameters;
    private _websocketManager   : WebSocketManager;
    private _playerCard         : PlayerCard;
    private _songCard           : SongCard;
    private _bsPlus             : BSPlus;
    private _bsPlusLeaderboard  : BSPlusLeaderboard;
    private _httpSiraStatus     : HTTP_sira_Status;
    private _dataPuller         : DataPuller;
    private _synthRiders        : SynthRiders;
    private _audioTrip          : AudioTrip;
    private _audica             : Audica;

    ///////////////////////
    // Private Variables //
    ///////////////////////
    private websocketVersion = 0;

    //////////////////////
    // Public Variables //
    //////////////////////
    public websocketStatus  : Globals.WEBSOCKET_STATUS = Globals.WEBSOCKET_STATUS.DISCONNECTED;
    public websocketMod!    : Globals.WEBSOCKET_MODS;

    constructor() {
        this._parameters        = Parameters.Instance;
        this._websocketManager  = new WebSocketManager();
        this._playerCard        = PlayerCard.Instance;
        this._songCard          = SongCard.Instance;
        this._bsPlus            = new BSPlus();
        this._bsPlusLeaderboard = new BSPlusLeaderboard();
        this._httpSiraStatus    = new HTTP_sira_Status();
        this._dataPuller        = new DataPuller();
        this._synthRiders       = new SynthRiders();
        this._audioTrip         = new AudioTrip();
        this._audica            = new Audica();
    }

    /////////////////////
    // Private Methods //
    /////////////////////
    private overlayDisplay() {
        if (this.websocketStatus === Globals.WEBSOCKET_STATUS.DISCONNECTED) {
            this._playerCard.playerCardData.display = false;
            this._songCard.songCardData.display     = false;

            if (this._playerCard.playerCardData.alwaysEnabled)  this._playerCard.playerCardData.alwaysEnabled = false;
            if (this._songCard.songCardData.alwaysEnabled)      this._songCard.songCardData.alwaysEnabled = false;
        } else this._parameters.assocValue();

        this._songCard.websocketMod = this.websocketMod;
    }

    ////////////////////
    // Public Methods //
    ////////////////////
    public async connection(): Promise<void> {
        this.websocketVersion++;

        if (this._parameters.uriParams.games.beatSaber) {
            if (this._parameters.uriParams.plugins.beatSaberPlugins.beatSaberPlus) {
                this._websocketManager.add("BSPlus" + this.websocketVersion, "ws://" + this._parameters.uriParams.general.ip + ":2947/socket",
                    (data) => { this._bsPlus.dataParser(data); },
                    () => {
                        console.log("%csocket initialized on BeatSaberPlus!", Globals.SUCCESS_LOG);
                        this.websocketStatus    = Globals.WEBSOCKET_STATUS.CONNECTED;
                        this.websocketMod       = Globals.WEBSOCKET_MODS.BSPLUS;

                        this.overlayDisplay();

                        if (this._parameters.uriParams.plugins.beatSaberPlugins.beatSaberPlusLeaderboard) {
                            this._websocketManager.add("BSPlusLeaderboard" + this.websocketVersion, "ws://" + this._parameters.uriParams.general.ip + ":2948/socket",
                                (data) => { this._bsPlusLeaderboard.dataParser(data); },
                                () => {},
                                () => {},
                                () => {},
                                true
                            );
                        }
                    },
                    () => {
                        this._websocketManager.remove("BSPlusLeaderboard" + this.websocketVersion);
                        if (this.websocketStatus === Globals.WEBSOCKET_STATUS.CONNECTED) {
                            if (this.websocketMod === Globals.WEBSOCKET_MODS.BSPLUS) {
                                this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                                this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                            }
                        } else {
                            this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                            this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                        }

                        this.overlayDisplay();
                    },
                    () => { console.log("%cinit of BeatSaberPlus socket failed!", Globals.WARN_LOG); }
                );
            }

            if (this._parameters.uriParams.plugins.beatSaberPlugins.dataPuller) {
                this._websocketManager.add("DataPullerMapData" + this.websocketVersion, "ws://" + this._parameters.uriParams.general.ip + ":2946/BSDataPuller/MapData",
                    (data) => { this._dataPuller.dataParser(data, "MapData"); },
                    () => {
                        console.log("%csocket initialized on DataPuller!", Globals.SUCCESS_LOG);
                        this.websocketStatus    = Globals.WEBSOCKET_STATUS.CONNECTED;
                        this.websocketMod       = Globals.WEBSOCKET_MODS.DATAPULLER;

                        this.overlayDisplay();

                        this._websocketManager.add("DataPullerLiveData" + this.websocketVersion, "ws://" + this._parameters.uriParams.general.ip + ":2946/BSDataPuller/LiveData",
                            (data) => { this._dataPuller.dataParser(data, "LiveData"); },
                            () => {},
                            () => {},
                            () => {},
                            true
                        );
                    },
                    () => {
                        this._websocketManager.remove("DataPullerLiveData" + this.websocketVersion);
                        if (this.websocketStatus === Globals.WEBSOCKET_STATUS.CONNECTED) {
                            if (this.websocketMod === Globals.WEBSOCKET_MODS.DATAPULLER) {
                                this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                                this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                            }
                        } else {
                            this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                            this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                        }

                        this.overlayDisplay();
                    },
                    () => { console.log("%cinit of DataPuller socket failed!", Globals.WARN_LOG); }
                );
            }

            if (this._parameters.uriParams.plugins.beatSaberPlugins.httpSiraStatus) {
                this._websocketManager.add("HttpSiraStatus" + this.websocketVersion, "ws://" + this._parameters.uriParams.general.ip + ":6557/socket",
                    (data) => { this._httpSiraStatus.dataParser(data); },
                    () => {
                        console.log("%csocket initialized on HttpSiraStatus!", Globals.SUCCESS_LOG);
                        this.websocketStatus    = Globals.WEBSOCKET_STATUS.CONNECTED;
                        this.websocketMod       = Globals.WEBSOCKET_MODS.HTTPSIRASTATUS;

                        this.overlayDisplay();
                    },
                    () => {
                        if (this.websocketStatus === Globals.WEBSOCKET_STATUS.CONNECTED) {
                            if (this.websocketMod === Globals.WEBSOCKET_MODS.HTTPSIRASTATUS) {
                                this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                                this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                            }
                        } else {
                            this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                            this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                        }

                        this.overlayDisplay();
                    },
                    () => { console.log("%cinit of HttpSiraStatus socket failed!", Globals.WARN_LOG); }
                );
            }
        }

        if (this._parameters.uriParams.games.synthRiders) {
            this._websocketManager.add("SynthRiders" + this.websocketVersion, "ws://" + this._parameters.uriParams.general.ip + ":9000/",
                (data) => { this._synthRiders.dataParser(data); },
                () => {
                    console.log("%csocket initialized on SynthRiders!", Globals.SUCCESS_LOG);
                    this.websocketStatus    = Globals.WEBSOCKET_STATUS.CONNECTED;
                    this.websocketMod       = Globals.WEBSOCKET_MODS.SYNTHRIDERS;

                    this.overlayDisplay();
                },
                () => {
                    if (this.websocketStatus === Globals.WEBSOCKET_STATUS.CONNECTED) {
                        if (this.websocketMod === Globals.WEBSOCKET_MODS.SYNTHRIDERS) {
                            this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                            this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                        }
                    } else {
                        this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                        this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                    }

                    this.overlayDisplay();
                },
                () => { console.log("%cinit of SynthRiders socket failed!", Globals.WARN_LOG); }
            );
        }

        if (this._parameters.uriParams.games.audioTrip) {
            this._websocketManager.add("AudioTrip" + this.websocketVersion, "ws://" + this._parameters.uriParams.general.ip + ":48998/",
                (data) => { this._audioTrip.dataParser(data); },
                () => {
                    console.log("%csocket initialized on AudioTrip!", Globals.SUCCESS_LOG);
                    this.websocketStatus    = Globals.WEBSOCKET_STATUS.CONNECTED;
                    this.websocketMod       = Globals.WEBSOCKET_MODS.AUDIOTRIP;

                    this.overlayDisplay();
                },
                () => {
                    if (this.websocketStatus === Globals.WEBSOCKET_STATUS.CONNECTED) {
                        if (this.websocketMod === Globals.WEBSOCKET_MODS.AUDIOTRIP) {
                            this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                            this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                        }
                    } else {
                        this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                        this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                    }

                    this.overlayDisplay();
                },
                () => { console.log("%cinit of AudioTrip socket failed!", Globals.WARN_LOG); }
            );
        }

        if (this._parameters.uriParams.games.audica) {
            this._websocketManager.add("Audica" + this.websocketVersion, "ws://" + this._parameters.uriParams.general.ip + ":8085/AudicaStats",
                (data) => { this._audica.dataParser(data); },
                () => {
                    console.log("%csocket initialized on Audica!", Globals.SUCCESS_LOG);
                    this.websocketStatus    = Globals.WEBSOCKET_STATUS.CONNECTED;
                    this.websocketMod       = Globals.WEBSOCKET_MODS.AUDICA;

                    this.overlayDisplay();
                },
                () => {
                    if (this.websocketStatus === Globals.WEBSOCKET_STATUS.CONNECTED) {
                        if (this.websocketMod === Globals.WEBSOCKET_MODS.AUDICA) {
                            this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                            this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                        }
                    } else {
                        this.websocketStatus    = Globals.WEBSOCKET_STATUS.DISCONNECTED;
                        this.websocketMod       = Globals.WEBSOCKET_MODS.NONE;
                    }

                    this.overlayDisplay();
                },
                () => { console.log("%cinit of Audica socket failed!", Globals.WARN_LOG); }
            );
        }
    }

    public removeConnection(): Promise<unknown> {
        return new Promise(resolve => {
            this._websocketManager.remove("BSPlus"              + this.websocketVersion);
            this._websocketManager.remove("BSPlusLeaderboard"   + this.websocketVersion);
            this._websocketManager.remove("DataPullerMapData"   + this.websocketVersion);
            this._websocketManager.remove("DataPullerLiveData"  + this.websocketVersion);
            this._websocketManager.remove("HttpSiraStatus"      + this.websocketVersion);
            this._websocketManager.remove("SynthRiders"         + this.websocketVersion);
            this._websocketManager.remove("AudioTrip"           + this.websocketVersion);
            this._websocketManager.remove("Audica"              + this.websocketVersion);

            setTimeout(() => resolve(""), 250);
        });
    }

    /////////////
    // Getters //
    /////////////
    public static get Instance(): Plugins {
        return this._instance || (this._instance = new this());
    }
}