import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import {
	useFieldsLoader,
	getSpecificSourceOptions
} from '../../functions';

export function useSourceLabel( fieldSource ) {

	const { allFieldGroups } = useSelect( select => ( {
		allFieldGroups: select( 'acf-field-blocks/data' ).getAllFieldGroups()
	} ), [] );

	const repeaterKey = ( 'string' === typeof fieldSource && fieldSource.startsWith( 'repeater|' ) )
		? fieldSource.split( '|' )[ 1 ].split( '/' ).pop()
		: '';
	const { getField } = useFieldsLoader( 'current_post' );
	const repeaterField = repeaterKey ? getField( repeaterKey ) : null;

	if ( ! fieldSource ) {
		return '';
	}

	switch ( fieldSource ) {
		case 'current_post':
			return __( 'Current Post', 'acf-field-blocks' );
		case 'current_term':
			return __( 'Current Term', 'acf-field-blocks' );
		case 'current_user':
			return __( 'Current User', 'acf-field-blocks' );
		case 'option':
			return __( 'Options', 'acf-field-blocks' );
		case 'url_param':
			return __( 'URL Parameter', 'acf-field-blocks' );
	}

	if ( fieldSource.startsWith( 'specific|' ) ) {
		const match = getSpecificSourceOptions( allFieldGroups ).find( o => o.value === fieldSource );
		if ( match ) {
			return match.label;
		}
	}

	if ( fieldSource.startsWith( 'repeater|' ) ) {
		return repeaterField?.full_label || repeaterField?.label || __( 'Repeater', 'acf-field-blocks' );
	}

	return fieldSource;
}
