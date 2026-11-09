# Lowest versions that fit what the instruments need, the same ones .doctor.yml checks:
# .NET 10 SDK (honeydew targets net10.0 and loads projects through MSBuild, which needs the SDK),
# Java 21 (iglog and insider are built for 21), Python 3 (lizard) and git (iglog, doctor).
# The .NET image is Ubuntu 24.04, so Java, Python and git come from Ubuntu's own packages.
FROM mcr.microsoft.com/dotnet/sdk:10.0-noble

RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-21-jre-headless python3 git unzip && \
    rm -rf /var/lib/apt/lists/*

# Copy and setup Voyager
COPY release/voyager-full.zip /usr
WORKDIR /usr
RUN unzip voyager-full.zip

COPY docker-mission.yml /usr/voyager/mission.yml

WORKDIR /usr/voyager

ENTRYPOINT ["/usr/voyager/voyager.sh"]
