FROM ubuntu:18.04
COPY . /app

FROM node:10.16.0

# nodejs for vscode plugin
RUN curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh -o install_nvm.sh && sh install_nvm.sh
ENV NVM_DIR="/root/.nvm"

RUN chmod o+x /root/.nvm/nvm.sh && /bin/bash -c "source /root/.nvm/nvm.sh && nvm install v12.0.0"
ENV PATH="/root/.nvm/versions/node/v12.0.0/bin/:${PATH}"

# nodejs
RUN mkdir -p /home/danawa/works
WORKDIR /home/danawa/works

# code-server
WORKDIR /home/danawa/.code-server
RUN wget https://github.com/cdr/code-server/releases/download/3.2.0/code-server-3.2.0-linux-x86_64.tar.gz \
    && tar xzf code-server-3.2.0-linux-x86_64.tar.gz -C ./ --strip-components 1 && rm code-server-3.2.0-linux-x86_64.tar.gz
ADD ./pages /home/danawa/.code-server/src/browser/pages

WORKDIR /home/danawa

CMD ["sh", "-c", "/home/danawa/.code-server/code-server --port 3333 --host 0.0.0.0"]