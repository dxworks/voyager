# Dx-Voyager

---
Voyager's main purpose is to help extract data from software systems in a unified way. It runs a suit of configurable
instruments according to a mission configuration.

Please take a look at how to configure and run Voyager below.

## Mission

---

### mission.yml

```yaml
# The name of the mission *required
mission:

# The path to the target folder.
# The target folder should contain all repositories *required 
target:

# A map of instrument names to commands and parameters.
# When 'runsAll' is false the mission will run only the instruments 
# with the commands declared here, in this order.
instruments:

  # The name of the instrument as declared in instrument.yml
  Instrument Name:

    # The list of commands to run. Names as declared in instrument.yml
    # If empty or not specified, voyager will run all commands from the instrument 
    commands:

    # A map of parameter name to value
    parameters:

      # A special parameter that overrides the instruments setting to run on the 
      # target directory or on all the projects within the target
      # Values: onEach, once, never
      run:

# A map of environment variables, name to value, for voyager missions
# overwrites the variables from global config
environment:

# Path to the directory containing the instruments
# Default: ./instruments 
instrumentsDir:
```

Example

```yaml
mission: Git information gathering
target: /home/projects
instruments:
  Git log:
    commands:
      - git log
    parameters:
      branch: main
```

## Global Config

---
The global config if needed should be located at `./.config.yml` and have the following structure

```yaml
# Specifies if voyager should run the instruments and commands according to the mission 
# or should it run all found instruments with all commands
# default true
runsAll:

# A map of runtime name to a path that will be added to the PATH env variable
# for voyager missions
runtimes:

# A map of environment variables, name to value, for voyager missions
environment:

# A default value for the instruments directory
# Default: ./instruments
instrumentsDir:
```

Example

```yaml
runsAll: false

runtimes:
  java-11: environments/jdk-11.0.10/bin
  python-3: environments/python-3.9.2-embed-amd64
  node-14: environments/node-v14.16.0-win-x64

environment:
  LINE_THRESHOLD: 3

instrumentsDir: ./mySpecialInstruments
```

## Instruments

---
An instrument is a list of configurable commands that should be run in an order on the target folder or on each project
folder separately. It may also declare some result folders and files that will be packaged in the mission's data
container.

By definition an instrument is a directory containing an instrument.yml file. All instrument directories should be
located in the instrument's directory.

### instrument.yml

```yaml
# The name of the instrument *required
name:

# Specifies if the instrument should run on the target directory or 
# on all the projects within the target (once / onEach / never)
# Default: once
run:

# List of directories and file globs that should be added to the 
# mission's data container 
results:

  # The path of the directory relative to . *required
  - dir:

    # The list of globs. Matching files are included in the data-container
    files:

# List of declared commands 
commands:

  # The name of the command *required
  - name:

    # The command for windows systems
    win:

    # The command for unix based systems
    unix:

    # A map of name to value that will be added to 
    # the environment variables for this command
    # overwrites all other environment variables
    environment:

    # The working directory for the command
    # Default: ${instrument} the instrument's path
    dir:

# A map of name to value that will be added to 
# the environment variables for all commands of this instrument
# overwrites environment variables from mission
environment:

# The map of parameters to be used in the configuration
# Voyager defined parameters:
#                   instrument: the path to the instrument's directory
#                   repo: the path to the current analysis directory (target/project)
#                   repoName: the name of the current analysis directory (target/project)
parameters:
```

Example

```yaml
name: Git log
run: onEach
results:
  - dir: ${instrument}/results
    files:
      - "*.git"
commands:
  - name: git log
    win: git log  > "${instrument}/results/${repoName}.git"
    unix: git log > "${instrument}/results/${repoName}.git"
    dir: ${repo}
```

## Running Dx-Voyager

---

If the mission is in the default location `./mission.yml` then you can run voyager with `java -jar dx-voyager.jar`
, `voyager.sh` or `voyager.bat`

Otherwise, run voyager using `voyager.sh -mission="path to mission"`

If the instruments are not in the default location `./instruments` then specify the instrumentsDir in mission.yml

### Results

The results declared by the instruments will be packaged in ./data-container.zip

## Version Doctor

---

`voyager.sh doctor` or `voyager.sh doctor /path/to/doctor.yml`

This command is used to verify the versions for the needed runtimes.

Example

```yaml
versions:
  -
  # The name of the runtime to be checked
  - name: Java

    # The minimum version required for the runtime
    min: 15

    # The command to get the response containing the version
    win: java -version

    # The command to get the response containing the version
    unix: java -version

    # The regex patterns containing the version group
    # used to match the output of the command  
    match:
      - java version "(?<version>.+)".*
      - (?i)openjdk(?-i) version "(?<version>.+)"

  - name: Python
    min: 3.8
    win: python -V
    unix: python -V
    match:
      - Python (?<version>.+)
  - name: Node
    min: 12
    win: node -v
    unix: node -v
    match:
      - v(?<version>.+)

```
