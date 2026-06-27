import { useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { useFieldsLoader } from '../../functions';
import { useFieldLoader } from '../../utils/use-field-loader';
import FieldPickerModal from '../field-picker-modal';
import { useSourceLabel } from './use-source-label';
import { useSourceDetail } from './use-source-detail';

import './editor.scss';

const FieldSummary = ( {
	fieldSource,
	fieldSourceValue = '',
	fieldSourceMeta = {},
	fieldKey,
	setAttributes,
	clientId,
	blockName,
	context,
	repeaterFields = 'hide',
} ) => {

	const [ isPickerOpen, setIsPickerOpen ] = useState( false );

	const sourceLabel  = useSourceLabel( fieldSource );
	const sourceDetail = useSourceDetail( fieldSource, fieldSourceValue, fieldSourceMeta );

	const { getField, isLoadingFields } = useFieldsLoader( fieldSource, context, fieldSourceValue );
	const field = fieldKey ? getField( fieldKey ) : null;
	let fieldLabel = '';
	if ( fieldKey ) {
		if ( isLoadingFields ) {
			fieldLabel = __( 'Loading…', 'acf-field-blocks' );
		} else {
			fieldLabel = field?.full_label || field?.label || __( '(unknown field)', 'acf-field-blocks' );
		}
	}

	const loadField = useFieldLoader( clientId, blockName, setAttributes );

	const handleCommit = ( blockSlug, extraAttrs, fieldAttrs ) => {
		setIsPickerOpen( false );
		loadField( blockSlug, extraAttrs, fieldAttrs );
	};

	const noneNode = <em className="acf-field-blocks-field-summary__none">{ __( '(none)', 'acf-field-blocks' ) }</em>;

	return (
		<div className="acf-field-blocks-field-summary">
			<dl className="acf-field-blocks-field-summary__list">
				<dt className="acf-field-blocks-field-summary__label">{ __( 'Source', 'acf-field-blocks' ) }</dt>
				<dd className="acf-field-blocks-field-summary__value">
					{ sourceLabel || noneNode }
					{ sourceDetail && (
						<span className="acf-field-blocks-field-summary__detail">{ sourceDetail }</span>
					) }
				</dd>
				<dt className="acf-field-blocks-field-summary__label">{ __( 'Field', 'acf-field-blocks' ) }</dt>
				<dd className="acf-field-blocks-field-summary__value">
					{ fieldLabel || noneNode }
				</dd>
			</dl>

			<Button
				variant="secondary"
				size="compact"
				onClick={ () => setIsPickerOpen( true ) }
			>
				{ __( 'Replace Field', 'acf-field-blocks' ) }
			</Button>

			{ isPickerOpen && (
				<FieldPickerModal
					title={ __( 'Replace ACF Field', 'acf-field-blocks' ) }
					initialSource={ fieldSource }
					initialSourceValue={ fieldSourceValue }
					initialSourceMeta={ fieldSourceMeta }
					initialField={ fieldKey }
					context={ context }
					clientId={ clientId }
					repeaterFields={ repeaterFields }
					warning={ __(
						'Loading a different field may replace this block. Customizations could be lost.',
						'acf-field-blocks'
					) }
					onClose={ () => setIsPickerOpen( false ) }
					onCommit={ handleCommit }
				/>
			) }
		</div>
	);
};

export default FieldSummary;
