package org.dxworks.voyager

import org.dxworks.argumenthor.Argumenthor
import org.dxworks.argumenthor.config.ArgumenthorConfiguration
import org.dxworks.argumenthor.config.fields.impl.StringField
import org.dxworks.argumenthor.config.sources.impl.ArgsSource
import org.dxworks.voyager.config.ConfigurationProcessor
import org.dxworks.voyager.config.baseAnalysisFolder
import org.dxworks.voyager.config.toolHomeField
import org.dxworks.voyager.results.ResultsPackager
import org.dxworks.voyager.runners.impl.CommandLineRunner
import org.dxworks.voyager.tools.Tool
import org.dxworks.voyager.tools.ToolGatherer
import org.slf4j.LoggerFactory
import java.nio.file.Paths
import kotlin.system.exitProcess

private const val base = "base"
private const val tools = "tools"

private val log = LoggerFactory.getLogger("Main")
fun main(args: Array<String>) {
    val (tools, baseFolder) = prepareTools(args)

    val configurationProcessor = ConfigurationProcessor.get()
    configurationProcessor.addValue(baseAnalysisFolder, baseFolder)

    val commandLineRunner = CommandLineRunner(Paths.get(baseFolder).toFile())

    val results = tools.map { commandLineRunner.run(it) }

    val resultsPaths = results.filterNot { it.hasErrors() }
        .filter { it.results.isNotEmpty() }
        .map { it.tool.process(it.tool.configuration.resultsPath) }

    log.info(if (resultsPaths.isEmpty()) "Nothing to package" else "Packaging results")

    ResultsPackager().packageResults(resultsPaths)

    log.info("Done")
}

private fun prepareTools(args: Array<String>): Pair<List<Tool>, String> {
    val argumenthor = getArgumenthor(args)

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

private fun getTemplateFields(
    tool: Tool,
    baseFolder: String
) = mapOf(toolHomeField to tool.path, baseAnalysisFolder to baseFolder)

private fun getArg(argumenthor: Argumenthor, arg: String) =
    argumenthor.getValue<String>(arg)?.trim('\"', '\'')


private fun getArgumenthor(args: Array<String>) = Argumenthor(ArgumenthorConfiguration(
    StringField(base, System.getProperty("user.home") + "/repos"),
    StringField(tools, ".")
).apply {
    addSource(ArgsSource().also { it.argsList = args.toList() })
})
