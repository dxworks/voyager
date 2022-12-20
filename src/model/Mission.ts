import {BaseInstrument} from './Instrument'

export interface Mission {

    variables: Map<string, string>;
    instruments: BaseInstrument[];
    environment: Map<string, string>;
    instrumentsDir: string;

}