# Lowest versions that fit what the instruments need, the same ones .doctor.yml checks:
# .NET 10 SDK (honeydew targets net10.0 and loads projects through MSBuild, which needs the SDK),
# Java 21 (iglog and insider are built for 21), Python 3 (lizard) and git (iglog, doctor).
# The .NET image is Ubuntu 24.04, so Java, Python and git come from Ubuntu's own packages.
FROM mcr.microsoft.com/dotnet/sdk:10.0-noble

RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends openjdk-21-jre-headless python3 git unzip && \
    rm -rf /var/lib/apt/lists/*

# UTF-8 locale, so Java can open files with non-ASCII names.
ENV LANG=C.UTF-8

# Copy and setup Voyager: the bundle of the image's own architecture (docker buildx sets TARGETARCH),
# read through a bind mount so the other architecture's bundle never lands in a layer
ARG TARGETARCH
WORKDIR /usr
RUN --mount=type=bind,source=release,target=/tmp/release \
    case "$TARGETARCH" in amd64) p=linux-x64 ;; arm64) p=linux-arm64 ;; *) echo "unsupported TARGETARCH '$TARGETARCH'" >&2; exit 1 ;; esac && \
    unzip -q "/tmp/release/voyager-full-$p.zip"

COPY docker-mission.yml /usr/voyager/mission.yml

WORKDIR /usr/voyager

ENTRYPOINT ["/usr/voyager/voyager.sh"]
