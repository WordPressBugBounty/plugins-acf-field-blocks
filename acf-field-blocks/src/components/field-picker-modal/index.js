import { Modal, Notice } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import FieldSelector from '../field-selector';
import './editor.scss';

const FieldPickerModal = ( {
	title = __( 'Load an ACF Field', 'acf-field-blocks' ),
	initialSource = '',
	initialSourceValue = '',
	initialSourceMeta = {},
	initialField = '',
	context,
	clientId,
	repeaterFields = 'hide',
	warning = null,
	footerStart = null,
	onClose,
	onCommit,
} ) => {

	const [ source, setSource ]           = useState( initialSource );
	const [ sourceValue, setSourceValue ] = useState( initialSourceValue );
	const [ sourceMeta, setSourceMeta ]   = useState( initialSourceMeta );
	const [ fieldKey, setFieldKey ]       = useState( initialField );

	const handleLoadField = ( blockSlug, extraAttrs = {} ) => {
		onCommit( blockSlug, extraAttrs, {
			fieldKey,
			fieldSource: source,
			fieldSourceValue: sourceValue,
			fieldSourceMeta: sourceMeta,
		} );
	};

	return (
		<Modal
			title={ title }
			onRequestClose={ onClose }
			className="acf-field-blocks-picker-modal"
		>
			{ warning && (
				<Notice
					status="warning"
					isDismissible={ false }
					className="acf-field-blocks-picker-modal__warning"
				>
					{ warning }
				</Notice>
			) }
			<FieldSelector
				className="acf-field-selector--vertical"
				selectedSource={ source }
				selectedSourceValue={ sourceValue }
				selectedSourceMeta={ sourceMeta }
				selectedField={ fieldKey }
				onSelectSource={ setSource }
				onSelectSourceValue={ setSourceValue }
				onSelectSourceMeta={ setSourceMeta }
				onSelectField={ setFieldKey }
				context={ context }
				clientId={ clientId }
				repeaterFields={ repeaterFields }
				footerStart={ footerStart }
				onLoadField={ handleLoadField }
			/>
		</Modal>
	);
};

export default FieldPickerModal;
