## Voyager Docker Quickstart
The docker image for voyager is available on Dockerhub under the name [`dxworks/voyager`](https://hub.docker.com/repository/docker/dxworks/voyager).

## Prepare TARGET Folder
The `TARGET` folder is the folder that Voyager will analyze. The children of the `TARGET` folder should be folders that are git repositories.

To create a correct configuration for voyager, open a terminal window in a folder of your choosing and run the following steps:

#### Create an empty target folder
```shell
mkdir voyager-target
cd voyager-target
```

#### Clone repositories
Clone all repositories you want to analyze in the voyager-repos folder. Make sure to checkout the main branch for each repository.
```shell
git clone <repo1-url>
cd <repo1>
git checkout <repo1-main-branch>

git clone <repo2-url>
cd <repo2>
git checkout <repo2-main-branch>
```

### Final Structure:
In the end you should get a folder structure that looks like this:
```text
voyager-target
    repo1
        .git
        ...
    repo2
        .git
        ...
    ...
    repoN
        .git
        ...
```

### The TARGET Directory
The `TARGET` directory is the absolute path to the `voyager-target` folder defined in [the steps above](#Create an empty target folder).

## Prepare Docker run
The `dxworks/voyager` image is executable and needs 2 volumes to be mounted:

1. the `TARGET` path that needs to be mounted at `/usr/project`
2. The `results` folder, that needs to be mounted at `/usr/voyager/results`

## Run voyager

### Using Docker
To run voyager, run the following command from the `TARGET` directory:

```shell
mkdir results
docker run -v $(PWD):/usr/project -v $(PWD)/results:/usr/voyager/results dxworks/voyager
```
Alternatively, you can adjust the volume mounts to point to the `TARGET` folder and to a result folder.

You may also add any environment variables you would normally add to the `mission.yml` file, directly to the container. 
Check out the [docker documentation on how to add environment variables to containers](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file).

### Using docker-compose
If you prefer to use docker-compose, you may copy the following file to an empty folder:
```yaml
version: '3.8'

services:
  voyager:
    image: dxworks/voyager
    volumes:
      - ./results:/usr/voyager/results # please mount a new folder where the result archive will be added
      - .:/usr/project # please input the target folder you want to analyse
#      - ${custom-mission-path}: /usr/voyager/mission.yml

#    Add any environment variables you would pass to the mission.yml. For example:
#    environment:
#      IG_INCOGNITO: true
#      DUDE_LANGUAGES: typescript,kotlin
```
and modify the mount bindings according to your preference.

### Custom mission.yml file
If you want to customize the mission.yml file, you may locally create a `mission.yml` file starting from the following template and adding any `instruments` or `environment` information you need.:
```yaml
# The name of the mission *required
mission: docker

# The path to the target folder.
# The target folder should contain all repositories *required
target: /usr/project

# A map of instrument names to commands and parameters.
# When 'runsAll' is false the mission will run only the instruments
# with the commands declared here, in this order.
instruments:

# A map of environment variables, name to value, for voyager missions
# overwrites the variables from global config
environment:

# Path to the directory containing the instruments
# Default: ./instruments
instrumentsDir:

# Path to the result archive file
# Default: ./${mission}-voyager-results.zip
resultsPath: results/voyager-results.zip
```

To pass the file to the container, you need to mount the file into the container instead of the /usr/voyager/mission.yml file (see [docker-compose](#using-docker-compose) comments or use the [`--mount` option](https://docs.docker.com/storage/bind-mounts/) with `docker run` command)

## Verify And View Results
When the voyager execution finishes, Voyager prints a Summary of all commands in the console. Please make sure that most of the tools have successfully executed.

The results will be located in the **result folder** you mounted at `/usr/voyager/results` under the name **`voyager-results.zip`**.
