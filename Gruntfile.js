/*global require*/

/**
 * When grunt command does not execute try these steps:
 *
 * - delete folder 'node_modules' and run command in console:
 *   $ npm install
 *
 * - Run test-command in console, to find syntax errors in script:
 *   $ grunt hello
 */

module.exports = function(grunt) {

	// Show elapsed time at the end.
	require('time-grunt')(grunt);

	// Load all grunt tasks.
	require('load-grunt-tasks')(grunt);

	var buildtime = new Date().toISOString();
	var buildyear = 1900 + new Date().getYear();
	var buildtimestamp = new Date().getTime();

	var conf = {
		buildtime: buildtime,

		// Concatenate those JS files into a single file (target: [source, source, ...]).
		js_files_concat: {
		},

		// SASS files to process. Resulting CSS files will be minified as well.
		css_files_compile: {
			"assets/css/frontend/settings.css": "assets/sass/frontend/settings.scss",
			"assets/css/frontend/style.css": "assets/sass/frontend/style.scss",
		},

		// BUILD patterns to exclude code for specific builds.
		replaces: {
			patterns: [
				{
					match: /BUILDTIMESTAMP/g,
					replace: buildtimestamp
				}, {
					match: /BUILDTIME/g,
					replace: buildtime
				}, {
					match: /BUILDYEAR/g,
					replace: buildyear
				},
				{
					match: /THEME_AUTHOR_NAME/g,
					replace: '<%= pkg.author[0].name %>'
				}, {
					match: /THEME_AUTHOR_URI/g,
					replace: '<%= pkg.author[0].uri %>'
				}, {
					match: /THEME_DESCRIPTION/g,
					replace: '<%= pkg.description %>'
				}, {
					match: /THEMENAME/g,
					replace: '<%= pkg.title %>'
				}, {
					match: /THEME_TEXT_DOMAIN/g,
					replace: '<%= pkg.name %>'
				}, {
					match: /THEME_REQUIRES_PHP/g,
					replace: '<%= pkg.requires.PHP %>'
				}, {
					match: /THEME_REQUIRES_WORDPRESS/g,
					replace: '<%= pkg.requires.WordPress %>'
				}, {
					match: /THEME_TAGLINE/g,
					replace: '<%= pkg.tagline %>'
				}, {
					match: /THEME_TAGS/g,
					replace: '<%= pkg.tags %>'
				}, {
					match: /THEME_TESTED_WORDPRESS/g,
					replace: '<%= pkg.tested.WordPress %>'
				}, {
					match: /THEME_TILL_YEAR/g,
					replace: buildyear
				}, {
					match: /THEME_TITLE/g,
					replace: '<%= pkg.title %>'
				}, {
					match: /THEME_URI/g,
					replace: '<%= pkg.uri %>'
				}, {
					match: /THEME_VERSION/g,
					replace: '<%= pkg.version %>'
				}, {
					match: /^Version: .+$/g,
					replace: 'Version: <%= pkg.version %>'
				},
			],

			// Files to apply above patterns to (not only php files).
			files: {
				expand: true,
				src: [
					"**/*.php",
					"**/*.css",
					"**/*.js",
					"**/*.html",
					"**/*.txt",
					"!node_modules/**",
					"!lib/**",
					"!docs/**",
					"!release/**",
					'!release/**/languages/*.mo',
					"!Gruntfile.js",
					"!build/**",
					"!tests/**",
					"!.git/**",
					"!vendor/**",
					'!release/**/*.ico',
					'!release/**/*.gif',
					'!release/**/images/**',
					'!release/**/*.jpg',
					'!release/**/languages/*.mo',
					'!release/**/*.png',
					'!release/**/*.webp',
				],
				dest: "./release/<%= pkg.name %>/",
			},
		},

		// Regex patterns to exclude from transation.
		translation: {
			ignore_files: [
				"node_modules/.*",
				"(^.php)", // Ignore non-php files.
				"inc/external/.*", // External libraries.
				"release/.*", // Temp release files.
				"tests/.*", // Unit testing.
			],
			pot_dir: "languages/", // With trailing slash.
			textdomain: "<%= pkg.name %>",
		},

		dir: "<%= pkg.name %>/",
	};

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// JS - Concat .js source files into a single .js file.
		concat: {
			options: {
				stripBanners: true,
				banner: '/*! <%= pkg.title %> - v<%= pkg.version %>\n' +
				' * <%= pkg.homepage %>\n' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %>;\n' +
				' * Licensed GPLv2+\n' +
				' */\n'
			},
			scripts: {
				files: conf.js_files_concat
			}
		},

		// JS - Validate .js source code.
		jshint: {
			all: ['Gruntfile.js', 'assets/scripts/src/**/*.js'],
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				globals: {
					exports: true,
					module: false
				}
			}
		},

		// JS - Uglyfies the source code of .js files (to make files smaller).
		uglify: {
			my_target: {
				files: [{
					expand: true,
					src: [
						'assets/scripts/*.js',
						'!assets/scripts/*.min.js'
					],
					dest: '.',
					cwd: '.',
					rename: function(dst, src) {

						// To keep the source js files and make new files as `*.min.js`:
						return dst + '/' + src.replace('.js', '.min.js');

						// Or to override to src:
						return src;
					}
				}]
			},
			options: {
				banner: '/*! <%= pkg.title %> - v<%= pkg.version %>\n' +
				' * <%= pkg.homepage %>\n' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %>;\n' +
				' * Licensed GPLv2+\n' +
				' */\n',
				mangle: {
					reserved: ['jQuery']
				}
			}
		},

		// CSS - Compile a .scss file into a normal .css file.
		sass: {
			all: {
				options: {
					'sourcemap=auto': true, // 'sourcemap': 'none' does not work...
					unixNewlines: true,
					style: 'expanded'
				},
				files: conf.css_files_compile
			}
		},

		// CSS - Automaticaly create prefixed attributes in css file if needed.
		//	   e.g. add `-webkit-border-radius` if `border-radius` is used.
		autoprefixer: {
			options: {
				browsers: ['last 2 version', 'ie 8', 'ie 9', 'ie 10', 'ie 11'],
				diff: false
			},
			single_file: {
				files: [{
					expand: true,
					src: ['**/*.css', '!**/*.min.css'],
					cwd: 'assets/css/',
					dest: 'assets/css/',
					ext: '.css',
					extDot: 'last',
					flatten: false
				}]
			}
		},

		concat_css: {
			options: {

				// Task-specific options go here.
			},
			all: {
				src: ['assets/css/frontend/layout.css', 'assets/css/frontend/*.css'],
				dest: 'assets/css/style.css'
			}
		},

		// CSS - Required for CSS-autoprefixer and maybe some SCSS function.
		compass: {
			options: {
				sourcemap: false
			},
			server: {
				options: {
					debugInfo: true
				}
			}
		},

		// CSS - Minify all .css files.
		cssmin: {
			options: {
				format: 'beautify'
			},
			minify: {
				expand: true,
				src: 'style.css',
				cwd: 'assets/css/',
				dest: '',
				ext: '.css',
				extDot: 'last'
			}
		},

		// WATCH - Watch filesystem for changes during development.
		watch: {
			sass: {
				files: ['assets/sass/**/*.scss'],
				tasks: ['css'],
				options: {
					debounceDelay: 500
				}
			},

			scripts: {
				files: [
					'assets/scripts/src/**/*.js',
					'assets/scripts/vendor/**/*.js'
				],

				//tasks: ['jshint', 'concat', 'uglify' ],
				tasks: ['js'],
				options: {
					debounceDelay: 500
				}
			}
		},

		// BUILD - Create a zip-version of the plugin.
		compress: {
			target: {
				options: {
					mode: 'zip',
					archive: './release/<%= pkg.name %>.zip'
				},
				expand: true,
				cwd: './release/<%= pkg.name %>/',
				src: ['**/*']
			}
		},

		// BUILD - update the translation index .po file.
		makepot: {
			target: {
				options: {
					cwd: '',
					domainPath: conf.translation.pot_dir,
					exclude: conf.translation.ignore_files,
					mainFile: 'style.css',
					potComments: '',
					potFilename: conf.translation.textdomain + '.pot',
					potHeaders: {
						poedit: true, // Includes common Poedit headers.
						'x-poedit-keywordslist': true // Include a list of all possible gettext functions.
					},
					processPot: null, // A callback function for manipulating the POT file.
					type: 'wp-theme', // wp-plugin or wp-theme
					updateTimestamp: true, // Whether the POT-Creation-Date should be updated without other changes.
					updatePoFiles: true // Whether to update PO files in the same directory as the POT file.
				}
			}
		},

		po2mo: {
			files: {
				src: 'languages/pl_PL.po',
				dest: 'languages/pl_PL.mo'
			},
			options: {
				checkDomain: true
			}
		},

		// BUILD: Replace conditional tags in code.
		replace: {
			target: {
				options: {
					patterns: conf.replaces.patterns
				},
				files: [conf.replaces.files]
			}
		},

		clean: {
			options: {
				force: true
			},
			release: {
				options: {
					force: true
				},
				src: [
					'./assets/css/**css',
					'./assets/css/**map',
					'./assets/css/admin/**css',
					'./assets/css/admin/**map',
					'./release',
					'./release/*',
					'./release/**'
				]
			}
		},

		copy: {
			release: {
				expand: true,
				src: [
					'*',
					'**',
					'!composer.json',
					'!node_modules',
					'!node_modules/*',
					'!node_modules/**',
					'!bitbucket-pipelines.yml',
					'!.idea', // PHPStorm settings
					'!.git',
					'!Gruntfile.js',
					'!package.json',
					'!package-lock.json',
					'!tests/*',
					'!tests/**',
					'!assets/scripts/src',
					'!assets/scripts/src/*',
					'!assets/scripts/src/**',
					'!assets/css',
					'!assets/css/*',
					'!assets/css/**',
					'!assets/sass',
					'!assets/sass/*',
					'!assets/sass/**',
					'!assets/images/backgrounds/originals',
					'!assets/images/backgrounds/originals/*',
					'!assets/images/backgrounds/originals/**',
					'!assets/images/pwa',
					'!assets/images/pwa/*',
					'!assets/images/pwa/**',
					'!phpcs.xml.dist',
					'!README.md',
					'!stylelint.config.js',
					'!vendor',
					'!vendor/*',
					'!vendor/**'
				],
				dest: './release/<%= pkg.name %>/',
				noEmpty: true
			}
		},

		eslint: {
			target: conf.js_files_concat['assets/scripts/frontend.js']
		},
	});

	// Test task.
	grunt.registerTask('hello', 'Test if grunt is working', function() {
		grunt.log.subhead('Hi there :)');
		grunt.log.writeln('Looks like grunt is installed!');
	});

	grunt.registerTask('release', 'Generating release copy', function() {
		grunt.task.run('clean');
		// grunt.task.run('js');
		grunt.task.run('css');
		grunt.task.run('makepot');
		grunt.task.run( 'po2mo');
		grunt.task.run('copy');
		grunt.task.run('replace');
		grunt.task.run('compress');
	});

	// Default task.

	grunt.registerTask('default', [
		'clean',
		'sass',
		'autoprefixer',
		'concat_css',
		'cssmin'
	]);
	grunt.registerTask('build', ['release']);
	grunt.registerTask('i18n', ['makepot']);
	grunt.registerTask('js', ['eslint', 'concat', 'uglify']);
	grunt.registerTask('css', ['clean', 'sass', 'autoprefixer', 'concat_css', 'cssmin']);

	grunt.task.run('clear');
	grunt.util.linefeed = '\n';
};
