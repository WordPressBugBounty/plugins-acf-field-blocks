/* eslint-disable camelcase */
/* jshint node:true */
/* global require */
const fs = require( 'fs' );
const blocks = require( './blocks.json' );

module.exports = function( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );

	const sassFiles = {};

	const sourceFiles = [];

	Object.keys( blocks ).filter( block => blocks[ block ].assets !== undefined )
		.forEach( block => {
			Object.keys( blocks[ block ].assets ).forEach( s => {
				sassFiles[ `build/blocks/${ s }` ] = `src/${ blocks[ block ].assets[ s ] }`;
				sourceFiles.push( `src/${ blocks[ block ].assets[ s ] }` );
			});
		});

	grunt.initConfig({
		sass: {
			dist: {
				options: {
					sourcemap: false,
					style: 'compressed',
					loadPath: [ 'node_modules' ]
				},
				files: sassFiles
			}
		},
		watch: {
			sass: {
				files: sourceFiles,
				tasks: [ 'build' ],
				options: {
					atBegin: true
				}
			}
		}
	});

	grunt.registerTask( 'build', 'Generate CSS', function() {
		const done = this.async();

		function checkFlag() {
			if ( fs.existsSync( `./build/blocks/${ Object.keys( blocks )[0] }` ) ) {
				grunt.task.run( 'sass' );
				done();
			} else {
				grunt.log.writeln( 'Waiting...' );
				setTimeout( checkFlag, 5000 );
			}
		}

		checkFlag();
	});
};
