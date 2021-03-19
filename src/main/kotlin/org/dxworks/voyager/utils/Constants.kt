package org.dxworks.voyager.utils

import java.nio.file.Path

const val target = "target"
const val instruments = "instruments"
const val mission = "mission"
const val runFieldName = "run"

const val instrumentHome = "instrument"
const val repoFolder = "repo"
const val repoName= "repoName"

const val defaultInstrumentConfig = "instrument.yml"
const val defaultMissionConfig = "mission.yml"

const val defaultContainerName = "data-container.zip"
const val missionReport = "mission-report"

const val globalConfigName = ".config.yml"
val home = Path.of(System.getProperty("user.home")).resolve(".voyager").toFile().apply { mkdir() }
