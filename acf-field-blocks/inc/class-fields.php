<?php
/**
 * Loader.
 *
 * @package ACFFieldBlocks
 */

namespace ACFFieldBlocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Main
 */
class Fields {

	/**
	 * Load field based on selected source an key
	 * 
	 * @param  array  $attr  Block attributes.
	 * @param  object $block Block
	 * @return array         ACF field object.
	 */
	public static function load_field( $attr, $block ) {
		$source = false;
		$parent = false;

		if ( 'option' === $attr['fieldSource'] ) {
			$source = 'option';
		} elseif ( 'current_term' === $attr['fieldSource'] ) {
			if ( isset( $block->context['termId'] ) && $block->context['taxonomy'] ) {
				$source = $block->context['taxonomy'] . '_' . $block->context['termId'];
			} elseif ( isset( $block->context['acf-field-blocks/term'] ) ) { // backwards compatibility.
				$source = $block->context['acf-field-blocks/term']->taxonomy . '_' . $block->context['acf-field-blocks/term']->term_id;
			} elseif ( is_category() ) {
				$source = 'category_' . get_queried_object()->term_id;
			} elseif ( is_tag() ) {
				$source = 'post_tag_' . get_queried_object()->term_id;
			} elseif ( is_tax() ) {
				$source = get_queried_object()->taxonomy . '_' . get_queried_object()->term_id;
			}
		} elseif ( 'current_user' === $attr['fieldSource'] ) {
			if ( isset( $block->context['acf-field-blocks/user'] ) ) {
				$source = 'user_' . $block->context['acf-field-blocks/user']->ID;
			} elseif ( is_author() ) {
				$source = 'user_' . get_query_var( 'author' );
			}
		} elseif ( 0 === stripos( $attr['fieldSource'], 'repeater|' ) ) {
			$ancestors = explode( "/", str_replace( 'repeater|', '', $attr['fieldSource'] ) );
			$parent    = $ancestors[ count( $ancestors ) - 1 ];
			if ( isset( $block->context['acf-field-blocks/repeaters'] ) && isset( $block->context['acf-field-blocks/repeaters'][ $ancestors[0] ] ) ) {
				$source = $block->context['acf-field-blocks/repeaters'][ $ancestors[0] ]['source'];
			}
		}

		if ( false !== stripos( $attr['fieldKey'], ':' ) ) {
			
			$field_keys   = explode( ':', $attr['fieldKey'] );
			$parent_field = get_field_object( $field_keys[ 0 ], $source, false, true );
			$field        = get_field_object( $field_keys[ count( $field_keys ) - 1 ], $source, false, true );
			$field['value'] = self::get_nested_value( $parent_field['value'], array_values( array_slice( $field_keys, 1 ) ) );
		} else {
			$field = get_field_object( $attr['fieldKey'], $source, false, true );
		}

		// field is not found on ACF.
		if ( false === $field ) {
			return false;
		}

		// get the value from the repeater if the field is repeater's sub field.
		if ( $parent && isset( $block->context['acf-field-blocks/repeaters'] ) && isset( $block->context['acf-field-blocks/repeaters'][ $parent ] ) ) {
			if ( false !== stripos( $attr['fieldKey'], ':' ) ) {
				// if the field is inside a group.
				$field_keys     = explode( ':', $attr['fieldKey'] );
				$field['value'] = self::get_nested_value( $block->context['acf-field-blocks/repeaters'][ $parent ]['value'], $field_keys );
			} elseif ( isset( $block->context['acf-field-blocks/repeaters'][ $parent ]['value'][ $attr['fieldKey'] ] ) ) {
				$field['value'] = $block->context['acf-field-blocks/repeaters'][ $parent ]['value'][ $attr['fieldKey'] ];
			}
		}

		$field['source'] = $source;

		return $field;
	}

	/**
	 * Get nested value from array using array of keys.
	 *
	 * @since  1.1.2
	 *
	 * @param  array $array Array to get value from.
	 * @param  array $keys  Array of keys.
	 * @return mixed        Nested value or null if not found.
	 */
	public static function get_nested_value( $array, $keys ) {
		if ( is_array( $keys ) && isset( $array[ $keys[0] ] ) ) {
			if ( 1 < count( $keys ) ) {
				return self::get_nested_value( $array[ $keys[0] ], array_values( array_slice( $keys, 1 ) ) );
			}
			return $array[ $keys[0] ];
		}
		return null;
	}

	/**
	 * Check if the field has multiple returns.
	 *
	 * @since  1.0.0
	 * 
	 * @param  array   $field Field object.
	 * @return boolean        Is has multiple returns.
	 */
	public static function has_multiple_values( $field ) {
		$result = false;
		if ( 'checkbox' === $field['type'] ) {
			$result = true;
		} elseif ( 'relationship' === $field['type'] ) {
			$result = true;
		} elseif ( 'taxonomy' === $field['type'] && ( "checkbox" === $field['field_type'] || "multi_select" === $field['field_type'] ) ) {
			$result = true;
		} elseif ( isset( $field['multiple'] ) ) {
			$result = boolval( $field['multiple'] );
		}
		return apply_filters( 'acf_field_blocks_field_has_multiple_returns', $result );
	}

	/**
	 * Get the formatted value
	 *
	 * @since  1.1.2
	 * 
	 * @param  mixed  $raw_value Raw field value
	 * @param  array  $field     Field object
	 * @return mixed             Formatted value of the field.
	 */
	public static function get_formatted_value( $raw_value, $field  ) {
		if ( isset( $field['choices'] ) && ! empty( $raw_value ) ) {
			if ( is_array( $raw_value ) ) {
				return array_map( function( $val ) use ( $field ) {
					return [
						'value' => $val,
						'label' => $field['choices'][ $val ]
					];
				}, $raw_value );
			} else {
				return [
					'value' => $raw_value,
					'label' => $field['choices'][ $raw_value ]
				];
			}
		} elseif ( 'post_object' === $field['type'] || 'relationship' === $field['type'] ) {
			if ( is_array( $raw_value ) ) {
				return array_map( 'get_post', $raw_value );
			} elseif ( ! empty( $raw_value ) ) {
				return get_post( $raw_value );
			}
		} elseif ( 'taxonomy' === $field['type'] ) {
			if ( is_array( $raw_value ) ) {
				return array_map( 'get_term', $raw_value );
			} elseif ( ! empty( $raw_value ) ) {
				return get_term( $raw_value );
			}
		} elseif ( 'page_link' === $field['type'] ) {
			if ( is_array( $raw_value ) ) {
				return array_map( function( $val ) {
					if ( is_numeric( $val ) ) {
						return get_permalink( $val );
					}
					return $val;
				}, $raw_value );
			} elseif ( ! empty( $raw_value ) && is_numeric( $raw_value ) ) {
				return get_permalink( $raw_value );
			}
		} elseif ( in_array( $field['type'], [ 'date_picker','datetime_picker','time_picker' ] ) && ! empty( $raw_value ) ) {
			return gmdate( $field['return_format'], strtotime( $raw_value ) );
		} elseif ( 'user' === $field['type'] ) {
			if ( is_array( $raw_value ) ) {
				return array_map( function( $val ) {
					if ( is_numeric( $val ) ) {
						$user = get_userdata( $val );
						if ( $user ) {
							$return = [
								'ID'            => $user->data->ID,
								'user_email'    => $user->data->user_email,
								'user_url'      => $user->data->user_url,
								'display_name'  => $user->data->display_name,
								'user_nicename' => $user->data->user_nicename,
								'user_login'    => $user->data->user_login
							];
							return $return;
						}
					}
					return $val;
				}, $raw_value );
			} elseif ( ! empty( $raw_value ) && is_numeric( $raw_value ) ) {
				$user = get_userdata( $raw_value );
				if ( $user ) {
					$return = [
						'ID'            => $user->data->ID,
						'user_email'    => $user->data->user_email,
						'user_url'      => $user->data->user_url,
						'display_name'  => $user->data->display_name,
						'user_nicename' => $user->data->user_nicename,
						'user_login'    => $user->data->user_login
					];
					return $return;
				}
			}
		}
		return apply_filters( 'acf_field_blocks_get_formatted_value', $raw_value, $field );
	}

}