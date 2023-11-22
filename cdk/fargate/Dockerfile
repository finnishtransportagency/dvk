FROM public.ecr.aws/amazonlinux/amazonlinux:latest

RUN yum -y update && \
    yum -y install tar && \
    yum -y install gzip && \
    yum -y install awscli && \
    yum -y install gcc automake autoconf make ncurses-devel zlib-devel && \
    yum -y clean all

RUN curl -o goaccess-1.8.tar.gz https://tar.goaccess.io/goaccess-1.8.tar.gz && \
    tar -xzvf goaccess-1.8.tar.gz && \
    cd goaccess-1.8/ && \
    ./configure --enable-utf8 && \
    make && \
    make install

ADD analyze.sh /analyze.sh
RUN chmod +x /analyze.sh

CMD ["/analyze.sh"]