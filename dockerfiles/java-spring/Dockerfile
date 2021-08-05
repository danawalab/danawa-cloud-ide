FROM ubuntu:18.04
COPY . /app

FROM openjdk:11-slim

# GRADLE
RUN mkdir -p /home/danawa/works
WORKDIR /home/danawa/works
RUN apt-get update && apt-get install -y --no-install-recommends unzip && apt-get install -y --no-install-recommends curl wget gnupg less lsof net-tools git apt-utils -y \
    && apt-get install -y --no-install-recommends build-essential libssl-dev curl git-core && apt-get install -y --no-install-recommends emacs \
    && wget https://downloads.gradle.org/distributions/gradle-5.4.1-bin.zip && unzip gradle-5.4.1-bin.zip && rm gradle-5.4.1-bin.zip
ENV PATH="/works/gradle-5.4.1/bin:${PATH}"

# code-server
WORKDIR /home/danawa/.code-server
RUN wget https://github.com/cdr/code-server/releases/download/3.2.0/code-server-3.2.0-linux-x86_64.tar.gz \
    && tar xzf code-server-3.2.0-linux-x86_64.tar.gz -C ./ --strip-components 1 && rm code-server-3.2.0-linux-x86_64.tar.gz
ADD ./myapp /root/.local/share/code-server/User
ADD ./pages /home/danawa/.code-server/src/browser/pages

WORKDIR /home/danawa

CMD ["/bin/bash", "-c", "/home/danawa/.code-server/code-server --install-extension vscjava.vscode-java-pack --force && /home/danawa/.code-server/code-server --port 3333 --host 0.0.0.0"]