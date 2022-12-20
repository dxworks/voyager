import {Action, BaseAction} from './Action'

export interface BaseInstrument {
    id: string;
    actions: BaseAction[];
}

export interface Instrument {
    id: string;
    name: string;
    version: string;
    actions: Action[];
    produces: Map<string, string>;

}