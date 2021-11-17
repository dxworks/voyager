Voyenv declares the voyager release in a `yml` file.
A voyenv.yml example:

```yaml
# Name of the release (a folder with this name will be created in the working directory)
name: voyager-test-1
# The Voyager version to download. See at https://github.com/dxworks/voyager/releases 
voyager_version: v1.4.1
# A list of instruments to download (from Github only)
instruments:
    # Name in owner/repo format
  - name: dxworks/voyager-git-log-instrument
    # The tag to find the specific release / tag
    # If not specified voyenv pulls all tags matching v*-voyager 
    # and chooses the one with the highest semver
    tag: v1.0.0
    # The asset to download from the release 
    # If not specified, the source code zip for the tag will be downloaded
    asset: git-log.zip
  - name: dxworks/lizard
#    tag: v1.17.9-voyager
  - name: dxworks/metrixplusplus
#    tag: v1.7.1-voyager
  - name: dxworks/inspector-git
    asset: iglog.zip
  - name: dxworks/dude
    asset: dude-voyager.zip
  - name: dxworks/insider
    asset: insider-voyager.zip
  - name: dxworks/honeydew
    asset: honeydew.zip
  - name: dxworks/jafax
    asset: jafax.zip
  - name: dxworks/maven-miner
    asset: maven-miner-voyager.zip
  - name: dxworks/npm-miner
    asset: npm-miner-voyager.zip

# A list of Github tokens. To get the latest tagged release of a voyager instrument,
# voyenv uses the Github Rest API. Due to rate limits of the Github Rest API
# it might be the case that the voyenv installation will stop due to rate limits.
# To avoid this, generate a Github Personal Access token and add it here
tokens:

# A map of runtimes please check the runtimes configuration section for more details
runtimes:
  java:
    version: 11
    platform: mac
    arch: x64
  python:
    version: 3.9.4
    platform: mac
    arch: x86_64

```

## Instruments Configuration
TBA

## Runtimes Configuration
Currently, Voyenv only supports adding Java and Python runtime environments.

The options you have to configure the two runtimes are:
```yaml
    # get java versions from https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/tag/jdk-11.0.11%2B9_openj9-0.26.0 or api from https://api.adoptopenjdk.net/q/swagger-ui/#/Assets/searchReleases
    # getting java options by calling links like https://api.adoptopenjdk.net/v3/assets/feature_releases/11/ga?architecture=x64&jvm_impl=hotspot&os=macos
    java:
        version: 11.1
        platform: windows | linux | mac
        arch: x86 | x64

    # get python runtimes from https://github.com/indygreg/python-build-standalone/releases
    python:
        version: 3.9.1
        platform: windows | linux | mac
        arch: x86 | x64 | ...
    
```
