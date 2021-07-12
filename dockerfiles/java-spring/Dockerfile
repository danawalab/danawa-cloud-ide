FROM ubuntu:18.04
COPY . /app

FROM openjdk:11

# GRADLE
RUN mkdir -p /home/danawa/works
WORKDIR /home/danawa/works

RUN apt-get update
RUN apt-get install -y curl wget gnupg less lsof net-tools git apt-utils -y
RUN apt-get install -y build-essential libssl-dev curl git-core
RUN apt-get install -y emacs

RUN wget https://downloads.gradle.org/distributions/gradle-5.4.1-bin.zip
RUN unzip gradle-5.4.1-bin.zip
ENV PATH="/works/gradle-5.4.1/bin:${PATH}"

# java
RUN ${GIT_REP}
RUN rm gradle-5.4.1-bin.zip

# code-server
WORKDIR /home/danawa/.code-server
RUN wget https://github.com/cdr/code-server/releases/download/2.1638-vsc1.39.2/code-server2.1638-vsc1.39.2-linux-x86_64.tar.gz
RUN tar xzf code-server2.1638-vsc1.39.2-linux-x86_64.tar.gz -C ./ --strip-components 1

WORKDIR /home/danawa

# -p 10000 => 지정할 컨테이너 번호 
CMD ["sh", "-c", "${MYSQL} && /home/danawa/.code-server/code-server --auth none --port 3333"]