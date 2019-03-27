FROM arm32v7/node:11.12.0

RUN mkdir -p /var/lib/
WORKDIR /var/lib/

RUN git clone https://github.com/tuzzmaniandevil/rpi-tempmonitor.git

WORKDIR /var/lib/rpi-tempmonitor
RUN npm install

CMD ["node", "./bin/www.js"]