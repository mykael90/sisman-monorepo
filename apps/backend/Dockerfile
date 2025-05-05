FROM node:21-slim

RUN apt update && apt install -y openssl procps

# RUN npm install -g @nestjs/cli@10.3.2 @prisma/client

#non-root user
USER node

RUN mkdir /home/node/sisman-be/

WORKDIR /home/node/sisman-be/

CMD ["/home/node/sisman-be/.docker/start-dev.sh"]