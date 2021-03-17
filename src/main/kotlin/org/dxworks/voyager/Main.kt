package org.dxworks.voyager

import org.dxworks.argumenthor.Argumenthor
import org.dxworks.argumenthor.config.ArgumenthorConfiguration
import org.dxworks.argumenthor.config.fields.impl.StringField
import org.dxworks.argumenthor.config.sources.impl.ArgsSource
import org.dxworks.voyager.config.ConfigurationProcessor
import org.dxworks.voyager.results.ResultsLocator
import org.dxworks.voyager.results.ResultsPackager
import org.dxworks.voyager.runners.impl.CommandLineRunner
import org.dxworks.voyager.tools.InstrumentGatherer
import org.dxworks.voyager.tools.Tool
import org.slf4j.LoggerFactory
import java.nio.file.Path
import kotlin.system.exitProcess

private const val site = "site"
private const val instruments = "instruments"
private const val toolsConfig = "toolsConfig"
private const val defaultToolsConfig = "toolsConfig.yml"

private val log = LoggerFactory.getLogger("Main")

fun main(args: Array<String>) {
    val argumenthor = getArgumenthor(args)
    val (tools, site) = prepareTools(argumenthor)
    ConfigurationProcessor.get().setConfigurationSource(argumenthor.getValue(toolsConfig)!!)

    val commandLineRunner = CommandLineRunner(Path.of(site).toFile())

    val results = tools.map { commandLineRunner.run(it) }

    val resultsLocator = ResultsLocator()

    val resultsPaths = results.filterNot { it.hasErrors() }
        .flatMap { resultsLocator.locate(it.tool) }

    log.info(if (resultsPaths.isEmpty()) "Nothing to package" else "Packaging results")

    ResultsPackager().packageResults(resultsPaths)

    log.info("Done")
}

private fun prepareTools(argumenthor: Argumenthor): Pair<List<Tool>, String> {
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
    val instruments = instrumentGatherer.tools
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
    StringField(toolsConfig, defaultToolsConfig)
).apply {
    addSource(ArgsSource().also { it.argsList = args.toList() })
})
