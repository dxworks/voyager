package org.dxworks.voyager.results

import org.dxworks.voyager.instruments.Instrument

data class InstrumentResult(val instrument: Instrument, val results: List<FileAndAlias>)
