package org.dxworks.voyager

import org.dxworks.argumenthor.Argumenthor
import org.dxworks.argumenthor.config.ArgumenthorConfiguration
import org.dxworks.argumenthor.config.fields.impl.StringField
import org.dxworks.argumenthor.config.sources.impl.ArgsSource
import org.dxworks.voyager.config.ConfigurationProcessor
import org.dxworks.voyager.config.ToolConfiguration
import org.dxworks.voyager.config.baseAnalysisFolder
import org.dxworks.voyager.results.ResultsPackager
import org.dxworks.voyager.runners.impl.CommandLineRunner
import org.dxworks.voyager.tools.Tool
import org.dxworks.voyager.tools.ToolGatherer
import org.slf4j.LoggerFactory
import java.nio.file.Paths
import kotlin.system.exitProcess

private const val base = "base"
private const val tools = "tools"
private const val toolsConfig = "toolsConfig"
private const val defaultToolsConfig = "toolsConfig.yml"

private val log = LoggerFactory.getLogger("Main")

fun main(args: Array<String>) {
    val argumenthor = getArgumenthor(args)
    val (tools, baseFolder) = prepareTools(argumenthor)

    val configurationProcessor = ConfigurationProcessor.get()
    configurationProcessor.setConfigurationSource(argumenthor.getValue("toolsConfig")!!)
    configurationProcessor.addValue(baseAnalysisFolder, baseFolder)

    val commandLineRunner = CommandLineRunner(Paths.get(baseFolder).toFile())

    val results = tools.map { commandLineRunner.run(it) }

    val resultsPaths = results.filterNot { it.hasErrors() }
        .filter { it.results.isNotEmpty() }
        .map { it.tool.process(ToolConfiguration::resultsPath) }

    log.info(if (resultsPaths.isEmpty()) "Nothing to package" else "Packaging results")

    ResultsPackager().packageResults(resultsPaths)

    log.info("Done")
}

private fun prepareTools(argumenthor: Argumenthor): Pair<List<Tool>, String> {
    val toolsLocation = getArg(argumenthor, tools)
    val toolGatherer = if (toolsLocation != null) ToolGatherer(toolsLocation) else {
        log.error("Could not read tools location")
        exitProcess(1)
    }
    val baseFolder = getArg(argumenthor, base)
    if (baseFolder == null) {
        log.error("Could not read base folder")
        exitProcess(1)
    }
    val tools = toolGatherer.tools
    if (tools.isEmpty()) {
        log.warn("No tools found, nothing to run")
        exitProcess(1)
    }
    return Pair(tools, baseFolder)
}

private fun getArg(argumenthor: Argumenthor, arg: String) =
    argumenthor.getValue<String>(arg)?.trim('\"', '\'')


private fun getArgumenthor(args: Array<String>) = Argumenthor(ArgumenthorConfiguration(
    StringField(base, System.getProperty("user.home") + "/repos"),
    StringField(tools, "."),
    StringField(toolsConfig, defaultToolsConfig)
).apply {
    addSource(ArgsSource().also { it.argsList = args.toList() })
})
