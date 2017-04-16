FROM scratch
COPY ./ca-certificates.crt /etc/ssl/certs/
ADD ./apiserver apiserver
EXPOSE 443
ENTRYPOINT ["/apiserver"]
