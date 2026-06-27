import { useEffect, useRef } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

import FieldSourceControl from '../field-source-control';
import FieldKeyControl from '../field-key-control';
import { sourceFamily } from '../../functions';

import './editor.scss';

const FieldSettings = ({
	fieldSource,
	fieldSourceValue,
	fieldSourceMeta = {},
	fieldKey,
	onChangeFieldSource,
	onChangeFieldSourceValue,
	onChangeFieldSourceMeta = () => {},
	onChangeFieldKey,
	filterBy = {},
	repeaterFields = 'both',
	context,
	clientId,
	sourceHelp = __( 'Select the object where the field is attached.', 'acf-field-blocks' ),
	fieldLabel = __( 'Field Name', 'acf-field-blocks' ),
	fieldHelp  = __( 'Select a custom field to load', 'acf-field-blocks' ),
}) => {

	const prevSourceRef = useRef( fieldSource );

	useEffect( () => {
		const prevFamily = sourceFamily( prevSourceRef.current );
		const nextFamily = sourceFamily( fieldSource );
		if ( prevFamily !== nextFamily ) {
			onChangeFieldSourceValue( '' );
			onChangeFieldSourceMeta( {} );
		}
		prevSourceRef.current = fieldSource;
	}, [ fieldSource ] );

	const sourceValueControl = applyFilters(
		'acf-field-blocks.fieldSettings.sourceValueControl',
		null,
		{
			source: fieldSource,
			value: fieldSourceValue,
			onChange: onChangeFieldSourceValue,
			meta: fieldSourceMeta,
			onChangeMeta: onChangeFieldSourceMeta,
		}
	);

	return (
		<div className="acf-field-blocks-field-settings">
			<FieldSourceControl
				value={ fieldSource }
				onChange={ onChangeFieldSource }
				clientId={ clientId }
				context={ context }
				help={ sourceHelp }
				repeaterFields={ repeaterFields }
			/>
			{ sourceValueControl }
			<FieldKeyControl
				label={ fieldLabel }
				source={ fieldSource }
				sourceMeta={ fieldSourceMeta }
				value={ fieldKey }
				onChange={ onChangeFieldKey }
				context={ context }
				filterBy={ filterBy }
				help={ fieldHelp }
			/>
		</div>
	);
};

export default FieldSettings;
