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

		$wrapper_classes = Helper::build_class([
			'field-' . $field['name']
		]);

		$wrapper_attributes = get_block_wrapper_attributes([
			'class' => $wrapper_classes
		]);
		$opening_tag = "<div {$wrapper_attributes}>";
		$closing_tag = "</div>";

		// throw if value is empty.
		if ( '' === $field['value'] || is_null( $field['value'] ) ) {
			if ( isset( $attr['showMessageIfEmpty'] ) && boolval( $attr['showMessageIfEmpty'] ) && isset( $attr['emptyMessage'] ) && ! empty( $attr['emptyMessage'] ) ) {
				return $opening_tag . '<span class="empty">' . $attr['emptyMessage'] . '</span>' . $closing_tag;
			} else {
				return '';
			}
		}

		$value   = wp_oembed_get( $field['value'] );

		if ( '' === $value || ( is_array( $value ) && empty( $value ) ) ) {
			return '';
		}

		ob_start();
		echo '<div ' . wp_kses_post( $wrapper_attributes ) . '>';
    echo '<div class="wp-block-acf-field-blocks-acf-embed__wrapper">';
    echo $value;
    echo '</div>';
		echo '</div>';
		$output = ob_get_clean();

		$output = Helper::apply_filters( 'afb/output', $field, $output, $field, $attr );
		$output = Helper::apply_filters( 'afb/embed/output', $field, $output, $field, $attr );
		
		return $output;
	}

}