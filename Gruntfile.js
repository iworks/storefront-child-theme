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

	// Load all grunt tasks.
	require('load-grunt-tasks')(grunt);

	var buildtime = new Date().toISOString();
	var buildyear = 1900 + new Date().getYear();
	var buildtimestamp = new Date().getTime();

	/**
	 * excludes
	 */
	var excludeCopyFiles = [
		'**',
		'!**/bitbucket-pipelines.yml',
		'!contributing.md',
		'!**/css/less/**',
		'!**/css/sass/**',
		'!**/css/src/**',
		'!.editorconfig',
		'!.git*',
		'!.git/**',
		'!**/Gruntfile.js',
		'!**/img/src/**',
		'!**/js/src/**',
		'!**/LICENSE',
		'!LICENSE',
		'!**/*.map',
		'!node_modules/**',
		'!**/package.json',
		'!package-lock.json',
		'!postcss.config.js',
		'!**/README.md',
		'!README.md',
		'!release/**',
		'!.sass-cache/**',
		'!**/tests/**',
		'!webpack.config.js',
	];

	var excludeCopyFilesGIT = excludeCopyFiles.slice(0).concat(
		[
			'!includes/pro/**',
			'!readme.txt',
		]
	);

	var excludeCopyFilesWPorg = excludeCopyFiles.slice(0).concat(
		[
			'!assets/sass/**',
			'!assets/scripts/src/**',
			'!assets/scss/**',
			'!assets/styles/frontend/**',
			'!includes/iworks/wordpress-plugin-stub/class-iworks-wordpress-plugin-stub-github.php',
			'!includes/pro/**',
			'!languages/*.mo',
			'!languages/*.po',
		]
	);

	var conf = {
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
				'README.md',
				'.git*',
				'includes/external/.*', // External libraries.
				'node_modules/.*',
				'(^.php)', // Ignore non-php files.
				'release/.*', // Temp release files.
				'.sass-cache/.*',
				'tests/.*', // Unit testing.
				'.editorconfig', // editor configuration
			],
			pot_dir: 'languages/', // With trailing slash.
			textdomain: '<%= pkg.name %>',
		},
	};

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// JS - Concat .js source files into a single .js file.
		concat: {
			options: {
				stripBanners: true,
				banner: '/*! <%= pkg.title %> - <%= pkg.version %>\n' +
				' * <%= pkg.homepage %>\n' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %>;\n' +
				' * Licensed <%= pkg.license %>' +
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
					'sourcemap=none': true, // 'sourcemap': 'none' does not work...
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
			options: {},
			frontend: {
				src: ['assets/styles/frontend/settings.css', 'assets/styles/frontend/*.css'],
				dest: 'assets/styles/<%= pkg.name %>-frontend.css'
			},
			admin: {
				src: ['assets/styles/admin/*.css'],
				dest: 'assets/styles/<%= pkg.name %>-admin.css'
			}
		},

		// CSS - Minify all .css files.
		cssmin: {
			options: {
				banner: '/*! <%= pkg.title %> - <%= pkg.version %>\n' +
				' * <%= pkg.homepage %>\n' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %>;\n' +
				' * Licensed <%= pkg.license %>' +
				' */\n',
				mergeIntoShorthands: false
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
				tasks: ['sass', 'concat_css', 'cssmin'],
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
					domainPath: conf.translation.pot_dir,
					exclude: conf.translation.ignore_files,
					mainFile: 'style.css',
					potFilename: conf.translation.textdomain + '.pot',
					potHeaders: {
						poedit: true, // Includes common Poedit headers.
						'project-id-version': '<%= pkg.version %>',
						'language-team': 'iWorks <support@iworks.pl>',
						'last-translator': '<%= pkg.translator.name %> <<%= pkg.translator.email %>>',
						'report-msgid-bugs-to': 'http://iworks.pl',
						'x-poedit-keywordslist': true // Include a list of all possible gettext functions.
					},
					exclude: ['node_modules', '.git', '.sass-cache', 'release'],
					type: 'wp-theme',
					updateTimestamp: true,
					updatePoFiles: true
				}
			}
		},

		potomo: {
			dist: {
				options: {
					poDel: false
				},
				files: [{
					expand: true,
					cwd: conf.translation.pot_dir,
					src: ['*.po'],
					dest: conf.translation.pot_dir,
					ext: '.mo',
					nonull: true
				}]
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


	grunt.registerTask('notes', 'Show release notes', function() {
		grunt.log.subhead('Release notes');
		grunt.log.writeln('  1. Check FORUM for open threads');
		grunt.log.writeln('  2. REPLY to forum threads + unsubscribe');
		grunt.log.writeln('  3. Update the TRANSLATION files');
		grunt.log.writeln('  4. Generate ARCHIVE');
		grunt.log.writeln('  5. Check ARCHIVE structure - it should be a folder with theme name');
		grunt.log.writeln('  6. INSTALL on a clean WordPress installation');
		grunt.log.writeln('  7. RELEASE the theme on WordPress.org!');
		grunt.log.writeln('  8. Add git tag!');
		grunt.log.writeln('  9. RELEASE the theme on GitHub!');
		grunt.log.writeln(' 10. RELEASE the theme!');
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
