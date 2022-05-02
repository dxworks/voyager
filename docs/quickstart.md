## Download Assets

#### VOYAGER_HOME Folder
Download a Voyager archive and unzip it to a folder of your choosing. We will call this folder `VOYAGER_HOME`. 
The latest Voyager archive with all instruments is available [here](https://github.com/dxworks/voyager/releases/download/v1.6.1/voyager-full.zip).
If you want to run Voyager in Docker, please visit our [Voyager Docker Quickstart Guide](docker-quickstart.md).

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

## Configure Mission
Open the `mission.yml` file from the [`VOYAGER_HOME`](#voyager_home-folder) folder in a text editor and fill in the `target` field with the [`TARGET`](#the-target-directory) directory.

```yaml
# The path to the target folder.
# The target folder should contain all repositories *required
target: <path/to/TARGET>
```

Optionally, you can give your mission a special name, usually the name of the system it is analyzing
```yaml
# The name of the mission *required
mission: <system-name>
```


## Verify Runtimes are properly installed
To check that Voyager has access to all required runtime environments, open a terminal window in the [VOYAGER_HOME](#voyager_home-folder) folder and run the following command:


=== "Windows"
    ```shell
    voyager.bat doctor
    ```
=== "Mac / Linux"
    ```shell
    ./voyager.sh doctor
    ```

Please check that all version checks have passed.
!!! attention
    If the versions have not passed, please make sure you have the required runtime dependencies installed and available on the path.
    Try to run the doctor command again, until it passes.

## Run voyager
To run voyager, run the following command:

=== "Windows"
    ```shell
    voyager.bat 
    ```
=== "Mac / Linux"
    ```shell
    ./voyager.sh 
    ```

## Verify And View Results
When the voyager execution finishes, Voyager prints a Summary of all commands in the console. Please make sure that most of the tools have successfully executed.

The results will be located in the **$missionName-voyager-results.zip** archive.
