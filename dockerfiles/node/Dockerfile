FROM ubuntu:18.04
COPY . /app

RUN apt-get update
RUN apt install docker.io -y

FROM node:10.16.0

# nodejs for vscode plugin
RUN curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh -o install_nvm.sh
RUN sh install_nvm.sh
ENV NVM_DIR="/root/.nvm"

RUN chmod o+x /root/.nvm/nvm.sh
RUN /bin/bash -c "source /root/.nvm/nvm.sh && nvm install v12.0.0"
ENV PATH="/root/.nvm/versions/node/v12.0.0/bin/:${PATH}"

VOLUME /var/run/docker.sock:/var/run/docker.sock

# nodejs
RUN mkdir -p /home/danawa/works
WORKDIR /home/danawa/works

# code-server
WORKDIR /home/danawa/.code-server
RUN wget https://github.com/cdr/code-server/releases/download/3.2.0/code-server-3.2.0-linux-x86_64.tar.gz
RUN tar -xvzf code-server-3.2.0-linux-x86_64.tar.gz -C ./ --strip-components 1
WORKDIR /home/danawa

CMD ["/bin/bash", "-c", "nohup dockerd >/dev/null 2>&1 && /home/danawa/.code-server/code-server --port 3333 --host 0.0.0.0 --auth none"]