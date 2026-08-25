<?php
/**
 * Loader.
 *
 * @package ACFFieldBlocks
 */

namespace ACFFieldBlocks\Blocks;

use ACFFieldBlocks\Helper;
use ACFFieldBlocks\Fields;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Blocks
 */
class ACF_Embed {

	/**
	 * Aspect ratios supported for responsive embeds, ordered from widest to narrowest.
	 * Mirrors `ASPECT_RATIOS` in src/blocks/acf-embed/constants.js so the frontend
	 * output matches whatever the editor preview would have computed.
	 *
	 * @var array
	 */
	private static $aspect_ratios = array(
		array( 'ratio' => 2.33, 'class' => 'wp-embed-aspect-21-9' ),
		array( 'ratio' => 2.00, 'class' => 'wp-embed-aspect-18-9' ),
		array( 'ratio' => 1.78, 'class' => 'wp-embed-aspect-16-9' ),
		array( 'ratio' => 1.33, 'class' => 'wp-embed-aspect-4-3' ),
		array( 'ratio' => 1.00, 'class' => 'wp-embed-aspect-1-1' ),
		array( 'ratio' => 0.56, 'class' => 'wp-embed-aspect-9-16' ),
		array( 'ratio' => 0.50, 'class' => 'wp-embed-aspect-1-2' ),
	);

	public function render( $attr, $block_content, $block ) {

		// field key and source must be specified.
		if ( empty( $attr['fieldKey'] ) || empty( $attr['fieldSource'] ) ) {
			return '';
		}

		// load field.
		$field = Fields::load_field( $attr, $block );

		// throw if the field is not found on ACF.
		if ( false === $field ) {
			return '';
		}

		$attr = Helper::apply_filters( 'afb/attributes', $field, $attr, $field );
		$attr = Helper::apply_filters( 'afb/embed/attributes', $field, $attr, $field );
		$field['value'] = Helper::apply_filters( 'afb/value', $field, $field['value'], $field, $attr );
		$field['value'] = Helper::apply_filters( 'afb/embed/value', $field, $field['value'], $field, $attr );

		// throw if value is empty.
		if ( '' === $field['value'] || is_null( $field['value'] ) ) {
			if ( isset( $attr['showMessageIfEmpty'] ) && boolval( $attr['showMessageIfEmpty'] ) && isset( $attr['emptyMessage'] ) && ! empty( $attr['emptyMessage'] ) ) {
				$empty_wrapper_attributes = get_block_wrapper_attributes([
					'class' => Helper::build_class([ 'field-' . $field['name'] ])
				]);
				return "<div {$empty_wrapper_attributes}><span class=\"empty\">{$attr['emptyMessage']}</span></div>";
			} else {
				return '';
			}
		}

		$value = wp_oembed_get( $field['value'] );

		if ( '' === $value || ( is_array( $value ) && empty( $value ) ) ) {
			return '';
		}

		// compute the aspect-ratio class server-side, from the actual oEmbed markup, so
		// responsive sizing works regardless of whether the block editor ever previewed
		// this specific field value (e.g. when the block lives in a post template).
		$allow_responsive = ! isset( $attr['allowResponsive'] ) || boolval( $attr['allowResponsive'] );
		$aspect_ratio_class = self::get_aspect_ratio_class( $value, $allow_responsive );

		$wrapper_classes = Helper::build_class([
			'field-' . $field['name'],
			$aspect_ratio_class,
		]);

		$wrapper_attributes = get_block_wrapper_attributes([
			'class' => $wrapper_classes
		]);

		ob_start();
		echo '<div ' . wp_kses_post( $wrapper_attributes ) . '>';
		echo '<div class="wp-block-acf-field-blocks-acf-embed__wrapper">';
		// oEmbed markup returned by wp_oembed_get() comes from WordPress' trusted provider allowlist.
		echo $value; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '</div>';
		echo '</div>';
		$output = ob_get_clean();

		$output = Helper::apply_filters( 'afb/output', $field, $output, $field, $attr );
		$output = Helper::apply_filters( 'afb/embed/output', $field, $output, $field, $attr );

		return $output;
	}

	/**
	 * Works out the `wp-has-aspect-ratio wp-embed-aspect-*` classes for a piece of
	 * oEmbed HTML, based on the width/height of its first iframe. Returns an empty
	 * string when responsive sizing isn't wanted or can't be determined.
	 *
	 * @param string $html             oEmbed HTML from wp_oembed_get().
	 * @param bool   $allow_responsive Whether responsive classes should be applied.
	 * @return string
	 */
	private static function get_aspect_ratio_class( $html, $allow_responsive ) {
		if ( ! $allow_responsive || ! is_string( $html ) ) {
			return '';
		}

		// Some providers (e.g. Flickr) already ship their own responsive wrapper with
		// padding-based aspect ratio; don't stack our own sizing on top of that.
		if ( preg_match( '/padding-(?:top|bottom)\s*:\s*[\d.]+%/i', $html ) ) {
			return '';
		}

		if ( ! preg_match( '/<iframe\b[^>]*>/i', $html, $iframe_match ) ) {
			return '';
		}

		if (
			! preg_match( '/\bwidth=["\']?(\d+(?:\.\d+)?)/i', $iframe_match[0], $width_match ) ||
			! preg_match( '/\bheight=["\']?(\d+(?:\.\d+)?)/i', $iframe_match[0], $height_match )
		) {
			return '';
		}

		$width  = (float) $width_match[1];
		$height = (float) $height_match[1];

		if ( $width <= 0 || $height <= 0 ) {
			return '';
		}

		$aspect_ratio = round( $width / $height, 2 );

		foreach ( self::$aspect_ratios as $candidate ) {
			if ( $aspect_ratio >= $candidate['ratio'] ) {
				// Too far from the closest match; don't force an incorrect ratio.
				if ( ( $aspect_ratio - $candidate['ratio'] ) > 0.1 ) {
					return '';
				}
				return 'wp-has-aspect-ratio ' . $candidate['class'];
			}
		}

		return '';
	}

}