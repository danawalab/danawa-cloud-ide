FROM ubuntu:18.04
COPY . /app

FROM openjdk:11

# GRADLE
RUN mkdir -p /home/danawa/works
WORKDIR /home/danawa/works

RUN apt-get update
RUN apt install docker.io -y
VOLUME /var/run/docker.sock:/var/run/docker.sock

RUN apt-get install -y curl wget gnupg less lsof net-tools git apt-utils -y
RUN apt-get install -y build-essential libssl-dev curl git-core
RUN apt-get install -y emacs

RUN wget https://downloads.gradle.org/distributions/gradle-5.4.1-bin.zip
RUN unzip gradle-5.4.1-bin.zip
ENV PATH="/works/gradle-5.4.1/bin:${PATH}"
RUN rm gradle-5.4.1-bin.zip

# code-server
WORKDIR /home/danawa/.code-server
RUN wget https://github.com/cdr/code-server/releases/download/3.2.0/code-server-3.2.0-linux-x86_64.tar.gz
RUN tar xzf code-server-3.2.0-linux-x86_64.tar.gz -C ./ --strip-components 1

ADD ./myapp /root/.local/share/code-server/User
WORKDIR /home/danawa

CMD ["/bin/bash", "-c", "nohup dockerd >/dev/null 2>&1 & /home/danawa/.code-server/code-server --install-extension vscjava.vscode-java-pack --force && /home/danawa/.code-server/code-server --port 3333 --host 0.0.0.0 --auth none"]