.PHONY:	all
all:	clean	\
	build	\
	test


.PHONY:	clean
clean:
	@if [ -d 'node_modules' ]; then	\
		rm -rf 'node_modules';	\
	fi


.PHONY:	build
build:
	npm install


.PHONY:	test
test:
	nodejs 'make-static.js' 'https://example.net'

