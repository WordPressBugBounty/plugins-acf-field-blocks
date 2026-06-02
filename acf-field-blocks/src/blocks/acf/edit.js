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
import { ExternalLink } from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	FieldPickerModal
} from '../../components'
import { useFieldLoader } from '../../utils/use-field-loader'

export default function Edit( {
	clientId,
	attributes: {
		fieldKey,
		fieldSource,
		fieldSourceValue,
		fieldSourceMeta
	},
	isSelected,
	context
} ) {

	const {
		removeBlock
	} = useDispatch( 'core/block-editor' );

	const loadField = useFieldLoader( clientId, null );

	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			{ __( 'ACF Field', 'acf-field-blocks' ) }
			{ isSelected && (
				<FieldPickerModal
					title={ __( 'Load an ACF Field', 'acf-field-blocks' ) }
					initialSource={ fieldSource }
					initialSourceValue={ fieldSourceValue }
					initialSourceMeta={ fieldSourceMeta }
					initialField={ fieldKey }
					context={ context }
					clientId={ clientId }
					onClose={ () => removeBlock( clientId ) }
					onCommit={ ( blockSlug, extraAttrs, fieldAttrs ) =>
						loadField( blockSlug, extraAttrs, fieldAttrs )
					}
					footerStart={
						<ExternalLink
							href="https://www.acffieldblocks.com/documentation/getting-started/how-to-use/?utm_source=fieldpicker&utm_medium=wp%20block%20editor&utm_campaign=BlocksforACFFields%20Documentation"
							className="acf-field-blocks-picker-modal__doc-link"
						>
							{ __( 'Documentation', 'acf-field-blocks' ) }
						</ExternalLink>
					}
				/>
			) }
		</div>
	)
};
