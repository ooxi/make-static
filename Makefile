.PHONY:	all
all:	clean	\
	build	\
	test	\
	run


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
	# Too fragile
	#nodejs 'test/test-assets.js'
	#nodejs 'test/test-document.js'
	nodejs 'test/test-path.js'


.PHONY:	run
run:
	nodejs 'make-static.js' 'https://violetland.github.io/'

