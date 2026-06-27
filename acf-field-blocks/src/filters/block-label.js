/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useFieldsLoader } from '../functions';

const SKIP = new Set( [
	'acf-field-blocks/acf',
	'acf-field-blocks/acf-repeater-item',
] );

function isTargetBlock( name ) {
	return (
		typeof name === 'string' &&
		name.startsWith( 'acf-field-blocks/' ) &&
		! SKIP.has( name )
	);
}

export function getAcfBlockLabel( attributes ) {
	if ( attributes?.fieldLabel ) {
		return `ACF: ${ attributes.fieldLabel }`;
	}
	return undefined;
}

addFilter(
	'blocks.registerBlockType',
	'acf-field-blocks/inject-field-label',
	( settings, name ) => {
		if ( ! isTargetBlock( name ) ) {
			return settings;
		}
		return {
			...settings,
			attributes: {
				...( settings.attributes || {} ),
				fieldLabel: { type: 'string', default: '' },
			},
			__experimentalLabel: getAcfBlockLabel,
		};
	}
);

function FieldLabelSync( { attributes, setAttributes, context } ) {
	const { fieldKey, fieldSource, fieldSourceValue, fieldLabel } = attributes;

	const { getField, isLoadingFields } = useFieldsLoader(
		fieldSource || '',
		context,
		fieldSourceValue
	);

	useEffect( () => {
		if ( ! fieldKey ) {
			if ( fieldLabel ) {
				setAttributes( { fieldLabel: '' } );
			}
			return;
		}
		if ( isLoadingFields ) {
			return;
		}
		const field = getField( fieldKey );
		const nextLabel = field?.full_label || '';
		if ( nextLabel && nextLabel !== fieldLabel ) {
			setAttributes( { fieldLabel: nextLabel } );
		}
	}, [ fieldKey, fieldSource, fieldSourceValue, isLoadingFields ] );

	return null;
}

const withFieldLabelSync = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! isTargetBlock( props.name ) ) {
			return <BlockEdit { ...props } />;
		}
		return (
			<>
				<FieldLabelSync
					attributes={ props.attributes }
					setAttributes={ props.setAttributes }
					context={ props.context }
				/>
				<BlockEdit { ...props } />
			</>
		);
	},
	'withAcfFieldLabelSync'
);

addFilter(
	'editor.BlockEdit',
	'acf-field-blocks/sync-field-label',
	withFieldLabelSync
);
