const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const NODE_ENV = process.env.NODE_ENV || 'development';
const ANALYZER = 'true' === process.env.NODE_ANALYZER ? true : false;
const path = require( 'path' );
const FileManagerPlugin = require( 'filemanager-webpack-plugin' );
const blocks = require( './blocks.json' );

defaultConfig.plugins.splice( 1, 1 ); // We need to remove Core's Copy Files plugin.

const blockFiles = Object.keys( blocks ).filter( block => blocks[ block ].block !== undefined && true !== blocks[ block ]?.isPro && true !== blocks[ block ]?.isEssentials )
	.map( block => {
		return {
			source: `src/${ blocks[ block ].block }`,
			destination: `build/blocks/${ block }/`
		};
	});

const blockFolders = Object.keys( blocks ).filter( block => true !== blocks[ block ]?.isPro && true !== blocks[ block ]?.isEssentials ).map( block => `build/blocks/${ block }` );

module.exports = [
	{

		// blocks
		...defaultConfig,
		stats: 'minimal',
		devtool: 'development' === NODE_ENV ? 'inline-source-map' : undefined,
		mode: NODE_ENV,
		entry: {
			blocks: [
				'./src/blocks/index.js',
				'./src/index.js'
			]
		},
		output: {
			path: path.resolve( __dirname, './build/blocks' ),
			filename: '[name].js',
			chunkFilename: 'chunk-[name].js'
		},
		optimization: {
			...defaultConfig.optimization,
			splitChunks: {
				cacheGroups: {
					vendor: {
						name: 'vendor',
						test: /[\\/]node_modules[\\/]/,
						chunks: 'initial'
					},
					editorStyles: {
						name: 'editor',
						test: /editor\.scss$/,
						chunks: 'all'
					}
				}
			}
		},
		plugins: [
			...defaultConfig.plugins,
			new FileManagerPlugin({
				events: {
					onEnd: {
						mkdir: blockFolders,
						copy: blockFiles,
						delete: [
							'build/blocks/blocks/',
							'build/blocks/pro/',
							'build/pro/blocks/',
							'build/pro/pro/'
						]
					}
				},
				runOnceInWatchMode: false,
				runTasksInSeries: false
			}),
			new BundleAnalyzerPlugin({
				analyzerMode: 'disabled',
				generateStatsFile: ANALYZER
			})
		]
	}
];
