/**
 * WordPress dependencies
 */
import {
	useBlockProps
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import {
	useDispatch
} from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	FieldSelector
} from '../../components'

export default function Edit( {
	clientId,
	attributes: {
		fieldKey,
		fieldSource
	},
	attributes,
	setAttributes,
	isSelected,
	context
} ) {

	const {
		replaceBlock
	} = useDispatch( 'core/block-editor' );

	const loadField = (type,attrs={}) => {
		if ( fieldKey && type ) {
			const insertedBlock = createBlock( `acf-field-blocks/acf-${type}`, {
				fieldKey,
				fieldSource,
				...attrs
			} );
			replaceBlock( clientId, insertedBlock )
		}
	}
	
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			{ ! isSelected ? 'ACF Field' : (
				<FieldSelector
					label={ __( 'ACF Field', 'acf-field-blocks' ) }
					selectedSource={ fieldSource }
					selectedField={ fieldKey }
					onSelectSource={ fieldSource => setAttributes( { fieldSource } ) }
					onSelectField={ fieldKey => setAttributes( { fieldKey } ) }
					context={ context }
					clientId={ clientId }
					onLoadField={ loadField }
				/>
			) }
		</div>
	)
};