<?php
/**
 * ACF Icon block renderer.
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
 * Class ACF_Icon
 */
class ACF_Icon {

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
		$attr = Helper::apply_filters( 'afb/icon/attributes', $field, $attr, $field );
		$field['value'] = Helper::apply_filters( 'afb/value', $field, $field['value'], $field, $attr );
		$field['value'] = Helper::apply_filters( 'afb/icon/value', $field, $field['value'], $field, $attr );

		$icon_size = isset( $attr['iconSize'] ) ? intval( $attr['iconSize'] ) : 24;
		$icon_html = '';
		$icon_type = '';

		// Check if field value is empty or invalid.
		$has_value = ! empty( $field['value'] )
			&& is_array( $field['value'] )
			&& ! empty( $field['value']['type'] )
			&& ! empty( $field['value']['value'] );

		if ( ! $has_value ) {
			// Default icon fallback.
			if ( ! empty( $attr['defaultIcon'] ) ) {
				$icon_id   = intval( $attr['defaultIcon'] );
				$icon_html = wp_get_attachment_image(
					$icon_id,
					array( $icon_size, $icon_size ),
					false,
					array(
						'width'  => $icon_size,
						'height' => $icon_size,
					)
				);
				if ( empty( $icon_html ) ) {
					return '';
				}
				$icon_type = 'image';
			} else {
				return '';
			}
		} else {
			$icon_type  = $field['value']['type'];
			$icon_value = $field['value']['value'];

			switch ( $icon_type ) {
				case 'dashicons':
					wp_enqueue_style( 'dashicons' );
					$icon_html = sprintf(
						'<span class="dashicons %s" style="font-size:%dpx;width:%dpx;height:%dpx;" aria-hidden="true"></span>',
						esc_attr( $icon_value ),
						$icon_size,
						$icon_size,
						$icon_size
					);
					break;

				case 'media_library':
					$attachment_id = intval( $icon_value );
					$icon_html     = wp_get_attachment_image(
						$attachment_id,
						array( $icon_size, $icon_size ),
						false,
						array(
							'width'  => $icon_size,
							'height' => $icon_size,
						)
					);
					if ( empty( $icon_html ) ) {
						return '';
					}
					break;

				case 'url':
					$icon_html = sprintf(
						'<img src="%s" alt="" width="%d" height="%d" loading="lazy" />',
						esc_url( $icon_value ),
						$icon_size,
						$icon_size
					);
					break;

				default:
					$custom_icon_url = Fields::resolve_custom_icon_url( $icon_type, $icon_value );
					if ( empty( $custom_icon_url ) ) {
						return '';
					}
					$icon_html = sprintf(
						'<img src="%s" alt="" width="%d" height="%d" loading="lazy" />',
						esc_url( $custom_icon_url ),
						$icon_size,
						$icon_size
					);
					break;
			}
		}

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'style' => sprintf( 'width:%dpx;height:%dpx;', $icon_size, $icon_size ),
			)
		);

		$output = '<figure ' . wp_kses_post( $wrapper_attributes ) . '><span class="afb-icon-wrapper">' . $icon_html . '</span></figure>';

		$output = Helper::apply_filters( 'afb/output', $field, $output, $field, $attr );
		$output = Helper::apply_filters( 'afb/icon/output', $field, $output, $field, $attr );

		return $output;
	}
}