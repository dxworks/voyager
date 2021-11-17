package org.dxworks.voyager.instruments

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.LoggerContext
import ch.qos.logback.classic.encoder.PatternLayoutEncoder
import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.core.FileAppender
import org.slf4j.Logger
import org.slf4j.LoggerFactory


class InstrumentLogger(
    name: String
) {
    private val fileAppender: FileAppender<ILoggingEvent> = FileAppender<ILoggingEvent>().apply {
        val lc = LoggerFactory.getILoggerFactory() as LoggerContext
        val ple = PatternLayoutEncoder()
        ple.pattern = "%date %level [%thread] %logger{10} [%file:%line] %msg%n"
        ple.context = lc
        ple.start()
        val logFile = "$name.log"
        file = logFile
        encoder = ple
        context = lc
        start()
    }

    val logger: Logger = (LoggerFactory.getLogger(name) as ch.qos.logback.classic.Logger).apply {
        addAppender(fileAppender)
        level = Level.DEBUG
        isAdditive = false
    }

    val loggerName = name

    fun stop() {
        try {
            fileAppender.stop()
        } catch (e: Exception) {
            println("Could not close logger file appender $loggerName!")
        }
    }
}
