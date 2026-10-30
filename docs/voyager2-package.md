# Voyager 2 Package

The Voyager 2 package, `voyager-full.zip`, holds the new Voyager engine (Voyager 2, or V2), the previous engine (Voyager 1, or V1) as a fallback, and the instruments.
You start it with `voyager.sh` or `voyager.bat`, as before. The launcher runs V2 first. If V2 cannot run, it runs the same mission with V1.

## What the Package Holds
Unzip `voyager-full.zip` to a folder of your choosing. You get a `voyager` folder, the `VOYAGER_HOME` folder of the [Quick Start](quickstart.md):

```text
voyager
    voyager.sh                  launcher for Mac / Linux
    voyager.bat                 launcher for Windows
    dx-voyager-macos-arm64      V2 for Mac (Apple Silicon)
    dx-voyager-macos-x64        V2 for Mac (Intel)
    dx-voyager-linux-x64        V2 for Linux
    dx-voyager-win-x64.exe      V2 for Windows
    dx-voyager.jar              V1
    .config.yml                 V1 global configuration
    .doctor.yml                 V1 runtime version checks
    mission.yml                 mission template
    instruments
        dxworks.<instrument>-<version>
        ...
    voyenv.yml                  the versions the package was built from
    README.md                   V1 notes on mission.yml and instrument.yml
    runtimes                    empty
```

* **V2** is one standalone program per platform. It does not need Node.js. The launcher picks the program for your system.
* **V1** is Voyager `v1.6.2`, packed with V2 in the release's `dx-voyager.zip`.
* **Instruments** are the ones listed in `voyenv.yml`, each at its pinned `tag`: inspector-git, insider, dude, lizard, honeydew, jafax, depminer and codeframe.

Each instrument folder can hold two descriptors: `instrument.v2.yml`, read by V2, and `instrument.yml`, read by V1.
V2 skips a folder without `instrument.v2.yml` and prints `Skipping directory '<folder>': missing instrument.v2.yml`.

## Requirements
V2 itself needs nothing installed. The instruments and V1 need these on the `PATH`:

| Runtime     | Needed by                                                                                     |
|-------------|-----------------------------------------------------------------------------------------------|
| Java 21     | V1 (`dx-voyager.jar`) and the Java instruments: inspector-git, insider, dude, jafax, depminer, codeframe |
| Python 3    | lizard, and the summary step of each instrument (`python3` on Mac / Linux, `py -3` on Windows) |
| .NET SDK 10 | honeydew                                                                                      |
| git         | inspector-git; the target folders are git repositories                                        |

`.doctor.yml` is V1's version check list. Its minimum versions are the ones above: Java 21, Python 3.9, .NET 10, git 2.12.

!!! note "Mac"
    The Mac programs carry an ad-hoc signature, not a Developer ID signature.
    If the zip was downloaded with a browser, macOS may block V2 ("Apple could not verify ..."), and the launcher then runs the mission with V1.
    To let V2 run, choose Open Anyway in System Settings › Privacy & Security, run the command again and confirm.

## Run a Mission

#### Configure the mission
Prepare the `TARGET` folder as in the [Quick Start](quickstart.md#prepare-target-folder).
Then open `mission.yml` in `VOYAGER_HOME` and fill in the `target` field (and, optionally, the `mission` name).
The fields are described in [Mission YAML File](mission.md). Keep the mission readable by V1 too, see [How the Fallback Works](#how-the-fallback-works).

#### Check the runtimes

=== "Windows"
    ```shell
    voyager.bat doctor
    ```
=== "Mac / Linux"
    ```shell
    ./voyager.sh doctor
    ```

`doctor` runs V2's `verify`: it checks the requirements each instrument declares in the `verify` action of its `instrument.v2.yml`. Instruments without a `verify` action are not listed in the report.
V1's version checks from `.doctor.yml` run with `java -jar dx-voyager.jar doctor`.

#### Run the instruments

=== "Windows"
    ```shell
    voyager.bat run
    ```
=== "Mac / Linux"
    ```shell
    ./voyager.sh run
    ```

Without a mission file, Voyager uses `mission.yml` from the current folder. To use another mission file, pass it with `-m`, e.g. `./voyager.sh run -m path/to/my-mission.yml`.

The results are written to the mission's `resultsPath`, or to `<mission>-voyager-results.zip` in the current folder.
The zip holds the instruments' results, the logs, an HTML mission report, the mission file and `voyager.lock.yml` (the instruments that ran, with their versions and run times).

#### Make the summaries
After the run, with the same mission:

=== "Windows"
    ```shell
    voyager.bat summary
    ```
=== "Mac / Linux"
    ```shell
    ./voyager.sh summary
    ```

Add `-m path/to/my-mission.yml` if the run used one.

* Each instrument with a `summary` action writes `summary.md` and `summary.html` to its own `instruments/<instrument>/results` folder.
* When the `voyager-summarizer` instrument is in the `instruments` folder, it runs last and combines them into `summary.md` and `summary.html` in its own `results` folder. It reads the run's results zip, so `summary` must come after `run`.
* The summaries stay in the instrument folders; they are not added to the results zip.
* If an instrument's summary files already exist, `summary` keeps them and does not run that instrument's summary step again.

## Commands

| Command                                     | What it does                                                    | If V2 fails                  |
|---------------------------------------------|-----------------------------------------------------------------|------------------------------|
| *(none)*                                    | V2 `run` with `mission.yml` from the current folder             | V1 runs `mission.yml`        |
| `run`                                       | V2 runs the instruments and writes the results zip              | V1 runs the same mission     |
| `<mission>` (a path without `-m`)           | V2 `run -m <mission>`, the V1 form `voyager.sh <mission>`        | V1 runs the mission          |
| `doctor`, `verify`                          | V2 `verify`: checks the instruments' requirements               | V1 `doctor`                  |
| `summary`                                   | V2 makes the summaries                                          | no fallback                  |
| `clean`                                     | V2 runs the instruments' `clean` actions (results of earlier runs) | no fallback               |
| `pack`                                      | V2 packs the instruments' results into the results zip          | no fallback                  |
| `unpack`                                    | V2 unpacks results zips, using the mission's `mapping`          | no fallback                  |
| `--version`, `-V`, `help`, `--help`, `-h`   | V2 version and help                                             | no fallback                  |

V2 options: `-m, --missionPath <file>` and `-v, --verbose` (full command details) on every command, and `-a, --actions <actions...>` on `run` (run only these actions).

## How the Fallback Works
* The launcher falls back when the V2 program for the system is missing, or when V2 exits with an error, including when the operating system stops it. It prints `Voyager2 failed (exit <code>).` and then `Falling back to Voyager1 mission run...` (or `doctor command...`).
* V1 then runs `java -Xmx8g -jar dx-voyager.jar <mission>`. The mission is the one given on the command line (`-m`, `--missionPath`, or the first word that is not an option), otherwise `mission.yml`.
* A failing instrument does not trigger the fallback: V2 marks the failed command in its mission summary and exits with 0.
* V1 reads the same mission file and runs the instruments that have an `instrument.yml`.
* V1 accepts only the mission fields `mission`, `target`, `resultsPath`, `instrumentsDir`, `environment` and `instruments` (in V1's form). A mission with V2-only fields, for example `runAll`, `mapping`, `variables` or `actions` under `instruments`, runs with V2, but V1 stops on it. The `mission.yml` template in the package uses only fields both engines read.
* For `doctor` and `verify`, the fallback runs V1's `doctor`, which checks the versions in `.doctor.yml`.
* `summary`, `clean`, `pack`, `unpack`, `--version` and `help` run with V2 only and return V2's exit code.

## How the Package Is Built
Two GitHub workflows build it, as for V1:

| Workflow                                                     | Trigger                      | Result                                                                                       |
|--------------------------------------------------------------|------------------------------|----------------------------------------------------------------------------------------------|
| `.github/workflows/release-voyager2.yml`                     | Pull request into `voyager2` | A workflow artifact `dx-voyager`. Each new run removes the artifact of the pull request's earlier runs. |
|                                                              | Tag `v2.*`                   | A draft release `Voyager <version>` with `dx-voyager.zip`. Publish it on GitHub to make it public. |
| Full Instrument Release (`full-instrument-release.yml` on `main`) | Run by hand             | `voyager-full.zip`, uploaded into the newest published release.                              |

`release-voyager2.yml` makes the engine zip, without instruments:

1. Builds the four V2 programs with Node.js 25 (single executable applications). The Mac programs get an ad-hoc signature. For a tag, V2's `--version` prints the tag's version; other builds print `dev`.
2. Downloads V1's `dx-voyager.zip` (`V1_VERSION` in the workflow, `v1.6.2`), copies the launchers over V1's own `voyager.sh` and `voyager.bat`, adds the V2 programs, and zips the `voyager` folder as `dx-voyager.zip`.

The Full Instrument Release runs `voyenv install` on `voyenv.yml`. It installs the engine from the release named by `voyager_version` (the file named by `voyager_asset`, `dx-voyager.zip`) and the instruments, each at its `tag`, and zips them as `voyager-full.zip`.

To release V2: set `voyager_version` in `voyenv.yml` on `main` to the new tag, push the tag, publish the draft release, then run the Full Instrument Release. The pins are set by hand. V2 is built from the commit the workflow runs on.
