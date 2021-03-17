package org.dxworks.voyager

import org.dxworks.argumenthor.Argumenthor
import org.dxworks.argumenthor.config.ArgumenthorConfiguration
import org.dxworks.argumenthor.config.fields.impl.StringField
import org.dxworks.argumenthor.config.sources.impl.ArgsSource
import org.dxworks.voyager.config.ConfigurationProcessor
import org.dxworks.voyager.instruments.Instrument
import org.dxworks.voyager.instruments.InstrumentGatherer
import org.dxworks.voyager.results.ResultsLocator
import org.dxworks.voyager.results.ResultsPackager
import org.dxworks.voyager.runners.impl.CommandLineRunner
import org.slf4j.LoggerFactory
import java.nio.file.Path
import kotlin.system.exitProcess

private const val site = "site"
private const val instruments = "instruments"
private const val voyagerConfig = "voyagerConfig"
private const val defaultVoyagerConfig = "voyager.yml"

private val log = LoggerFactory.getLogger("Main")

fun main(args: Array<String>) {
    val argumenthor = getArgumenthor(args)
    val (instruments, site) = prepareTools(argumenthor)
    ConfigurationProcessor.get().setConfigurationSource(argumenthor.getValue(voyagerConfig)!!)

    val commandLineRunner = CommandLineRunner(Path.of(site).toFile())

    val results = instruments.map { commandLineRunner.run(it) }

    val resultsLocator = ResultsLocator()

    val instrumentResults = results.filterNot { it.hasErrors() }
        .map { resultsLocator.locate(it.instrument) }

    log.info(if (instrumentResults.isEmpty()) "Nothing to package" else "Packaging results")

    ResultsPackager().packageResults(instrumentResults)

    log.info("Done")
}

private fun prepareTools(argumenthor: Argumenthor): Pair<List<Instrument>, String> {
    val toolsLocation = getArg(argumenthor, instruments)
    val instrumentGatherer = if (toolsLocation != null) InstrumentGatherer(toolsLocation) else {
        log.error("Could not read tools location")
        exitProcess(1)
    }
    val site = getArg(argumenthor, site)
    if (site == null) {
        log.error("Could not read base folder")
        exitProcess(1)
    }
    val instruments = instrumentGatherer.instruments
    if (instruments.isEmpty()) {
        log.warn("No tools found, nothing to run")
        exitProcess(1)
    }
    return Pair(instruments, site)
}

private fun getArg(argumenthor: Argumenthor, arg: String) =
    argumenthor.getValue<String>(arg)?.trim('\"', '\'')


private fun getArgumenthor(args: Array<String>) = Argumenthor(ArgumenthorConfiguration(
    StringField(site, System.getProperty("user.home") + "/repos"),
    StringField(instruments, "."),
    StringField(voyagerConfig, defaultVoyagerConfig)
).apply {
    addSource(ArgsSource().also { it.argsList = args.toList() })
})
