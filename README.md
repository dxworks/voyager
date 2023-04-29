# Dxworks Voyager

This project was generated using the `dxworks-template-node-ts` repository template.
## Installation

Use `npm` to install 

```bash
npm i -g @dxworks/voyager
```

## Usage

```shell
dx-voyager
```
or
```shell
dxw voyager
```

## Mission

### mission.yml

```yaml
# The name of the mission *required
mission: example-mission
# When 'runsAll' is false the mission will run only the instruments specified in instruments array
# default value: true
runAll: 
  
# A map of instrument names to commands and parameters.
# with the commands declared here, in this order.
instruments:

  # The id of the instrument as declared in instrument.yml
  My Instrument:
    actions:
      # The id of the action as declared in instrument.yml
      my action:
        # A map of parameter name to value that will be used for all the commands of this action
        parameters:
        # A map of environment variables name to value that will be used for all the commands of this action
        environment:
        # The id of the command as declared in instrument.yml
        my command:
          # A map of parameter name to value that will be used for this command
          parameters:
          # A map of environment variables name to value that will be used for this command
          environment:

# A map of environment variables, name to value, for voyager missions
# overwrites the variables from global config, instrument and command
environment:

# Path to the directory containing the instruments
# Default: ./instruments
instrumentsDir:

```

## Instruments

```yaml
# The name of the instrument 
name:
# The id of the instrument *required
id:
# The version of the instrument
version: 

# List of declared actions 
actions:
  # The id of the action
  my action:
    # A map of parameter name to value that will be used for this action commands
    parameters:
    # A map of environment variables name to value that will be used for this action commands
    environment:
    # List of this action commands
    commands: 
        # The name of the command
      - name:
        # The id of the command
        id:
        # The universal command for all systems
        command:
        # A map of parameter name to value that will be used for this command
        parameters:
        # A map of environment variables name to value that will be used for this command
        environment:
      - name:
        id:
        # The command defined for each system
        command:
          # The command for unix systems
          unix:
           # The command for mac systems
          mac: java -jar ${target}
          # The command for linux systems
          linux: java -jar ...
          # The command for windows systems
          windows: java -jar ...

```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[Apache-2.0](https://choosealicense.com/licenses/apache)
