import {Action} from './Action'

export interface Instrument {
    id: string;
    name: string;
    version: string;
    actions: Action[];
    produces: Map<string, string>;

}