FROM public.ecr.aws/amazonlinux/amazonlinux:2

RUN yum -y update && \
    yum -y install tar && \
    yum -y install gzip && \
    yum -y install awscli && \
    yum -y install gcc automake autoconf make ncurses-devel zlib-devel GeoIP-devel && \
    yum -y clean all

RUN curl -o goaccess-1.8.tar.gz https://tar.goaccess.io/goaccess-1.8.tar.gz && \
    tar -xzvf goaccess-1.8.tar.gz && \
    cd goaccess-1.8/ && \
    ./configure --enable-utf8 --enable-geoip=legacy && \
    make && \
    make install

ADD analyze.sh /analyze.sh
RUN chmod +x /analyze.sh

CMD ["/analyze.sh"]