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
class ACF_Image {

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
		$attr = Helper::apply_filters( 'afb/image/attributes', $field, $attr, $field );
		$field['value'] = Helper::apply_filters( 'afb/value', $field, $field['value'], $field, $attr );
		$field['value'] = Helper::apply_filters( 'afb/image/value', $field, $field['value'], $field, $attr );

		// throw if value is empty.
		if ( '' === $field['value'] || is_null( $field['value'] ) ) {
			if ( isset( $attr['defaultImage'] ) && ! empty( $attr['defaultImage'] ) ) {
				$image_id = intval( $attr['defaultImage'] );
			} else {
				return '';
			}
		} else {
			$image_id = intval( $field['value'] );
		}

		$size_slug      = isset( $attr['sizeSlug'] ) ? $attr['sizeSlug'] : 'post-thumbnail';
		$img_attr       = Helper::get_border_class_and_style( $attr );
		$overlay_markup = $this->get_overlay_element_markup( $attr );

		$extra_styles = '';

		// Aspect ratio with a height set needs to override the default width/height.
		if ( ! empty( $attr['aspectRatio'] ) ) {
			$extra_styles .= 'width:100%;height:100%;';
		} elseif ( ! empty( $attr['height'] ) ) {
			$extra_styles .= "height:{$attr['height']};";
		}

		if ( ! empty( $attr['scale'] ) ) {
			$extra_styles .= "object-fit:{$attr['scale']};";
		}
		if ( ! empty( $attr['style']['shadow'] ) ) {
			$shadow_styles = wp_style_engine_get_styles( array( 'shadow' => $attr['style']['shadow'] ) );

			if ( ! empty( $shadow_styles['css'] ) ) {
				$extra_styles .= $shadow_styles['css'];
			}
		}

		if ( ! empty( $extra_styles ) ) {
			$img_attr['style'] = empty( $img_attr['style'] ) ? $extra_styles : $img_attr['style'] . $extra_styles;
		}

		$image = wp_get_attachment_image( $image_id, $size_slug, false, $img_attr );

		if ( empty( $image ) ) {
			return '';
		}

		// Wrap the image in a link when a link destination is set.
		$link_url = $this->resolve_link_url( $attr, $block, $image_id );
		if ( ! empty( $link_url ) ) {
			$rel = '';
			if ( isset( $attr['linkTarget'] ) && '_blank' === $attr['linkTarget'] ) {
				$rel .= 'noreferrer noopener ';
			}
			if ( ! empty( $attr['rel'] ) ) {
				$rel .= $attr['rel'];
			}

			$link_attributes = Helper::build_attrs(
				array(
					'href'   => esc_url( $link_url ),
					'class'  => $attr['linkClass'] ?? '',
					'target' => $attr['linkTarget'] ?? '',
					'rel'    => trim( $rel ),
				)
			);

			$image = '<a ' . $link_attributes . '>' . $image . '</a>';
		}

		$image = $image . $overlay_markup;

		$aspect_ratio = ! empty( $attr['aspectRatio'] )
			? esc_attr( safecss_filter_attr( 'aspect-ratio:' . $attr['aspectRatio'] ) ) . ';'
			: '';
		$width        = ! empty( $attr['width'] )
			? esc_attr( safecss_filter_attr( 'width:' . $attr['width'] ) ) . ';'
			: '';
		$height       = ! empty( $attr['height'] )
			? esc_attr( safecss_filter_attr( 'height:' . $attr['height'] ) ) . ';'
			: '';
		if ( ! $height && ! $width && ! $aspect_ratio ) {
			$wrapper_attributes = get_block_wrapper_attributes();
		} else {
			$wrapper_attributes = get_block_wrapper_attributes( array( 'style' => $aspect_ratio . $width . $height ) );
		}
		$output = "<figure " . wp_kses_post( $wrapper_attributes ) . ">" . wp_kses_post( $image ) . "</figure>";

		/*
		 * Reuse WordPress core's native (Interactivity API) image lightbox when
		 * the "On Click" action is set to "Open in lightbox".
		 * `block_core_image_render_lightbox()` injects the directives + trigger
		 * button and prints the shared overlay dialog in the footer.
		 */
		if (
			'lightbox' === ( $attr['linkDestination'] ?? 'none' ) &&
			function_exists( 'block_core_image_render_lightbox' )
		) {
			wp_enqueue_script_module( '@wordpress/block-library/image/view' );
			// The lightbox overlay styles live in core/image's stylesheet.
			wp_enqueue_style( 'wp-block-image' );

			$synthetic_block = array(
				'attrs' => array(
					'id'    => $image_id,
					'scale' => $attr['scale'] ?? null,
				),
			);

			$output = block_core_image_render_lightbox( $output, $synthetic_block, $block );
		}

		$output = Helper::apply_filters( 'afb/output', $field, $output, $field, $attr );
		$output = Helper::apply_filters( 'afb/image/output', $field, $output, $field, $attr );

		return $output;

	}

	/**
	 * Resolve the link URL for the image based on the chosen link destination.
	 *
	 * @param array    $attr     Block attributes.
	 * @param WP_Block $block    Block instance.
	 * @param int      $image_id Attachment ID of the rendered image.
	 * @return string            Link URL, or empty string when not linked.
	 */
	private function resolve_link_url( $attr, $block, $image_id ) {
		$destination = $attr['linkDestination'] ?? 'none';

		switch ( $destination ) {
			case 'media':
				return wp_get_attachment_image_url( $image_id, 'full' );
			case 'attachment':
				return get_attachment_link( $image_id );
			case 'custom':
				return $attr['href'] ?? '';
			case 'field':
				return $this->resolve_field_url( $attr, $block );
			default:
				return '';
		}
	}

	/**
	 * Resolve a URL from another ACF field selected as the link source.
	 *
	 * NOTE: this mirrors the field-type URL resolution in
	 * inc/blocks/class-acf-button.php; a candidate for a shared Helper method.
	 *
	 * @param array    $attr  Block attributes.
	 * @param WP_Block $block Block instance.
	 * @return string         Resolved URL, or empty string.
	 */
	private function resolve_field_url( $attr, $block ) {
		if ( empty( $attr['linkFieldKey'] ) ) {
			return '';
		}

		$link_attr             = $attr;
		$link_attr['fieldKey'] = $attr['linkFieldKey'];
		$link_field            = Fields::load_field( $link_attr, $block );

		if ( false === $link_field || empty( $link_field['value'] ) ) {
			return '';
		}

		$value = $link_field['value'];

		if ( 'email' === $link_field['type'] ) {
			return 'mailto:' . $value;
		} elseif ( 'image' === $link_field['type'] || 'file' === $link_field['type'] ) {
			return wp_get_attachment_url( $value );
		} elseif ( 'link' === $link_field['type'] && isset( $value['url'] ) ) {
			return $value['url'];
		} elseif ( 'page_link' === $link_field['type'] ) {
			return is_numeric( $value ) ? get_permalink( $value ) : $value;
		}

		return $value;
	}

	public function get_overlay_element_markup( $attributes ) {
		$has_dim_background  = isset( $attributes['dimRatio'] ) && $attributes['dimRatio'];
		$has_gradient        = isset( $attributes['gradient'] ) && $attributes['gradient'];
		$has_custom_gradient = isset( $attributes['customGradient'] ) && $attributes['customGradient'];
		$has_solid_overlay   = isset( $attributes['overlayColor'] ) && $attributes['overlayColor'];
		$has_custom_overlay  = isset( $attributes['customOverlayColor'] ) && $attributes['customOverlayColor'];
		$class_names         = array( 'acf-field-blocks-image__overlay' );
		$styles              = array();

		if ( ! $has_dim_background ) {
			return '';
		}

		// Apply border classes and styles.
		$border_attributes = Helper::get_border_class_and_style( $attributes );

		if ( ! empty( $border_attributes['class'] ) ) {
			$class_names[] = $border_attributes['class'];
		}

		if ( ! empty( $border_attributes['style'] ) ) {
			$styles[] = $border_attributes['style'];
		}

		// Apply overlay and gradient classes.
		if ( $has_dim_background ) {
			$class_names[] = 'has-background-dim';
			$class_names[] = "has-background-dim-{$attributes['dimRatio']}";
		}

		if ( $has_solid_overlay ) {
			$class_names[] = "has-{$attributes['overlayColor']}-background-color";
		}

		if ( $has_gradient || $has_custom_gradient ) {
			$class_names[] = 'has-background-gradient';
		}

		if ( $has_gradient ) {
			$class_names[] = "has-{$attributes['gradient']}-gradient-background";
		}

		// Apply background styles.
		if ( $has_custom_gradient ) {
			$styles[] = sprintf( 'background-image: %s;', $attributes['customGradient'] );
		}

		if ( $has_custom_overlay ) {
			$styles[] = sprintf( 'background-color: %s;', $attributes['customOverlayColor'] );
		}

		return sprintf(
			'<span class="%s" style="%s" aria-hidden="true"></span>',
			esc_attr( implode( ' ', $class_names ) ),
			esc_attr( safecss_filter_attr( implode( ' ', $styles ) ) )
		);
	}

}