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
class ACF_Text {

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
		$attr = Helper::apply_filters( 'afb/text/attributes', $field, $attr, $field );
		$field['value'] = Helper::apply_filters( 'afb/value', $field, $field['value'], $field, $attr );
		$field['value'] = Helper::apply_filters( 'afb/text/value', $field, $field['value'], $field, $attr );

		$wrapper_classes = Helper::build_class([
			'field-' . $field['name'],
			( isset( $attr['textAlign'] ) && ! empty( $attr['textAlign'] ) ? 'has-text-align-' . $attr['textAlign'] : '' )
		]);

		$wrapper_attributes = get_block_wrapper_attributes([
			'class' => $wrapper_classes
		]);
		$tag         = $attr['tag'] ?? 'p';
		$opening_tag = "<{$tag} {$wrapper_attributes}>";
		$closing_tag = "</{$tag}>";

		// throw if value is empty.
		if ( ( '' === $field['value'] || is_null( $field['value'] ) || ( is_array( $field['value'] ) && empty( $field['value'] ) ) ) && 'true_false' !== $field['type'] ) {
			if ( isset( $attr['showMessageIfEmpty'] ) && boolval( $attr['showMessageIfEmpty'] ) && isset( $attr['emptyMessage'] ) && ! empty( $attr['emptyMessage'] ) ) {
				return $opening_tag . '<span class="empty">' . $attr['emptyMessage'] . '</span>' . $closing_tag;
			} else {
				return '';
			}
		}

		$value   = '';
		$is_link = isset( $attr['linkToObject'] ) && boolval( $attr['linkToObject'] );
		$new_tab = isset( $attr['newTab'] ) && boolval( $attr['newTab'] );

		switch ( $field['type'] ) {
			case 'textarea':
				$value = wp_kses_post( ! empty( $field['new_lines'] ) ? nl2br( $field['value'] ) : $field['value'] );
				break;
			case 'true_false':
				if ( boolval( $field['value'] ) && isset( $attr['checkedText'] ) && ! empty( $attr['checkedText'] ) ) {
					$value = esc_html( $attr['checkedText'] );
				} elseif ( isset( $attr['uncheckedText'] ) && ! empty( $attr['uncheckedText'] ) ) {
					$value = esc_html( $attr['uncheckedText'] );
				}
				break;

			case 'wysiwyg':
				$tag   = 'div';
				$value = wp_kses_post( nl2br( $field['value'] ) );
				break;
				
			case 'link':
				if ( isset( $field['value']['url'], $field['value']['title'] ) ) {
					$value = $this->create_link( $field['value']['url'], $field['value']['title'], $new_tab );
				}
				break;

			case 'post_object':
			case 'relationship':
				if ( is_array( $field['value'] ) ) {
					$value = array_map( function( $val ) use ( $is_link, $field, $new_tab ) {
						if ( $is_link ) {
							return $this->create_link( get_permalink( $val ), get_the_title( $val ), $new_tab );
						} else {
							return get_the_title( $val );
						}
					}, $field['value'] );
				} else {
					if ( $is_link ) {
						$value = $this->create_link( get_permalink( $field['value'] ), get_the_title( $field['value'] ), $new_tab );
					} else {
						$value = get_the_title( $field['value'] );
					}
				}
				break;

			case 'taxonomy':
				if ( is_array( $field['value'] ) ) {
					$value = array_map( function( $val ) use ( $is_link, $field, $new_tab, $attr ) {
						$term = get_term( $val );
						if ( is_wp_error( $term ) || is_null( $term ) ) {
							return '';
						}
						$return_field = isset( $attr['returnFormat'] ) && isset( $term->{$attr['returnFormat']} ) ? $term->{$attr['returnFormat']} : $term->name;
						if ( $is_link ) {
							return $this->create_link( get_term_link( $term ), $return_field, $new_tab );
						} else {
							return esc_html( $return_field );
						}
					}, $field['value'] );
				} else {
					$term = get_term( $field['value'] );
					if ( is_wp_error( $term ) || is_null( $term ) ) {
						break;
					}
					$return_field = isset( $attr['returnFormat'] ) && isset( $term->{$attr['returnFormat']} ) ? $term->{$attr['returnFormat']} : $term->name;
					if ( $is_link ) {
						$value = $this->create_link( get_term_link( $term ), $return_field, $new_tab );
					} else {
						$value = esc_html( $return_field );
					}
				}
				break;

			case 'user':
				if ( is_array( $field['value'] ) ) {
					$value = array_map( function( $val ) use ( $is_link, $field, $new_tab, $attr ) {
						$user = get_userdata( $val );
						if ( ! $user ) {
							return '';
						}
						$return_field = isset( $attr['returnFormat'] ) && isset( $user->data->{$attr['returnFormat']} ) ? $user->data->{$attr['returnFormat']} : $user->data->display_name;
						if ( $is_link ) {
							return $this->create_link( get_author_posts_url( $user->data->ID ), $return_field, $new_tab );
						} else {
							return esc_html( $return_field );
						}
					}, $field['value'] );
				} else {
					$user = get_userdata( $field['value'] );
					if ( ! $user ) {
						break;
					}
					$return_field = isset( $attr['returnFormat'] ) && isset( $user->data->{$attr['returnFormat']} ) ? $user->data->{$attr['returnFormat']} : $user->data->display_name;
					if ( $is_link ) {
						$value = $this->create_link( get_author_posts_url( $user->data->ID ), $return_field, $new_tab );
					} else {
						$value = esc_html( $return_field );
					}
				}
				break;

			case 'select':
			case 'radio':
			case 'checkbox':
			case 'button_group':
				if ( is_array( $field['value'] ) ) {
					$value = array_map( function( $val ) use ( $attr, $field ) {
						if ( isset( $attr['returnFormat'] ) && 'label' === $attr['returnFormat'] && isset( $field['choices'][ $val ] ) ) {
							return esc_html( $field['choices'][ $val ] );
						} else {
							return esc_html( $val );
						}
					}, $field['value'] );
				} else {
					if ( isset( $attr['returnFormat'] ) && 'label' === $attr['returnFormat'] && isset( $field['choices'][ $field['value'] ] ) ) {
						$value = esc_html( $field['choices'][ $field['value'] ] );
					} else {
						$value = esc_html( $field['value'] );
					}
				}
				break;

			case 'email':
				if ( $is_link ) {
					$value = $this->create_link( 'mailto:' . $field['value'], $field['value'], false );
				} else {
					$value = esc_html( $field['value'] );
				}
				break;

			case 'url':
				if ( $is_link ) {
					$value = $this->create_link( $field['value'], $field['value'], $new_tab );
				} else {
					$value = esc_url( $field['value'] );
				}
				break;

			case 'page_link':
				if ( is_array( $field['value'] ) ) {
					$value = array_map( function( $val ) use ( $new_tab ) {
						$link = is_numeric( $val ) ? get_permalink( $val ) : $val;
						return $this->create_link( $link, $link, $new_tab );
					}, $field['value'] );
				} else {
					$link  = is_numeric( $field['value'] ) ? get_permalink( $field['value'] ) : $field['value'];
					$value = $this->create_link( $link, $link, $new_tab );
				}
				break;

			case 'date_picker':
			case 'datetime_picker':
			case 'time_picker':
				$value = gmdate( $field['return_format'], strtotime( $field['value'] ) );
				break;
			
			default:
				$value = is_array( $field['value'] ) ? array_map( 'esc_html', $field['value'] ) : esc_html( $field['value'] );
				break;
		}

		// filter empty strings from value if array.
		if ( is_array( $value ) ) {
			$value = array_filter( $value, function( $val ) {
				return '' !== $val;
			} );
		}

		$value = Helper::apply_filters( 'afb/text/formatted_value', $field, $value, $field, $attr );

		if ( '' === $value || ( is_array( $value ) && empty( $value ) ) ) {
			return '';
		}

		$prefix = ( 'true_false' !== $field['type'] || 'wysiwyg' !== $field['type'] ) && isset( $attr['prefix'] ) && ! empty( $attr['prefix'] ) ? $attr['prefix'] : '';
		$suffix = ( 'true_false' !== $field['type'] || 'wysiwyg' !== $field['type'] ) && isset( $attr['suffix'] ) && ! empty( $attr['suffix'] ) ? $attr['suffix'] : '';

		ob_start();
		echo '<' . esc_html( $tag ) . ' ' . wp_kses_post( $wrapper_attributes ) . '>';
		if ( ! empty( $prefix ) ) {
			echo '<span class="prefix">' . esc_html( $prefix ) . '</span>';
		}
		if ( 'wysiwyg' === $field['type'] ) {
			echo wp_kses_post( $value );
		} elseif ( is_array( $value ) ) {
			foreach ( $value as $key => $val ) {
				if ( "ul" === $tag || "ol" === $tag ) {
					echo '<li>';
				} elseif ( 0 < $key && isset( $attr['separator'] ) ) {
					echo '<span class="separator">' . esc_html( $attr['separator'] ) . '</span>';
				}
				echo '<span class="value">' . wp_kses_post( $val ) . '</span>';
				if ( "ul" === $tag || "ol" === $tag ) {
					echo '</li>';
				}
			}
		} else {
			echo '<span class="value">' . wp_kses_post( $value ) . '</span>';
		}
		if ( ! empty( $suffix ) ) {
			echo '<span class="suffix">' . esc_html( $suffix ) . '</span>';
		}
		echo '</' . esc_html( $tag ) . '>';
		$output = ob_get_clean();

		$output = Helper::apply_filters( 'afb/output', $field, $output, $field, $attr );
		$output = Helper::apply_filters( 'afb/text/output', $field, $output, $field, $attr );
		
		return $output;
	}

	private function create_link( $url, $text, $new_tab = false ) {
		return '<a href="' . esc_url( $url ) . '" ' . ( $new_tab ? 'target="_blank"' : '' ) . '>' . esc_html( $text ) . '</a>';
	}

}