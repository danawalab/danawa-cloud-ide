FROM ubuntu:18.04
COPY . /app

FROM node:10.16.0

# nodejs for vscode plugin
RUN curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh -o install_nvm.sh
RUN sh install_nvm.sh
ENV NVM_DIR="/root/.nvm"

RUN chmod o+x /root/.nvm/nvm.sh
RUN /bin/bash -c "source /root/.nvm/nvm.sh && nvm install v12.0.0"
ENV PATH="/root/.nvm/versions/node/v12.0.0/bin/:${PATH}"

# nodejs
RUN mkdir -p /home/danawa/works
WORKDIR /home/danawa/works
RUN ${GIT_REP}

# code-server
WORKDIR /home/danawa/.code-server
RUN wget https://github.com/cdr/code-server/releases/download/2.1638-vsc1.39.2/code-server2.1638-vsc1.39.2-linux-x86_64.tar.gz
RUN tar xzf code-server2.1638-vsc1.39.2-linux-x86_64.tar.gz -C ./ --strip-components 1

WORKDIR /home/danawa

# -p 10000 => 지정할 컨테이너 번호 
CMD ["sh", "-c", "${MYSQL} && /home/danawa/.code-server/code-server --auth none --port 3333"]