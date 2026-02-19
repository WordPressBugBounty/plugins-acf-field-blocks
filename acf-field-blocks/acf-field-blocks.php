<?php
/**
 * Plugin Name:       Blocks for ACF Fields
 * Plugin URI:        https://www.acffieldblocks.com
 * Description:       The easiest way to display ACF fields in the WordPress block editor — no coding required!
 * Requires at least: 6.5
 * Tested up to:      6.9
 * Requires PHP:      7.4
 * Version:           1.4.0
 * Author:            gamaup
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       acf-field-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}



if ( ! class_exists( 'ACF_Field_Blocks' ) ) {

	/**
	 * Main Class
	 */
	class ACF_Field_Blocks {

		/**
		 * Class instance
		 * 
		 * @var ACF_Field_Blocks
		 */
		private static $instance;

		/**
		 * Initiator
		 * 
		 * @return ACF_Field_Blocks()
		 */
		public static function get_instance() {
			if ( ! isset( self::$instance ) ) {
				self::$instance = new self();
				do_action( 'acf_field_blocks_loaded' );
			}
			return self::$instance;
		}

		/**
		 * Constructor
		 */
		public function __construct() {
			if ( ! version_compare( get_bloginfo( 'version' ), '6.3', '>=' ) ) {
				add_action( 'admin_notices', [ $this, 'fail_wp_version' ] );
				return;
			}

			if ( ! class_exists( 'ACF' ) || ! version_compare( acf()->version, '6.1.0', '>=' )  ) {
				add_action( 'admin_notices', [ $this, 'fail_acf_required' ] );
				return;
			}

			add_filter( 'network_admin_plugin_action_links_acf-field-blocks/acf-field-blocks.php', array( $this, 'filter_plugin_action_links' ) );
			add_filter( 'plugin_action_links_acf-field-blocks/acf-field-blocks.php', array( $this, 'filter_plugin_action_links' ) );
			add_action( 'activated_plugin', array( $this, 'deactivate_other_instances' ) );
			add_action( 'pre_current_active_plugins', array( $this, 'plugin_deactivated_notice' ) );
			add_action( 'admin_init', array( $this, 'handle_admin_actions' ) );

			$this->define_constants();
			$this->autoload();
		}

		/**
		 * Define all constants
		 */
		public function define_constants() {
			define( 'ACF_FIELD_BLOCKS_VERSION', '1.4.0' );
			define( 'ACF_FIELD_BLOCKS_PATH', untrailingslashit( plugin_dir_path( __FILE__ ) ) );
			define( 'ACF_FIELD_BLOCKS_URL', plugins_url( basename( plugin_dir_path( __FILE__ ) ), basename( __FILE__ ) ) );
		}

		/**
		 * Load autoloader and register the namespace
		 */
		public function autoload() {
			require_once ACF_FIELD_BLOCKS_PATH . '/autoloader.php';
			$autoloader = new \ACFFieldBlocks\Autoloader();
			$autoloader->add_namespace( '\ACFFieldBlocks', ACF_FIELD_BLOCKS_PATH . '/inc/' );
			$autoloader->add_namespace( '\ACFFieldBlocks\Pro', ACF_FIELD_BLOCKS_PATH . '/pro/' );
			$autoloader->register();

			\ACFFieldBlocks\Blocks::instance();
			if ( is_dir( ACF_FIELD_BLOCKS_PATH . '/pro/' ) ) {
				\ACFFieldBlocks\Pro\Blocks::instance();
				\ACFFieldBlocks\Pro\Rest::instance();
				\ACFFieldBlocks\Pro\Block_Visibility::instance();
			} else {
				add_action( 'admin_notices', array( $this, 'review_notice' ) );
			}
			\ACFFieldBlocks\Rest::instance();
		}

		/**
		 * Handle admin actions
		 */
		public function handle_admin_actions() {
			if ( isset( $_GET['afb_action'] ) && ! empty( $_GET['afb_action'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['afb_action'] ) ), 'hide_review_notice' ) ) {
				update_option( 'acf_field_blocks_hide_review_notice', true );
				wp_safe_redirect( admin_url() );
				exit;
			}
		}

		/**
		 * Show review notice.
		 */
		public function review_notice() {
			$activation_date = get_option( 'acf_field_blocks_first_activate' );
			$is_hide         = get_option( 'acf_field_blocks_hide_review_notice', false );
			if ( ! empty( $activation_date ) && time() > ( intval( $activation_date ) + ( 2 * WEEK_IN_SECONDS ) ) && false === $is_hide ) {
				?>
				<div class="notice notice-info is-dismissible">
					<p style="margin-bottom: 0;"><?php printf( esc_html__( "Enjoying %s? You've been using this plugin for a while.", "acf-field-blocks" ), "<strong>Blocks for ACF Fields</strong>" ); ?></p>
					<p style="margin-top: 0;"><?php esc_html_e( 'If you could take a few moments to rate it on WordPress.org, we would really appreciate your help making the plugin better. Thanks!', 'acf-field-blocks' ); ?></p>
					<div style="margin-bottom: 1em;">
						<a target="_blank" href="https://wordpress.org/support/plugin/acf-field-blocks/reviews/#new-post" class="button-primary"><?php esc_html_e( 'Drop a Review', 'acf-field-blocks' ); ?></a>
						<a href="<?php echo wp_nonce_url( admin_url(), 'hide_review_notice', 'afb_action' ) ?>" class="button-secondary"><?php esc_html_e( "Don't show again", 'acf-field-blocks' ); ?></a>
					</div>
				</div>
				<?php
			}
		}

		/**
		 * Warn user when the site doesn't have the minimum required WordPress version.
		 */
		public function fail_wp_version() {
			/* translators: %s: WordPress version */
			$message      = sprintf( esc_html__( 'Blocks for ACF Fields requires WordPress version %s+. Because you are using an earlier version, the plugin is currently not running.', 'acf-field-blocks' ), '6.5' );
			$html_message = sprintf( '<div class="error">%s</div>', wpautop( $message ) );
			echo wp_kses_post( $html_message );
		}

		/**
		 * Warn user when the site doesn't have the minimum required WordPress version.
		 */
		public function fail_acf_required() {
			/* translators: %s: WordPress version */
			$message      = sprintf( esc_html__( 'Blocks for ACF Fields requires the Advanced Custom Fields plugin version %s+ to be activated. The plugin is currently not running.', 'acf-field-blocks' ), '6.1.0' );
			$html_message = sprintf( '<div class="error">%s</div>', wpautop( $message ) );
			echo wp_kses_post( $html_message );
		}

		/**
		 * @param array<string, string> $actions
		 * @return array<string, string>
		 */
		public function filter_plugin_action_links( array $actions ) {
			return array_merge( array(
				'upgrade' => '<a href="http://www.acffieldblocks.com/pro/?utm_source=usersite&utm_medium=wp%20admin%20plugins&utm_campaign=BlocksforACFFields%20Pro%20Upgrade">' . esc_html__( 'Upgrade to PRO', 'acf-field-blocks' ) . '</a>',
			), $actions );
		}

		/**
		 * Checks if another version of Blocks for ACF Fields/Blocks for ACF Fields PRO is active and deactivates it.
		 * Hooked on `activated_plugin` so other plugin is deactivated when current plugin is activated.
		 *
		 * @param string $plugin The plugin being activated.
		 */
		public function deactivate_other_instances( $plugin ) {
			if ( ! in_array( $plugin, array( 'acf-field-blocks/acf-field-blocks.php', 'acf-field-blocks-pro/acf-field-blocks-pro.php' ), true ) ) {
				return;
			}

			$plugin_to_deactivate  = 'acf-field-blocks/acf-field-blocks.php';
			$deactivated_notice_id = '1';

			// If we just activated the free version, deactivate the pro version.
			if ( $plugin === $plugin_to_deactivate ) {
				$plugin_to_deactivate  = 'acf-field-blocks-pro/acf-field-blocks-pro.php';
				$deactivated_notice_id = '2';
			}

			if ( is_multisite() && is_network_admin() ) {
				$active_plugins = (array) get_site_option( 'active_sitewide_plugins', array() );
				$active_plugins = array_keys( $active_plugins );
			} else {
				$active_plugins = (array) get_option( 'active_plugins', array() );
			}

			foreach ( $active_plugins as $plugin_basename ) {
				if ( $plugin_to_deactivate === $plugin_basename ) {
					set_transient( 'acffieldblocks_deactivated_notice_id', $deactivated_notice_id, 1 * HOUR_IN_SECONDS );
					deactivate_plugins( $plugin_basename );
					return;
				}
			}
		}

		/**
		 * Displays a notice when either ACF or ACF PRO is automatically deactivated.
		 */
		public function plugin_deactivated_notice() {
			$deactivated_notice_id = (int) get_transient( 'acffieldblocks_deactivated_notice_id' );
			if ( ! in_array( $deactivated_notice_id, array( 1, 2 ), true ) ) {
				return;
			}

			$message = __( "Blocks for ACF Fields and Blocks for ACF Fields PRO should not be active at the same time. We've automatically deactivated Blocks for ACF Fields.", 'acf' );
			if ( 2 === $deactivated_notice_id ) {
				$message = __( "Blocks for ACF Fields and Blocks for ACF Fields PRO should not be active at the same time. We've automatically deactivated Blocks for ACF Fields PRO.", 'acf' );
			}

			?>
			<div class="updated" style="border-left: 4px solid #ffba00;">
				<p><?php echo esc_html( $message ); ?></p>
			</div>
			<?php

			delete_transient( 'acffieldblocks_deactivated_notice_id' );
		}

	}
}

add_action( 'plugins_loaded', function() {
	ACF_Field_Blocks::get_instance();
} );

function acf_field_blocks() {
	return ACF_Field_Blocks::get_instance();
}

register_activation_hook( __FILE__, function() {
	$first_activate = get_option( 'acf_field_blocks_first_activate' );
	if ( empty( $first_activate ) ) {
		update_option( 'acf_field_blocks_first_activate', time(), 'no' );
	}
} );