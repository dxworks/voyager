import {Action} from './Action'

export interface Instrument {
    id: string;
    name: string;
    version: string;
    actions: Map<string, Action>;
}