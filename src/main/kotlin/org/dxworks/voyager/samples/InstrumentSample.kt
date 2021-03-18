package org.dxworks.voyager.samples

import org.dxworks.voyager.instruments.Instrument

data class InstrumentSample(val instrument: Instrument, val samples: List<FileAndAlias>)
