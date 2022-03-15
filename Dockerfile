FROM openjdk:11

RUN apt-get update

# Install python 3
RUN apt-get install python3 wget unzip dpkg

# Install dotnet sdk 6
RUN wget https://packages.microsoft.com/config/ubuntu/21.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb

RUN apt-get update; \
    apt-get install -y apt-transport-https && \
    apt-get update && \
    apt-get install -y dotnet-sdk-6.0

# Copy and setup Voyager
COPY release/voyager-full.zip /usr
WORKDIR /usr
RUN unzip voyager-full.zip

COPY docker-mission.yml /usr/voyager/mission.yml

WORKDIR /usr/voyager

ENTRYPOINT ["/usr/voyager/voyager.sh"]